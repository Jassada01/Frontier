const db = require("../config/dbConfig");

exports.addEirMatch = (req, res) => {
  const { eir_in, eir_out, is_active } = req.body;

  db.query(
    `INSERT INTO eir_match (eir_in, eir_out, is_active) VALUES (?, ?, ?)`,
    [eir_in, eir_out, is_active || 1],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error adding new EIR match", error: err });
        return;
      }
      res.send({
        message: "EIR match added successfully",
        match_id: results.insertId,
      });
    }
  );
};

exports.getEirMatch = (req, res) => {
  const { entry_type, eir_id } = req.query;

  let query = `SELECT a.*, b.receipt_no AS eir_in_no, c.receipt_no as eir_out_no FROM eir_match a
      LEFT JOIN equipment_interchange_receipt b ON  a.eir_in = b.id
      LEFT JOIN equipment_interchange_receipt c ON  a.eir_out= c.id
      WHERE is_active = 1`;
  let params = [];

  if (entry_type === "IN") {
    query += ` AND eir_in = ?`;
    params.push(eir_id);
  } else if (entry_type === "OUT") {
    query += ` AND eir_out = ?`;
    params.push(eir_id);
  } else {
    res.status(400).send({ message: "Invalid entry_type" });
    return;
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving EIR match information",
        error: err,
      });
      return;
    }
    res.send(results);
  });
};

exports.updateEirMatch = (req, res) => {
  const { match_id } = req.params;
  const { eir_in, eir_out, is_active } = req.body;

  db.query(
    `UPDATE eir_match SET 
            eir_in = ?,
            eir_out = ?,
            is_active = ?
        WHERE id = ?`,
    [eir_in, eir_out, is_active, match_id],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error updating EIR match", error: err });
        return;
      }
      res.send({
        message: "EIR match updated successfully",
      });
    }
  );
};
// Existing endpoints...

exports.deleteEirMatch = (req, res) => {
  const { eir_id, type } = req.body;

  let query = "";
  if (type === "IN") {
    query = `DELETE FROM eir_match WHERE eir_in = ?`;
  } else if (type === "OUT") {
    query = `DELETE FROM eir_match WHERE eir_out = ?`;
  } else {
    res.status(400).send({ message: "Invalid type" });
    return;
  }

  db.query(query, [eir_id], (err, results) => {
    if (err) {
      res.status(500).send({
        message: "Error deleting EIR match",
        error: err,
      });
      return;
    }
    res.send({
      message: "EIR match deleted successfully",
      affectedRows: results.affectedRows,
    });
  });
};

// Export other existing endpoints...

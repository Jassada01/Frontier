const db = require("../config/dbConfig");

exports.getDetentionLogs = (req, res) => {
  const { EIR_ID } = req.query;
  let query = `SELECT * FROM detention_logs`;
  let params = [];

  if (EIR_ID) {
    query += ` WHERE EIR_ID = ?`;
    params.push(EIR_ID);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error retrieving detention logs", error: err });
    }
    res.send(results);
  });
};

exports.insertOrUpdateDetentionLog = (req, res) => {
  const { EIR_ID, detention_datetime, remark } = req.body;

  if (!EIR_ID || !detention_datetime) {
    return res
      .status(400)
      .send({ message: "EIR_ID and detention_datetime are required" });
  }

  // Step 1: Delete existing log with the given EIR_ID
  const deleteQuery = `DELETE FROM detention_logs WHERE EIR_ID = ?`;
  const deleteParams = [EIR_ID];

  db.query(deleteQuery, deleteParams, (deleteErr) => {
    if (deleteErr) {
      return res
        .status(500)
        .send({
          message: "Error deleting existing detention log",
          error: deleteErr,
        });
    }

    // Step 2: Insert new log
    const insertQuery = `INSERT INTO detention_logs (EIR_ID, detention_datetime, remark) VALUES (?, ?, ?)`;
    const insertParams = [EIR_ID, detention_datetime, remark];

    db.query(insertQuery, insertParams, (insertErr, results) => {
      if (insertErr) {
        return res
          .status(500)
          .send({ message: "Error inserting detention log", error: insertErr });
      }
      res.send({
        message: "Detention log inserted successfully",
        id: results.insertId,
      });
    });
  });
};

exports.updateDetentionLog = (req, res) => {
  const { id, EIR_ID, detention_datetime, remark } = req.body;

  if (!id || !EIR_ID || !detention_datetime) {
    return res
      .status(400)
      .send({ message: "ID, EIR_ID, and detention_datetime are required" });
  }

  const query = `UPDATE detention_logs SET EIR_ID = ?, detention_datetime = ?, remark = ? WHERE id = ?`;
  const params = [EIR_ID, detention_datetime, remark, id];

  db.query(query, params, (err, results) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error updating detention log", error: err });
    }
    res.send({ message: "Detention log updated successfully" });
  });
};

exports.deleteDetentionLog = (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).send({ message: "ID is required" });
  }

  const query = `DELETE FROM detention_logs WHERE id = ?`;
  const params = [id];

  db.query(query, params, (err, results) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error deleting detention log", error: err });
    }
    res.send({ message: "Detention log deleted successfully" });
  });
};

// clientFreeDropPeriodController.js
const db = require("../config/dbConfig");

// Add client free drop period
exports.addClientFreeDropPeriod = (req, res) => {
  const { client_id, free_period, expire_date, is_active } = req.body;

  db.query(
    `INSERT INTO client_free_drop_period (
      client_id, 
      free_period, 
      expire_date, 
      is_active
    ) VALUES (?, ?, ?, ?)`,
    [
      client_id,
      free_period,
      expire_date,
      is_active || 1, // ค่าเริ่มต้นเป็น active
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({
          message: "Error adding client free drop period",
          error: err,
        });
        return;
      }
      res.send({
        message: "Client free drop period added successfully",
        id: results.insertId,
      });
    }
  );
};

// Get client free drop period
exports.getClientFreeDropPeriod = (req, res) => {
  const { id, client_id, active } = req.query;

  let query = `SELECT a.*, b.name FROM client_free_drop_period a LEFT JOIN client b ON a.client_id = b.client_id WHERE 1=1`;
  let params = [];

  if (id) {
    query += ` AND id = ?`;
    params.push(id);
  }

  if (client_id) {
    query += ` AND client_id = ?`;
    params.push(client_id);
  }

  if (active !== undefined) {
    query += ` AND is_active = ?`;
    params.push(active === "true" ? 1 : 0);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving client free drop period",
        error: err,
      });
      return;
    }
    res.send(results);
  });
};

// Update client free drop period
exports.updateClientFreeDropPeriod = (req, res) => {
  const { id } = req.params;
  const { client_id, free_period, expire_date, is_active } = req.body;

  db.query(
    `UPDATE client_free_drop_period SET 
      client_id = ?, 
      free_period = ?, 
      expire_date = ?, 
      is_active = ? 
    WHERE id = ?`,
    [client_id, free_period, expire_date, is_active, id],
    (err, results) => {
      if (err) {
        res.status(500).send({
          message: "Error updating client free drop period",
          error: err,
        });
        return;
      }
      res.send({
        message: "Client free drop period updated successfully",
      });
    }
  );
};

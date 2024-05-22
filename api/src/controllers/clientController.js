const db = require("../config/dbConfig");

exports.addClient = (req, res) => {
  const {
    client_code,
    name,
    branch,
    address,
    billing_address,
    tax_id,
    contact_person,
    phone,
    email,
    attribute1,
    attribute2,
    attribute3,
    attribute4,
    attribute5,
    line_token,
    is_active,
    remark,
  } = req.body;

  db.query(
    `INSERT INTO client (
      client_code,
      name,
      branch,
      address,
      billing_address,
      tax_id,
      contact_person,
      phone,
      email,
      attribute1,
      attribute2,
      attribute3,
      attribute4,
      attribute5,
      line_token,
      is_active,
      remark
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      client_code,
      name,
      branch,
      address,
      billing_address,
      tax_id,
      contact_person,
      phone,
      email,
      attribute1,
      attribute2,
      attribute3,
      attribute4,
      attribute5,
      line_token,
      is_active || 1,
      remark,
    ],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error adding new client", error: err });
        return;
      }
      res.send({
        message: "Client added successfully",
        client_id: results.insertId,
      });
    }
  );
};

exports.getClient = (req, res) => {
  const { client_id } = req.query;

  let query = `SELECT * FROM client`;
  let params = [];

  if (client_id) {
    query += ` WHERE client_id = ?`;
    params.push(client_id);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({ message: "Error retrieving client information", error: err });
      return;
    }
    res.send(results);
  });
};

exports.updateClient = (req, res) => {
  const { client_id } = req.params;
  const {
    client_code,
    name,
    branch,
    address,
    billing_address,
    tax_id,
    contact_person,
    phone,
    email,
    attribute1,
    attribute2,
    attribute3,
    attribute4,
    attribute5,
    line_token,
    is_active,
    remark,
  } = req.body;

  db.query(
    `UPDATE client SET 
      client_code = ?,
      name = ?,
      branch = ?,
      address = ?,
      billing_address = ?,
      tax_id = ?,
      contact_person = ?,
      phone = ?,
      email = ?,
      attribute1 = ?,
      attribute2 = ?,
      attribute3 = ?,
      attribute4 = ?,
      attribute5 = ?,
      line_token = ?,
      is_active = ?,
      remark = ?
    WHERE client_id = ?`,
    [
      client_code,
      name,
      branch,
      address,
      billing_address,
      tax_id,
      contact_person,
      phone,
      email,
      attribute1,
      attribute2,
      attribute3,
      attribute4,
      attribute5,
      line_token,
      is_active || 1,
      remark,
      client_id
    ],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error updating client", error: err });
        return;
      }
      res.send({
        message: "Client updated successfully",
      });
    }
  );
};

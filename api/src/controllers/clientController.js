const db = require("../config/dbConfig");

exports.addClient = (req, res) => {
  const {
    client_code,
    name,
    name_eng,
    branch,
    branch_eng,
    address,
    billing_address,
    billing_address_eng,
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
    default_language,
    default_payment_method,
    is_active,
    remark,
  } = req.body;

  db.query(
    `INSERT INTO client (
      client_code,
      name,
      name_eng,
      branch,
      branch_eng,
      address,
      billing_address,
      billing_address_eng,
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
      default_language,
      default_payment_method,
      is_active,
      remark
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      client_code,
      name,
      name_eng,
      branch,
      branch_eng,
      address,
      billing_address,
      billing_address_eng,
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
      default_language || "TH",
      default_payment_method,
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
  const { client_id, active } = req.query;

  let query = `SELECT * FROM client WHERE 1=1`;
  let params = [];

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
    name_eng,
    branch,
    branch_eng,
    address,
    billing_address,
    billing_address_eng,
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
    default_language,
    default_payment_method,
    is_active,
    remark,
  } = req.body;

  db.query(
    `UPDATE client SET 
      client_code = ?,
      name = ?,
      name_eng = ?,
      branch = ?,
      branch_eng = ?,
      address = ?,
      billing_address = ?,
      billing_address_eng = ?,
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
      default_language = ?,
      default_payment_method = ?,
      is_active = ?,
      remark = ?
    WHERE client_id = ?`,
    [
      client_code,
      name,
      name_eng,
      branch,
      branch_eng,
      address,
      billing_address,
      billing_address_eng,
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
      default_language,
      default_payment_method,
      is_active || 1,
      remark,
      client_id,
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error updating client", error: err });
        return;
      }
      res.send({
        message: "Client updated successfully",
      });
    }
  );
};

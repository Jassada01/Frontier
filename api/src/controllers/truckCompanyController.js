const db = require("../config/dbConfig");

exports.addTruckCompany = (req, res) => {
  const {
    company_name,
    short_name,
    address,
    tax_id,
    contact_person,
    phone_number,
    line_id,
    active,
  } = req.body;

  db.query(
    `INSERT INTO truck_companies (
            company_name,
            short_name,
            address,
            tax_id,
            contact_person,
            phone_number,
            line_id,
            active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      company_name,
      short_name,
      address,
      tax_id,
      contact_person,
      phone_number,
      line_id,
      active || true,
    ],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error adding new truck company", error: err });
        return;
      }
      res.send({
        message: "Truck company added successfully",
        company_id: results.insertId,
      });
    }
  );
};

exports.getTruckCompanies = (req, res) => {
  const { id, active } = req.query;

  let query = `SELECT * FROM truck_companies WHERE 1=1`;
  let params = [];

  if (id) {
    query += ` AND id = ?`;
    params.push(id);
  }

  if (active !== undefined) {
    query += ` AND active = ?`;
    params.push(active === "true" ? 1 : 0);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving truck company information",
        error: err,
      });
      return;
    }
    res.send(results);
  });
};

exports.updateTruckCompany = (req, res) => {
  const { company_id } = req.params;
  const {
    company_name,
    short_name,
    address,
    tax_id,
    contact_person,
    phone_number,
    line_id,
    active,
  } = req.body;

  db.query(
    `UPDATE truck_companies SET 
            company_name = ?,
            short_name = ?,
            address = ?,
            tax_id = ?,
            contact_person = ?,
            phone_number = ?,
            line_id = ?,
            active = ?
        WHERE id = ?`,
    [
      company_name,
      short_name,
      address,
      tax_id,
      contact_person,
      phone_number,
      line_id,
      active,
      company_id,
    ],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error updating truck company", error: err });
        return;
      }
      res.send({
        message: "Truck company updated successfully",
      });
    }
  );
};

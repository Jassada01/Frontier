const db = require("../config/dbConfig");

exports.addDriver = (req, res) => {
  const {
    driver_name,
    phone_number,
    license_plate,
    province,
    truck_company_id,
    truck_company_name,
    driver_image_path,
    truck_image_path,
    attr1,
    attr2,
    attr3,
    attr4,
    attr5,
    is_active,
  } = req.body;

  db.query(
    `INSERT INTO drivers (
            driver_name,
            phone_number,
            license_plate,
            province,
            truck_company_id,
            truck_company_name,
            driver_image_path,
            truck_image_path,
            attr1,
            attr2,
            attr3,
            attr4,
            attr5,
            is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      driver_name,
      phone_number,
      license_plate,
      province,
      truck_company_id,
      truck_company_name,
      driver_image_path,
      truck_image_path,
      attr1,
      attr2,
      attr3,
      attr4,
      attr5,
      is_active || 1,
    ],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error adding new driver", error: err });
        return;
      }
      res.send({
        message: "Driver added successfully",
        driver_id: results.insertId,
      });
    }
  );
};

exports.getDrivers = (req, res) => {
  const { driver_id, truck_company_id, active } = req.query;

  let query = `SELECT * FROM drivers WHERE 1=1`;
  let params = [];

  if (driver_id) {
    query += ` AND id = ?`;
    params.push(driver_id);
  }

  if (truck_company_id) {
    query += ` AND truck_company_id = ?`;
    params.push(truck_company_id);
  }

  if (active !== undefined) {
    query += ` AND is_active = ?`;
    params.push(active === "true" ? 1 : 0);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({ message: "Error retrieving driver information", error: err });
      return;
    }
    res.send(results);
  });
};

exports.updateDriver = (req, res) => {
  const { driver_id } = req.params;
  const {
    driver_name,
    phone_number,
    license_plate,
    province,
    truck_company_id,
    truck_company_name,
    driver_image_path,
    truck_image_path,
    attr1,
    attr2,
    attr3,
    attr4,
    attr5,
    is_active,
  } = req.body;

  db.query(
    `UPDATE drivers SET 
            driver_name = ?,
            phone_number = ?,
            license_plate = ?,
            province = ?,
            truck_company_id = ?,
            truck_company_name = ?,
            driver_image_path = ?,
            truck_image_path = ?,
            attr1 = ?,
            attr2 = ?,
            attr3 = ?,
            attr4 = ?,
            attr5 = ?,
            is_active = ?
        WHERE id = ?`,
    [
      driver_name,
      phone_number,
      license_plate,
      province,
      truck_company_id,
      truck_company_name,
      driver_image_path,
      truck_image_path,
      attr1,
      attr2,
      attr3,
      attr4,
      attr5,
      is_active,
      driver_id,
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error updating driver", error: err });
        return;
      }
      res.send({
        message: "Driver updated successfully",
      });
    }
  );
};

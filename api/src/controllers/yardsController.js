const db = require("../config/dbConfig");

exports.addYard = (req, res) => {
  const {
    short_name,
    yard_name,
    contact_person,
    phone_number,
    website,
    latitude,
    longitude,
    google_map_link,
    remark,
    active,
  } = req.body;

  db.query(
    `INSERT INTO yards (
            short_name,
            yard_name,
            contact_person,
            phone_number,
            website,
            latitude,
            longitude,
            google_map_link,
            remark,
            active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      short_name,
      yard_name,
      contact_person,
      phone_number,
      website,
      latitude,
      longitude,
      google_map_link,
      remark,
      active || true,
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error adding new yard", error: err });
        return;
      }
      res.send({
        message: "Yard added successfully",
        yard_id: results.insertId,
      });
    }
  );
};

exports.getYards = (req, res) => {
  const { yard_id, active } = req.query;

  let query = `SELECT * FROM yards WHERE 1=1`;
  let params = [];

  if (yard_id) {
    query += ` AND id = ?`;
    params.push(yard_id);
  }

  if (active !== undefined) {
    query += ` AND active = ?`;
    params.push(active === "true" ? 1 : 0);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({ message: "Error retrieving yard information", error: err });
      return;
    }
    res.send(results);
  });
};

exports.updateYard = (req, res) => {
  const { yard_id } = req.params;
  const {
    short_name,
    yard_name,
    contact_person,
    phone_number,
    website,
    latitude,
    longitude,
    google_map_link,
    remark,
    active,
  } = req.body;

  db.query(
    `UPDATE yards SET 
            short_name = ?,
            yard_name = ?,
            contact_person = ?,
            phone_number = ?,
            website = ?,
            latitude = ?,
            longitude = ?,
            google_map_link = ?,
            remark = ?,
            active = ?
        WHERE id = ?`,
    [
      short_name,
      yard_name,
      contact_person,
      phone_number,
      website,
      latitude,
      longitude,
      google_map_link,
      remark,
      active,
      yard_id,
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error updating yard", error: err });
        return;
      }
      res.send({
        message: "Yard updated successfully",
      });
    }
  );
};

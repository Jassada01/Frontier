const db = require("../config/dbConfig");

exports.addZone = (req, res) => {
  const {
    yard_name,
    zone,
    details,
    contact,
    path_map,
    google_map_link,
    latitude,
    longitude,
    max_capacity,
    active,
  } = req.body;

  db.query(
    `INSERT INTO zones (
            yard_name,
            zone,
            details,
            contact,
            path_map,
            google_map_link,
            latitude,
            longitude,
            max_capacity,
            active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      yard_name,
      zone,
      details,
      contact,
      path_map,
      google_map_link,
      latitude,
      longitude,
      max_capacity,
      active || true,
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error adding new zone", error: err });
        return;
      }
      res.send({
        message: "Zone added successfully",
        zone_id: results.insertId,
      });
    }
  );
};

exports.getZones = (req, res) => {
  const { zone_id, active } = req.query;

  let query = `SELECT * FROM zones WHERE 1=1`;
  let params = [];

  if (zone_id) {
    query += ` AND id = ?`;
    params.push(zone_id);
  }

  if (active !== undefined) {
    query += ` AND active = ?`;
    params.push(active === "true" ? 1 : 0);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({ message: "Error retrieving zone information", error: err });
      return;
    }
    res.send(results);
  });
};

exports.updateZone = (req, res) => {
  const { zone_id } = req.params;
  const {
    yard_name,
    zone,
    details,
    contact,
    path_map,
    google_map_link,
    latitude,
    longitude,
    max_capacity,
    active,
  } = req.body;

  db.query(
    `UPDATE zones SET 
            yard_name = ?,
            zone = ?,
            details = ?,
            contact = ?,
            path_map = ?,
            google_map_link = ?,
            latitude = ?,
            longitude = ?,
            max_capacity = ?,
            active = ?
        WHERE id = ?`,
    [
      yard_name,
      zone,
      details,
      contact,
      path_map,
      google_map_link,
      latitude,
      longitude,
      max_capacity,
      active,
      zone_id,
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error updating zone", error: err });
        return;
      }
      res.send({
        message: "Zone updated successfully",
      });
    }
  );
};

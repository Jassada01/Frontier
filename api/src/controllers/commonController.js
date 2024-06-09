const db = require("../config/dbConfig");

exports.getProvinces = (req, res) => {
  const { province_id } = req.query;

  let query = `SELECT * FROM provinces`;
  let params = [];

  if (province_id) {
    query += ` WHERE id = ?`;
    params.push(province_id);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({ message: "Error retrieving province information", error: err });
      return;
    }
    res.send(results);
  });
};

exports.getConditions = (req, res) => {
  let query = `SELECT * FROM conditions WHERE active = 1`;

  db.query(query, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({
          message: "Error retrieving condition information",
          error: err,
        });
      return;
    }
    res.send(results);
  });
};

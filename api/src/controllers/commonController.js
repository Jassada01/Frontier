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

exports.getProductPrices = (req, res) => {
  const { agent_id, yards_id, size } = req.query;

  if (!agent_id || !yards_id || !size) {
    return res.status(400).send({ message: "Missing required query parameters" });
  }

  const query = `
    SELECT 
      a.id as price_list_id, 
      a.name_th, 
      a.name_eng, 
      IFNULL(b.price, a.price) AS price, 
      CASE WHEN b.price IS NOT NULL THEN "ราคาอ้างอิงจากลาน" ELSE "" END AS remark 
    FROM 
      price_list a 
      LEFT JOIN price_list_custom b 
        ON a.id = b.main_price_list_id 
        AND b.agent_id = ? 
        AND b.yards_id = ? 
        AND b.size = ?`;

  const params = [agent_id, yards_id, size];

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).send({ message: "Error retrieving product prices", error: err });
    }
    res.send(results);
  });
};

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
      res.status(500).send({
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
    return res
      .status(400)
      .send({ message: "Missing required query parameters" });
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
      return res
        .status(500)
        .send({ message: "Error retrieving product prices", error: err });
    }
    res.send(results);
  });
};

exports.getAgentEirCount = (req, res) => {
  const query = `
    SELECT a.agent_id, a.agent_code, a.image_path, kk.size_type, IFNULL(kk.cnt, 0) AS CNT
    FROM agents a
    LEFT JOIN (
        SELECT eir.agent_id, eir.size_type, COUNT(*) AS cnt 
        FROM equipment_interchange_receipt eir 
        WHERE eir.entry_type = 'IN' 
        AND eir.status_id <> 2 
        AND eir.id NOT IN (SELECT em.eir_in FROM eir_match em) 
        GROUP BY eir.agent_id, eir.size_type
    ) kk 
    ON a.agent_id = kk.agent_id
    ORDER BY a.agent_id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error retrieving agent EIR count", error: err });
    }

    // Group by agent_id
    const groupedResults = results.reduce((acc, curr) => {
      const agent = acc.find((agent) => agent.agent_id === curr.agent_id);
      if (agent) {
        agent.size_types.push({
          size_type: curr.size_type,
          CNT: curr.CNT,
        });
      } else {
        acc.push({
          agent_id: curr.agent_id,
          agent_code: curr.agent_code,
          image_path: curr.image_path, // Include image_path here
          size_types: [
            {
              size_type: curr.size_type,
              CNT: curr.CNT,
            },
          ],
        });
      }
      return acc;
    }, []);

    res.send(groupedResults);
  });
};

const db = require("../config/dbConfig");

exports.addPriceCustom = (req, res) => {
  const { agent_id, yards_id, size, price, main_price_list_id } = req.body;

  db.query(
    `INSERT INTO price_list_custom (
            agent_id,
            yards_id,
            size,
            price,
            main_price_list_id
        ) VALUES (?, ?, ?, ?, ?)`,
    [agent_id, yards_id, size, price, main_price_list_id],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error adding new custom price", error: err });
        return;
      }
      res.send({
        message: "Custom price added successfully",
        price_custom_id: results.insertId,
      });
    }
  );
};

exports.getPriceCustoms = (req, res) => {
  const { price_custom_id, agent_id, yards_id, main_price_list_id } = req.query;

  let query = `SELECT * FROM price_list_custom WHERE 1=1`;
  let params = [];

  if (price_custom_id) {
    query += ` AND id = ?`;
    params.push(price_custom_id);
  }

  if (agent_id) {
    query += ` AND agent_id = ?`;
    params.push(agent_id);
  }

  if (yards_id) {
    query += ` AND yards_id = ?`;
    params.push(yards_id);
  }

  if (main_price_list_id) {
    query += ` AND main_price_list_id = ?`;
    params.push(main_price_list_id);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({
          message: "Error retrieving custom price information",
          error: err,
        });
      return;
    }
    res.send(results);
  });
};

exports.updatePriceCustom = (req, res) => {
  const { price_custom_id } = req.params;
  const { agent_id, yards_id, size, price, main_price_list_id } = req.body;

  db.query(
    `UPDATE price_list_custom SET 
            agent_id = ?,
            yards_id = ?,
            size = ?,
            price = ?,
            main_price_list_id = ?
        WHERE id = ?`,
    [agent_id, yards_id, size, price, main_price_list_id, price_custom_id],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error updating custom price", error: err });
        return;
      }
      res.send({
        message: "Custom price updated successfully",
      });
    }
  );
};

exports.deletePriceCustom = (req, res) => {
  const { price_custom_id } = req.params;

  db.query(
    `DELETE FROM price_list_custom WHERE id = ?`,
    [price_custom_id],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error deleting custom price", error: err });
        return;
      }
      res.send({
        message: "Custom price deleted successfully",
      });
    }
  );
};

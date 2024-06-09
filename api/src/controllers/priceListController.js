const db = require("../config/dbConfig");

exports.addPrice = (req, res) => {
  const { name_th, name_eng, price, note, is_active } = req.body;

  db.query(
    `INSERT INTO price_list (
            name_th,
            name_eng,
            price,
            note,
            is_active
        ) VALUES (?, ?, ?, ?, ?)`,
    [name_th, name_eng, price, note, is_active || true],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error adding new price", error: err });
        return;
      }
      res.send({
        message: "Price added successfully",
        price_id: results.insertId,
      });
    }
  );
};

exports.getPrices = (req, res) => {
  const { price_id, is_active } = req.query;

  let query = `
    SELECT 
      a.id, a.name_th, a.name_eng, a.price, a.note, a.is_active, a.attr_1, a.attr_2, a.attr_3, 
      b.id as custom_price_id, b.agent_id, b.yards_id, b.size, b.price as custom_price, 
      c.short_name as yard_short_name, d.agent_code 
    FROM price_list a 
    LEFT JOIN price_list_custom b ON a.id = b.main_price_list_id
    LEFT JOIN yards c ON b.yards_id = c.id
    LEFT JOIN agents d ON b.agent_id = d.agent_id
    WHERE 1=1
  `;
  let params = [];

  if (price_id) {
    query += ` AND a.id = ?`;
    params.push(price_id);
  }

  if (is_active !== undefined) {
    query += ` AND a.is_active = ?`;
    params.push(is_active === "true" ? 1 : 0);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({ message: "Error retrieving price information", error: err });
      return;
    }

    // Process the results to nest custom prices
    const prices = results.reduce((acc, row) => {
      const {
        id,
        name_th,
        name_eng,
        price,
        note,
        is_active,
        attr_1,
        attr_2,
        attr_3,
        custom_price_id,
        agent_id,
        yards_id,
        size,
        custom_price,
        yard_short_name,
        agent_code,
      } = row;

      let priceIndex = acc.findIndex((p) => p.id === id);
      if (priceIndex === -1) {
        acc.push({
          id,
          name_th,
          name_eng,
          price,
          note,
          is_active,
          attr_1,
          attr_2,
          attr_3,
          customprice: [],
        });
        priceIndex = acc.length - 1;
      }

      if (custom_price_id) {
        acc[priceIndex].customprice.push({
          custom_price_id,
          agent_id,
          yards_id,
          size,
          custom_price,
          yard_short_name,
          agent_code,
        });
      }

      return acc;
    }, []);

    res.send(prices);
  });
};
exports.updatePrice = (req, res) => {
  const { price_id } = req.params;
  const { name_th, name_eng, price, note, is_active } = req.body;

  db.query(
    `UPDATE price_list SET 
            name_th = ?,
            name_eng = ?,
            price = ?,
            note = ?,
            is_active = ?
        WHERE id = ?`,
    [name_th, name_eng, price, note, is_active, price_id],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error updating price", error: err });
        return;
      }
      res.send({
        message: "Price updated successfully",
      });
    }
  );
};

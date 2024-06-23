const db = require("../config/dbConfig");

exports.addAgent = (req, res) => {
  const {
    agent_code,
    company_name,
    contact_name,
    address,
    phone_number,
    email,
    other_details,
    image_path,
    active,
  } = req.body;

  db.query(
    `INSERT INTO agents (
            agent_code,
            company_name,
            contact_name,
            address,
            phone_number,
            email,
            other_details,
            image_path,
            active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      agent_code,
      company_name,
      contact_name,
      address,
      phone_number,
      email,
      other_details,
      image_path,
      active || true,
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error adding new agent", error: err });
        return;
      }
      res.send({
        message: "Agent added successfully",
        agent_id: results.insertId,
      });
    }
  );
};

exports.getAgents = (req, res) => {
  const { agent_id, active } = req.query;

  let query = `SELECT * FROM agents WHERE 1=1`;
  let params = [];

  if (agent_id) {
    query += ` AND agent_id = ?`;
    params.push(agent_id);
  }

  if (active !== undefined) {
    query += ` AND active = ?`;
    params.push(active === 'true' ? true : false);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({ message: "Error retrieving agent information", error: err });
      return;
    }
    res.send(results);
  });
};

exports.updateAgent = (req, res) => {
  const { agent_id } = req.params;
  const {
    agent_code,
    company_name,
    contact_name,
    address,
    phone_number,
    email,
    other_details,
    image_path,
    active,
  } = req.body;

  db.query(
    `UPDATE agents SET 
            agent_code = ?,
            company_name = ?,
            contact_name = ?,
            address = ?,
            phone_number = ?,
            email = ?,
            other_details = ?,
            image_path = ?,
            active = ?
        WHERE agent_id = ?`,
    [
      agent_code,
      company_name,
      contact_name,
      address,
      phone_number,
      email,
      other_details,
      image_path,
      active,
      agent_id,
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error updating agent", error: err });
        return;
      }
      res.send({
        message: "Agent updated successfully",
      });
    }
  );
};

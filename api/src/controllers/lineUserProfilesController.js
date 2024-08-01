const db = require("../config/dbConfig");

exports.addLineUserProfile = (req, res) => {
  const {
      line_user_id,
      display_name,
      picture_url,
      driverID,
      user_type,
      name,
      company_name,
      company_id,
      group_id,
      is_active
  } = req.body;

  db.query(
      `INSERT INTO line_user_profiles (
          line_user_id,
          display_name,
          picture_url,
          driverID,
          user_type,
          name,
          company_name,
          company_id,
          group_id,
          is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
          line_user_id,
          display_name,
          picture_url,
          driverID,
          user_type,
          name,
          company_name,
          company_id,
          group_id,
          is_active || true
      ],
      (err, results) => {
          if (err) {
              res.status(500).send({ message: "Error adding new line user profile", error: err });
              return;
          }
          res.send({
              message: "Line user profile added successfully",
              user_profile_id: results.insertId
          });
      }
  );
};

exports.getLineUserProfiles = (req, res) => {
  const { user_profile_id, line_user_id, user_type, active } = req.query;

  let query = `SELECT * FROM line_user_profiles WHERE 1=1`;
  let params = [];

  if (user_profile_id) {
    query += ` AND id = ?`;
    params.push(user_profile_id);
  }

  if (line_user_id) {
    query += ` AND line_user_id = ?`;
    params.push(line_user_id);
  }

  if (user_type) {
    query += ` AND user_type = ?`;
    params.push(user_type);
  }

  if (active !== undefined) {
    query += ` AND is_active = ?`;
    params.push(active === "true" ? true : false);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({ message: "Error retrieving line user profiles", error: err });
      return;
    }
    res.send(results);
  });
};


exports.updateLineUserProfile = (req, res) => {
    const { user_profile_id } = req.params;
    const {
        display_name,
        picture_url,
        driverID,
        user_type,
        name,
        company_name,
        company_id,
        group_id,
        is_active
    } = req.body;

    db.query(
        `UPDATE line_user_profiles SET 
            display_name = ?,
            picture_url = ?,
            driverID = ?,
            user_type = ?,
            name = ?,
            company_name = ?,
            company_id = ?,
            group_id = ?,
            is_active = ?
        WHERE id = ?`,
        [
            display_name,
            picture_url,
            driverID,
            user_type,
            name,
            company_name,
            company_id,
            group_id,
            is_active,
            user_profile_id
        ],
        (err, results) => {
            if (err) {
                res.status(500).send({ message: "Error updating line user profile", error: err });
                return;
            }
            res.send({
                message: "Line user profile updated successfully"
            });
        }
    );
};
const db = require("../config/dbConfig");

// Original Line user profile registration
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
    is_active,
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
      is_active || true,
    ],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error adding new line user profile", error: err });
        return;
      }
      res.send({
        message: "Line user profile added successfully",
        user_profile_id: results.insertId,
      });
    }
  );
};

// New web registration with username and password
exports.addForWeb = (req, res) => {
  const {
    line_user_id,
    username,
    password,
    display_name,
    picture_url,
    user_type,
    name,
    company_name,
    is_active,
  } = req.body;

  db.query(
    `INSERT INTO line_user_profiles (
          line_user_id,
          username,
          password,
          display_name,
          picture_url,
          user_type,
          name,
          company_name,
          is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      line_user_id,
      username,
      password,
      display_name,
      picture_url,
      user_type,
      name,
      company_name,
      is_active || true,
    ],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error adding new web user profile", error: err });
        return;
      }
      res.send({
        message: "Web user profile added successfully",
        user_profile_id: results.insertId,
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
    is_active,
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
      user_profile_id,
    ],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error updating line user profile", error: err });
        return;
      }
      res.send({
        message: "Line user profile updated successfully",
      });
    }
  );
};

// Login endpoint
exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT line_user_id, password FROM line_user_profiles WHERE username = ? AND is_active = true",
    [username],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error during login", error: err });
        return;
      }

      if (results.length === 0) {
        res.status(401).send({ message: "Invalid username or password" });
        return;
      }

      const user = results[0];

      if (password === user.password) {
        res.send({
          success: true,
          userId: user.line_user_id,
        });
      } else {
        res.status(401).send({ message: "Invalid username or password" });
      }
    }
  );
};

// Username uniqueness check middleware
exports.checkUsername = (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    next();
    return;
  }

  db.query(
    "SELECT id FROM line_user_profiles WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error checking username", error: err });
        return;
      }

      if (results.length > 0) {
        res.status(400).send({ message: "Username already exists" });
        return;
      }

      next();
    }
  );
};

// เพิ่มฟังก์ชันใหม่
exports.resetPassword = (req, res) => {
  const { user_profile_id } = req.params;
  const { current_password, new_password } = req.body;
  // ตอนนี้ current_password และ new_password จะเป็น MD5 hash แล้ว

  db.query(
    "SELECT password FROM line_user_profiles WHERE id = ?",
    [user_profile_id],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error checking password", error: err });
        return;
      }

      if (results.length === 0) {
        res.status(404).send({ message: "User not found" });
        return;
      }

      const user = results[0];

      // เปรียบเทียบ hash password
      if (current_password === user.password) {
        // อัพเดท password ใหม่ (เป็น hash แล้ว)
        db.query(
          "UPDATE line_user_profiles SET password = ? WHERE id = ?",
          [new_password, user_profile_id],
          (updateErr) => {
            if (updateErr) {
              res
                .status(500)
                .send({ message: "Error updating password", error: updateErr });
              return;
            }
            res.send({ message: "Password reset successfully" });
          }
        );
      } else {
        res.status(401).send({ message: "Current password is incorrect" });
      }
    }
  );
};

// เพิ่ม function สำหรับเพิ่ม username และ password
exports.addUsernamePassword = (req, res) => {
  const { user_profile_id } = req.params;
  const { username, password } = req.body;

  // ตรวจสอบว่า username ซ้ำหรือไม่
  db.query(
    "SELECT id FROM line_user_profiles WHERE username = ? AND id != ?",
    [username, user_profile_id],
    (err, results) => {
      if (err) {
        res.status(500).send({ 
          message: "Error checking username", 
          error: err 
        });
        return;
      }

      if (results.length > 0) {
        res.status(400).send({ message: "Username already exists" });
        return;
      }

      // ถ้า username ไม่ซ้ำ ทำการอัพเดต
      db.query(
        "UPDATE line_user_profiles SET username = ?, password = ? WHERE id = ?",
        [username, password, user_profile_id],
        (updateErr) => {
          if (updateErr) {
            res.status(500).send({ 
              message: "Error adding username and password", 
              error: updateErr 
            });
            return;
          }
          res.send({ message: "Username and password added successfully" });
        }
      );
    }
  );
};

// เพิ่มฟังก์ชันใหม่สำหรับ Admin
exports.resetPasswordForAdmin = (req, res) => {
  const { user_profile_id } = req.params;
  const { new_password } = req.body;
  // รับเฉพาะ new_password เพราะ Admin ไม่จำเป็นต้องรู้ password เดิม

  db.query(
    "UPDATE line_user_profiles SET password = ? WHERE id = ?",
    [new_password, user_profile_id],
    (err) => {
      if (err) {
        res.status(500).send({ 
          message: "Error resetting password", 
          error: err 
        });
        return;
      }
      res.send({ message: "Password reset successfully" });
    }
  );
};
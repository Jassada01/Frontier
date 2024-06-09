const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/dbConfig");

const secretKey = process.env.SECRET; // ควรเปลี่ยนเป็นค่า secret key ที่ปลอดภัย

// การสมัครสมาชิก
exports.register = async (req, res) => {
  const { username, displayName, password, position, location_image_url } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 8);
  db.query(
    "INSERT INTO users (username, display_name, password, position, location_image_url) VALUES (?, ?, ?, ?, ?)",
    [username, displayName, hashedPassword, position, location_image_url],
    (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Error registering new user", error: err });
        return;
      }
      res.send({
        message: "User registered successfully",
        user_id: results.insertId,
      });
    }
  );
};

// การล็อกอิน
exports.login = (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error fetching user", error: err });
        return;
      }
      if (
        results.length > 0 &&
        (await bcrypt.compare(password, results[0].password))
      ) {
        // สร้าง JWT token
        const token = jwt.sign(
          {
            user_id: results[0].id,
            display_name: results[0].display_name,
            position: results[0].position,
            language: results[0].language,
            image: results[0].location_image_url,
          },
          secretKey,
          { expiresIn: "24h" }
        );

        // ตั้งค่า JWT token เป็นคุกกี้
        res.cookie("token", token, { httpOnly: true });

        res.send({ message: "Logged in successfully" });
      } else {
        res.status(401).send({ message: "Authentication failed" });
      }
    }
  );
};

// ดึงข้อมูลผู้ใช้ทั้งหมด
exports.getAllUsers = (req, res) => {
  db.query(
    "SELECT id, username, display_name, position, password_expire, location_image_url, language, attr1, attr2, attr3, attr4, attr5, active, create_user, create_datetime, update_user, update_datetime FROM users",
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error fetching users", error: err });
        return;
      }
      res.send(results);
    }
  );
};

// ดึงข้อมูลผู้ใช้ตาม ID
exports.getUserById = (req, res) => {
  const userId = req.params.id;
  db.query(
    "SELECT id, username, display_name, position, password_expire, location_image_url, language, sign_img_path, attr1, attr2, attr3, attr4, attr5, active, create_user, create_datetime, update_user, update_datetime FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error fetching user", error: err });
        return;
      }
      if (results.length === 0) {
        res.status(404).send({ message: "User not found" });
        return;
      }
      res.send(results[0]);
    }
  );
};

// อัพเดตข้อมูลผู้ใช้ตาม ID
exports.updateUserById = (req, res) => {
  const userId = req.params.id;
  const {
    display_name,
    position,
    location_image_url,
    language,
    active,
    sign_img_path,
  } = req.body;

  db.query(
    "UPDATE users SET display_name = ?, position = ?, location_image_url = ?, language = ?, active = ?, sign_img_path = ? WHERE id = ?",
    [
      display_name,
      position,
      location_image_url,
      language,
      active,
      sign_img_path,
      userId,
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error updating user", error: err });
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).send({ message: "User not found" });
        return;
      }
      res.send({ message: "User updated successfully" });
    }
  );
};

// อัปเดตรหัสผ่านของผู้ใช้ตาม ID
exports.updatePasswordById = async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;

  if (!newPassword) {
    res.status(400).send({ message: "New password is required" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId],
      (err, results) => {
        if (err) {
          res
            .status(500)
            .send({ message: "Error updating password", error: err });
          return;
        }
        if (results.affectedRows === 0) {
          res.status(404).send({ message: "User not found" });
          return;
        }
        res.send({ message: "Password updated successfully" });
      }
    );
  } catch (error) {
    res.status(500).send({ message: "Error hashing password", error });
  }
};

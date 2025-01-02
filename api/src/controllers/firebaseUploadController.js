// firebaseUploadController.js
const db = require("../config/dbConfig");

exports.addFile = (req, res) => {
    const {
      type,
      sub_type,
      relate_id,
      container_id,
      file_url,
      file_name,
      file_type,
    } = req.body;
  
    // สร้าง array สำหรับเก็บชื่อ column และ values ที่จะใส่ใน query
    let columns = ['type', 'file_url', 'file_name'];
    let values = [type, file_url, file_name];
    let placeholders = ['?', '?', '?'];
  
    // เพิ่ม optional fields ถ้ามีค่ามา
    if (sub_type !== undefined) {
      columns.push('sub_type');
      values.push(sub_type);
      placeholders.push('?');
    }
  
    if (relate_id !== undefined) {
      columns.push('relate_id');
      values.push(relate_id);
      placeholders.push('?');
    }
  
    if (container_id !== undefined) {
      columns.push('container_id');
      values.push(container_id);
      placeholders.push('?');
    }
  
    if (file_type !== undefined) {
      columns.push('file_type');
      values.push(file_type);
      placeholders.push('?');
    }
  
    // สร้าง query string
    const query = `
      INSERT INTO firebase_upload_file (${columns.join(', ')}) 
      VALUES (${placeholders.join(', ')})
    `;
  
    db.query(query, values, (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error adding new file", error: err });
        return;
      }
      res.send({
        message: "File added successfully",
        file_id: results.insertId,
      });
    });
  };

exports.getFiles = (req, res) => {
  const { id, type, sub_type, relate_id } = req.query;

  let query = `SELECT * FROM firebase_upload_file WHERE 1=1`;
  let params = [];

  if (id) {
    query += ` AND id = ?`;
    params.push(id);
  }

  if (type) {
    query += ` AND type = ?`;
    params.push(type);
  }

  if (sub_type) {
    query += ` AND sub_type = ?`;
    params.push(sub_type);
  }

  if (relate_id) {
    query += ` AND relate_id = ?`;
    params.push(relate_id);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving file information",
        error: err,
      });
      return;
    }
    res.send(results);
  });
};

exports.updateFile = (req, res) => {
  const { id } = req.params;
  const {
    type,
    sub_type,
    relate_id,
    container_id,
    file_url,
    file_name,
    file_type,
  } = req.body;

  db.query(
    `UPDATE firebase_upload_file SET 
      type = ?,
      sub_type = ?,
      relate_id = ?,
      container_id = ?,
      file_url = ?,
      file_name = ?,
      file_type = ?
    WHERE id = ?`,
    [
      type,
      sub_type,
      relate_id,
      container_id,
      file_url,
      file_name,
      file_type,
      id,
    ],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error updating file", error: err });
        return;
      }
      res.send({
        message: "File updated successfully",
      });
    }
  );
};

exports.deleteFile = (req, res) => {
  const { id } = req.params;

  db.query(
    `DELETE FROM firebase_upload_file WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) {
        res.status(500).send({ message: "Error deleting file", error: err });
        return;
      }
      res.send({
        message: "File deleted successfully",
      });
    }
  );
};

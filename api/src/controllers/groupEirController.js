// groupEirController.js
const db = require("../config/dbConfig");
const { getRunningNo } = require("../services/getRunningNo");


exports.createGroupEirHeader = async (req, res) => {
  try {
    const { create_by, booking_bl } = req.body;
    const currentDate = new Date();
    const group_code = await getRunningNo("GEIR", "EG-", currentDate, 4);

    db.query(
      `INSERT INTO group_eir_header (group_code, booking_bl, create_by, update_by) 
       VALUES (?, ?, ?, ?)`,
      [group_code, booking_bl, create_by, create_by],
      (err, results) => {
        if (err) {
          res.status(500).send({ message: "Error creating group", error: err });
          return;
        }
        res.send({
          message: "Group created successfully",
          id: results.insertId,
          group_code: group_code,
        });
      }
    );
  } catch (err) {
    res.status(500).send({ message: "Error generating group code", error: err });
  }
};

exports.createGroupEirDetail = (req, res) => {
  const { group_id, eir_id } = req.body;

  db.query(
    `INSERT INTO group_eir_detail (group_id, eir_id) 
     VALUES (?, ?)`,
    [group_id, eir_id],
    (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err });
        return;
      }
      res.send({ success: true });
    }
  );
};

exports.addDetailToGroup = (req, res) => {
  const { group_id, eir_id } = req.body;

  db.query(
    `INSERT INTO group_eir_detail (group_id, eir_id) 
     VALUES (?, ?)`,
    [group_id, eir_id],
    (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err });
        return;
      }
      res.send({ success: true });
    }
  );
};

exports.deleteGroupDetail = (req, res) => {
  const { id } = req.params;

  db.query(
    `DELETE FROM group_eir_detail WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err });
        return;
      }
      res.send({ success: true });
    }
  );
};

exports.getGroupDetails = (req, res) => {
  const { group_id } = req.params;
  
  db.query(
    `SELECT 
      a.*, 
      c.id as eir_id, c.receipt_no, c.container, c.size_type, c.vessel, c.voyage,
      d.status_name_th, d.status_name_en,
      e.id as invoice_id, e.invoice_no, e.invoice_date, e.total_amount, e.status
    FROM group_eir_header a
    LEFT JOIN group_eir_detail b ON a.id = b.group_id  
    LEFT JOIN equipment_interchange_receipt c ON b.eir_id = c.id
    LEFT JOIN statuses d ON c.status_id = d.id
    LEFT JOIN invoice_header e ON c.id = e.eir_id
    WHERE a.id = ?`,
    [group_id],
    (err, results) => {
      if (err) {
        res.status(500).send({ success: false, error: err });
        return;
      }

      if (results.length === 0) {
        res.status(404).send({ success: false, message: "Group not found" });
        return;
      }

      // Restructure the data
      const response = {
        id: results[0].id,
        group_code: results[0].group_code,
        booking_bl: results[0].booking_bl,
        remark: results[0].remark,
        create_date: results[0].create_date,
        create_by: results[0].create_by,
        update_date: results[0].update_date,
        update_by: results[0].update_by,
        eirs: []
      };

      // Group by EIR
      const eirMap = new Map();
      
      results.forEach(row => {
        if (!row.eir_id) return;
        
        if (!eirMap.has(row.eir_id)) {
          eirMap.set(row.eir_id, {
            id: row.eir_id,
            receipt_no: row.receipt_no,
            container: row.container,
            size_type: row.size_type,
            vessel: row.vessel,
            voyage: row.voyage,
            status: {
              th: row.status_name_th,
              en: row.status_name_en
            },
            invoices: []
          });
        }

        if (row.invoice_id) {
          eirMap.get(row.eir_id).invoices.push({
            id: row.invoice_id,
            invoice_no: row.invoice_no,
            invoice_date: row.invoice_date,
            total_amount: row.total_amount,
            status: row.status
          });
        }
      });

      response.eirs = Array.from(eirMap.values());
      res.send({ success: true, data: response });
    }
  );
};

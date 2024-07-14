const db = require("../config/dbConfig");

exports.getInvoice = (req, res) => {
  const { id, eir_id, start_date, end_date } = req.query;

  let query = `SELECT a.*, b.receipt_no FROM invoice_header a Left join equipment_interchange_receipt b ON a.eir_id = b.id WHERE 1=1`;
  let params = [];

  if (id) {
    query += ` AND a.id = ?`;
    params.push(id);
  }

  if (eir_id) {
    query += ` AND a.eir_id = ?`;
    params.push(eir_id);
  }

  if (start_date && end_date) {
    query += ` AND a.invoice_date BETWEEN ? AND ?`;
    params.push(start_date, end_date);
  }

  // console.log(query);
  db.query(query, params, (err, headerResults) => {
    if (err) {
      res
        .status(500)
        .send({ message: "Error retrieving invoice header", error: err });
      return;
    }

    if (headerResults.length === 0) {
      res.status(404).send({ message: "Invoice not found" });
      return;
    }

    const headerId = headerResults[0].id;

    db.query(
      `SELECT * FROM invoice_detail WHERE invoice_header_id = ?`,
      [headerId],
      (err, detailResults) => {
        if (err) {
          res
            .status(500)
            .send({ message: "Error retrieving invoice details", error: err });
          return;
        }

        const response = headerResults.map((header) => {
          return {
            ...header,
            detail: detailResults.filter(
              (detail) => detail.invoice_header_id === header.id
            ),
          };
        });

        res.send(response);
      }
    );
  });
};

exports.updateInvoice = (req, res) => {
  const { id } = req.params;
  const {
    invoice_no,
    invoice_date,
    client_id,
    customer_name,
    customer_name_eng,
    customer_address,
    customer_address_eng,
    customer_address_branch,
    customer_address_branch_eng,
    tax_id,
    invoice_language,
    agent_id,
    agent_code,
    driver_id,
    driver,
    truck_license,
    truck_company,
    container,
    size_type,
    shipper,
    vessel,
    voyage,
    booking_bl,
    yard_id,
    yard,
    total_amount,
    vat_amount,
    total_with_holding_tax,
    total_discount,
    net_total,
    grand_total,
    payment_total,
    status_id,
    status,
    wht_status,
    note,
    payment_method,
    update_user,
    detail = [], // ถ้า detail ไม่ได้ถูกส่งมา จะตั้งค่าเป็น array เปล่า
  } = req.body;

  const updateInvoiceSQL = `
    UPDATE invoice_header SET 
      client_id = ?,
      customer_name = ?,
      customer_name_eng = ?,
      customer_address = ?,
      customer_address_eng = ?,
      customer_address_branch = ?,
      customer_address_branch_eng = ?,
      tax_id = ?,
      invoice_language = ?,
      agent_id = ?,
      agent_code = ?,
      driver_id = ?,
      driver = ?,
      truck_license = ?,
      truck_company = ?,
      container = ?,
      size_type = ?,
      shipper = ?,
      vessel = ?,
      voyage = ?,
      booking_bl = ?,
      yard_id = ?,
      yard = ?,
      total_amount = ?,
      vat_amount = ?,
      total_with_holding_tax = ?,
      total_discount = ?,
      net_total = ?,
      grand_total = ?,
      payment_total = ?,
      status_id = ?,
      status = ?,
      wht_status = ?,
      note = ?,
      payment_method = ?,
      update_user = ?
    WHERE id = ?`;

  const updateInvoiceParams = [
    client_id,
    customer_name,
    customer_name_eng,
    customer_address,
    customer_address_eng,
    customer_address_branch,
    customer_address_branch_eng,
    tax_id,
    invoice_language,
    agent_id,
    agent_code,
    driver_id,
    driver,
    truck_license,
    truck_company,
    container,
    size_type,
    shipper,
    vessel,
    voyage,
    booking_bl,
    yard_id,
    yard,
    total_amount,
    vat_amount,
    total_with_holding_tax,
    total_discount,
    net_total,
    grand_total,
    payment_total,
    status_id,
    status,
    wht_status,
    note,
    payment_method,
    update_user,
    id,
  ];

  // const formattedUpdateSQL = db.format(updateInvoiceSQL, updateInvoiceParams);
  // console.log("Executing SQL:", formattedUpdateSQL);

  db.query(updateInvoiceSQL, updateInvoiceParams, (err, results) => {
    if (err) {
      console.error("Error executing SQL:", formattedUpdateSQL);
      res.status(500).send({ message: "Error updating invoice", error: err });
      return;
    }

    const deleteInvoiceDetailSQL = `DELETE FROM invoice_detail WHERE invoice_header_id = ?`;
    //const formattedDeleteSQL = db.format(deleteInvoiceDetailSQL, [id]);
    //console.log("Executing SQL:", formattedDeleteSQL);

    // Delete existing invoice details
    db.query(deleteInvoiceDetailSQL, [id], (err, deleteResults) => {
      if (err) {
        console.error("Error executing SQL:", formattedDeleteSQL);
        res
          .status(500)
          .send({ message: "Error deleting invoice details", error: err });
        return;
      }

      // Insert new invoice details
      const detailQueries = detail.map((item) => {
        const insertInvoiceDetailSQL = `
          INSERT INTO invoice_detail (
            invoice_header_id,
            price_list_id,
            description,
            description_eng,
            quantity,
            unit_price,
            amount,
            remark
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const insertInvoiceDetailParams = [
          id,
          item.price_list_id,
          item.description,
          item.description_eng,
          item.quantity,
          item.unit_price,
          item.amount,
          item.remark,
        ];

        /*
        const formattedInsertSQL = db.format(
          insertInvoiceDetailSQL,
          insertInvoiceDetailParams
        );
        console.log("Executing SQL:", formattedInsertSQL);
        */
        return new Promise((resolve, reject) => {
          db.query(
            insertInvoiceDetailSQL,
            insertInvoiceDetailParams,
            (err, insertResults) => {
              if (err) {
                // console.error("Error executing SQL:", formattedInsertSQL);
                reject(err);
              } else {
                resolve(insertResults);
              }
            }
          );
        });
      });

      Promise.all(detailQueries)
        .then(() => {
          res.send({ message: "Invoice updated successfully" });
        })
        .catch((err) => {
          res
            .status(500)
            .send({ message: "Error inserting invoice detail", error: err });
        });
    });
  });
};

exports.getInvoiceByEirId = (req, res) => {
  const { eir_id } = req.query;

  if (!eir_id) {
    return res.status(400).send({ message: "eir_id is required" });
  }

  const query = `
    SELECT 
      a.id as invoice_id, 
      a.invoice_no,  
      a.status_id, 
      a.status, 
      a.eir_id 
    FROM invoice_header a 
    WHERE a.eir_id = ?`;

  db.query(query, [eir_id], (err, results) => {
    if (err) {
      console.error("Error retrieving invoices by eir_id:", err);
      return res
        .status(500)
        .send({ message: "Error retrieving invoices", error: err });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .send({ message: "No invoices found for the provided eir_id" });
    }

    res.send(results);
  });
};

exports.updateInvoiceStatusToPaid = (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send({ message: "id is required" });
  }

  const query = `
    UPDATE invoice_header 
    SET status_id = 4, status = 'ชำระแล้ว' 
    WHERE id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error updating invoice status:", err);
      return res
        .status(500)
        .send({ message: "Error updating invoice status", error: err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).send({ message: "Invoice not found" });
    }

    res.send({ message: "Invoice status updated successfully" });
  });
};

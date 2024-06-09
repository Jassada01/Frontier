const db = require("../config/dbConfig");
const { getRunningNo } = require("../services/getRunningNo");

exports.addEquipmentInterchangeReceipt = async (req, res) => {
  const {
    entry_type,
    drop_container,
    date,
    agent_id,
    agent_code,
    client_id,
    client_code,
    booking_bl,
    container,
    container_color,
    size_type,
    seal_no,
    vessel,
    zone_id,
    zone,
    path_map,
    tare,
    voyage,
    truck_license,
    driver_id,
    driver_name,
    truck_company,
    tel,
    yard_id,
    yard,
    status_id,
    remark,
    driver_sign,
    receiver_sign,
    create_user,
    update_user,
    conditions,
  } = req.body;

  let p_running_prefix = "";

  if (entry_type === "IN" && !drop_container) {
    p_running_prefix = "EIR-IN";
  } else if (entry_type === "OUT" && !drop_container) {
    p_running_prefix = "EIR-OUT";
  } else if (entry_type === "IN" && drop_container) {
    p_running_prefix = "EIR-D-IN";
  } else if (entry_type === "OUT" && drop_container) {
    p_running_prefix = "EIR-D-OUT";
  }

  try {
    const receipt_no = await getRunningNo(
      "EIR",
      p_running_prefix,
      new Date(date)
    );

    const equipmentQuery = `
      INSERT INTO equipment_interchange_receipt (
        entry_type, drop_container, receipt_no, date, agent_id, agent_code, client_id, client_code, booking_bl, container, container_color,
        size_type, seal_no, vessel, zone_id, zone, path_map, tare, voyage, truck_license, driver_id, driver_name,
        truck_company, tel, yard_id, yard, status_id, remark, driver_sign, receiver_sign, create_user, update_user
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      equipmentQuery,
      [
        entry_type,
        drop_container,
        receipt_no,
        date,
        agent_id,
        agent_code,
        client_id,
        client_code,
        booking_bl,
        container,
        container_color,
        size_type,
        seal_no,
        vessel,
        zone_id,
        zone,
        path_map,
        tare,
        voyage,
        truck_license,
        driver_id,
        driver_name,
        truck_company,
        tel,
        yard_id,
        yard,
        status_id,
        remark,
        driver_sign,
        receiver_sign,
        create_user,
        update_user,
      ],
      async (err, result) => {
        if (err) {
          res.status(500).send({
            message: "Error adding new equipment interchange receipt",
            error: err,
          });
          return;
        }

        const equipmentId = result.insertId;

        const conditionQueries = conditions.map((condition) => {
          return new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO equipment_conditions (equipment_interchange_receipt_id, condition_id) VALUES (?, ?)",
              [equipmentId, condition.condition_id],
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            );
          });
        });

        try {
          await Promise.all(conditionQueries);

          // Generate Invoice
          const invoice_no = await getRunningNo("INV", "GRT", new Date(date));

          // Insert into invoice_header
          const invoiceQuery = `
            INSERT INTO invoice_header (invoice_no, eir_id)
            VALUES (?, ?)
          `;

          db.query(
            invoiceQuery,
            [invoice_no, equipmentId],
            async (err, result) => {
              if (err) {
                res.status(500).send({
                  message: "Error adding invoice header",
                  error: err,
                });
                return;
              }

              // Update invoice_header with additional data
              try {
                await updateInvoiceHeader(equipmentId);
                res.status(201).send({
                  message:
                    "Equipment, conditions, and invoice added successfully",
                  equipment_interchange_receipt_id: equipmentId,
                  invoice_id: result.insertId,
                });
              } catch (updateErr) {
                res.status(500).send({
                  message: "Error updating invoice header",
                  error: updateErr,
                });
              }
            }
          );
        } catch (err) {
          res.status(500).send(err);
        }
      }
    );
  } catch (error) {
    res.status(500).send({
      message: "Error generating running number",
      error: error.message,
    });
  }
};

const updateInvoiceHeader = (equipmentId) => {
  return new Promise((resolve, reject) => {
    const updateInvoiceQuery = `
      UPDATE invoice_header
      INNER JOIN equipment_interchange_receipt ON invoice_header.eir_id = equipment_interchange_receipt.id
      LEFT JOIN client ON client.client_id = equipment_interchange_receipt.client_id
      LEFT JOIN statuses ON statuses.description_en = 'INV' AND statuses.id = 3
      SET invoice_header.invoice_date = DATE(equipment_interchange_receipt.date),
          invoice_header.client_id = client.client_id,
          invoice_header.customer_name = client.name,
          invoice_header.customer_name_eng = client.name_eng,
          invoice_header.customer_address = client.billing_address,
          invoice_header.customer_address_eng = client.billing_address_eng,
          invoice_header.customer_address_branch = client.branch,
          invoice_header.customer_address_branch_eng = client.branch_eng,
          invoice_header.invoice_language = client.default_language,
          invoice_header.tax_id = client.tax_id,
          invoice_header.agent_id = equipment_interchange_receipt.agent_id,
          invoice_header.agent_code = equipment_interchange_receipt.agent_code,
          invoice_header.driver_id = equipment_interchange_receipt.driver_id,
          invoice_header.driver = equipment_interchange_receipt.driver_name,
          invoice_header.truck_license = equipment_interchange_receipt.truck_license,
          invoice_header.truck_company = equipment_interchange_receipt.truck_company,
          invoice_header.container = equipment_interchange_receipt.container,
          invoice_header.size_type = equipment_interchange_receipt.size_type,
          invoice_header.shipper = equipment_interchange_receipt.client_code,
          invoice_header.vessel = equipment_interchange_receipt.vessel,
          invoice_header.voyage = equipment_interchange_receipt.voyage,
          invoice_header.booking_bl = equipment_interchange_receipt.booking_bl,
          invoice_header.yard_id = equipment_interchange_receipt.yard_id,
          invoice_header.yard = equipment_interchange_receipt.yard,
          invoice_header.total_amount = 0,
          invoice_header.vat_amount = 0,
          invoice_header.total_with_holding_tax = 0,
          invoice_header.total_discount = 0,
          invoice_header.net_total = 0,
          invoice_header.status_id = statuses.id,
          invoice_header.status = statuses.status_name_th,
          invoice_header.create_user = equipment_interchange_receipt.create_user,
          invoice_header.update_user = equipment_interchange_receipt.update_user
      WHERE invoice_header.eir_id = ?
    `;

    db.query(updateInvoiceQuery, [equipmentId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.getEquipmentInterchangeReceipts = (req, res) => {
  const { id, entry_type, status_id, start_date, end_date } = req.query;

  let query = `
        SELECT 
            eir.*, 
            ec.id AS condition_id, 
            ec.condition_id AS condition_condition_id,
            user_c.display_name AS create_user_name,
            user_u.display_name AS update_user_name,
            s.status_name_th,
            s.status_name_en,
            ecm.condition_name_en,
            ecm.condition_name_th,
            ecm.position_x,
            ecm.position_y
        FROM equipment_interchange_receipt eir
        LEFT JOIN equipment_conditions ec ON eir.id = ec.equipment_interchange_receipt_id
        LEFT JOIN users user_c ON eir.create_user = user_c.id 
        LEFT JOIN users user_u ON eir.update_user = user_u.id 
        LEFT JOIN statuses s ON eir.status_id = s.id
        LEFT JOIN conditions ecm ON ec.condition_id = ecm.id
        WHERE 1=1
    `;
  let params = [];

  if (id) {
    query += ` AND eir.id = ?`;
    params.push(id);
  }

  if (entry_type) {
    query += ` AND eir.entry_type = ?`;
    params.push(entry_type);
  }

  if (status_id) {
    query += ` AND eir.status_id = ?`;
    params.push(status_id);
  }

  if (start_date && end_date) {
    query += ` AND eir.date BETWEEN ? AND ?`;
    params.push(start_date, end_date);
  } else if (start_date) {
    query += ` AND eir.date >= ?`;
    params.push(start_date);
  } else if (end_date) {
    query += ` AND eir.date <= ?`;
    params.push(end_date);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving equipment interchange receipts",
        error: err,
      });
      return;
    }

    const equipmentReceipts = results.reduce((acc, row) => {
      const receiptId = row.id;

      if (!acc[receiptId]) {
        acc[receiptId] = {
          id: row.id,
          entry_type: row.entry_type,
          drop_container: row.drop_container,
          receipt_no: row.receipt_no,
          date: row.date,
          agent_id: row.agent_id,
          agent_code: row.agent_code,
          client_id: row.client_id,
          client_code: row.client_code,
          booking_bl: row.booking_bl,
          container: row.container,
          container_color: row.container_color, // เพิ่มฟิลด์ container_color
          size_type: row.size_type,
          seal_no: row.seal_no,
          vessel: row.vessel,
          zone_id: row.zone_id,
          zone: row.zone,
          path_map: row.path_map,
          tare: row.tare,
          voyage: row.voyage,
          truck_license: row.truck_license,
          driver_id: row.driver_id,
          driver_name: row.driver_name,
          truck_company: row.truck_company,
          tel: row.tel,
          yard_id: row.yard_id,
          yard: row.yard,
          status_id: row.status_id,
          status_name_th: row.status_name_th,
          status_name_en: row.status_name_en,
          remark: row.remark,
          driver_sign: row.driver_sign,
          receiver_sign: row.receiver_sign,
          create_user: row.create_user,
          create_user_name: row.create_user_name,
          update_user: row.update_user,
          update_user_name: row.update_user_name,
          conditions: [],
        };
      }

      if (row.condition_id) {
        acc[receiptId].conditions.push({
          condition_id: row.condition_condition_id,
          condition_name_en: row.condition_name_en,
          condition_name_th: row.condition_name_th,
          position_x: row.position_x,
          position_y: row.position_y,
        });
      }

      return acc;
    }, {});

    res.send(Object.values(equipmentReceipts));
  });
};

exports.updateEquipmentInterchangeReceipt = (req, res) => {
  const equipmentId = req.params.id;
  const {
    entry_type,
    drop_container,
    receipt_no,
    date,
    agent_id,
    agent_code,
    client_id,
    client_code,
    booking_bl,
    container,
    container_color, // เพิ่มฟิลด์ container_color
    size_type,
    seal_no,
    vessel,
    zone_id,
    zone,
    path_map,
    tare,
    voyage,
    truck_license,
    driver_id,
    driver_name,
    truck_company,
    tel,
    yard_id,
    yard,
    status_id,
    remark,
    driver_sign,
    receiver_sign,
    create_user,
    update_user,
    conditions,
  } = req.body;

  const equipmentQuery = `
        UPDATE equipment_interchange_receipt SET 
            entry_type = ?, drop_container = ?, receipt_no = ?, date = ?, agent_id = ?, agent_code = ?, client_id = ?, client_code = ?,
            booking_bl = ?, container = ?, container_color = ?, size_type = ?, seal_no = ?, vessel = ?, zone_id = ?, zone = ?, path_map = ?, tare = ?,
            voyage = ?, truck_license = ?, driver_id = ?, driver_name = ?, truck_company = ?, tel = ?, yard_id = ?, yard = ?,
            status_id = ?, remark = ?, driver_sign = ?, receiver_sign = ?, update_user = ?
        WHERE id = ?
    `;

  db.query(
    equipmentQuery,
    [
      entry_type,
      drop_container,
      receipt_no,
      date,
      agent_id,
      agent_code,
      client_id,
      client_code,
      booking_bl,
      container,
      container_color,
      size_type,
      seal_no,
      vessel,
      zone_id,
      zone,
      path_map,
      tare,
      voyage,
      truck_license,
      driver_id,
      driver_name,
      truck_company,
      tel,
      yard_id,
      yard,
      status_id,
      remark,
      driver_sign,
      receiver_sign,
      update_user,
      equipmentId,
    ],
    (err, result) => {
      if (err) {
        res.status(500).send({
          message: "Error updating equipment interchange receipt",
          error: err,
        });
        return;
      }

      db.query(
        "DELETE FROM equipment_conditions WHERE equipment_interchange_receipt_id = ?",
        [equipmentId],
        (err, result) => {
          if (err) {
            res
              .status(500)
              .send({ message: "Error deleting old conditions", error: err });
            return;
          }

          const conditionQueries = conditions.map((condition) => {
            return new Promise((resolve, reject) => {
              db.query(
                "INSERT INTO equipment_conditions (equipment_interchange_receipt_id, condition_id) VALUES (?, ?)",
                [equipmentId, condition.condition_id],
                (err, result) => {
                  if (err) reject(err);
                  else resolve(result);
                }
              );
            });
          });

          Promise.all(conditionQueries)
            .then((results) =>
              res
                .status(200)
                .send("Equipment and conditions updated successfully")
            )
            .catch((err) => res.status(500).send(err));
        }
      );
    }
  );
};

exports.getFilteredEquipmentInterchangeReceipts = (req, res) => {
  const { entry_type, drop_container } = req.query;

  let query = `
        SELECT 
            id, 
            receipt_no, 
            entry_type, 
            drop_container, 
            date, 
            agent_id, 
            container 
        FROM equipment_interchange_receipt 
        WHERE status_id = 1
    `;

  let params = [];

  if (entry_type) {
    query += ` AND entry_type = ?`;
    params.push(entry_type);
  }

  if (drop_container !== undefined) {
    query += ` AND drop_container = ?`;
    params.push(drop_container);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      res.status(500).send({
        message: "Error retrieving filtered equipment interchange receipts",
        error: err,
      });
      return;
    }

    res.send(results);
  });
};

const db = require("../config/dbConfig");
const { getRunningNo } = require("../services/getRunningNo");
const util = require("util");
const query = util.promisify(db.query).bind(db);

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
    request_detail_id,
    request_id,
    request_type,
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
    p_running_prefix = "EIR-IND";
  } else if (entry_type === "OUT" && drop_container) {
    p_running_prefix = "EIR-OUTD";
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

        console.log(request_type);

        // Update incase request for return
        if (request_type === "Return") {
          try {
            // อัพเดท relate_EIR ใน request_container_returns_detail
            await query(
              "UPDATE request_container_returns_detail SET relate_EIR = ? WHERE request_id = ? AND id = ?",
              [equipmentId, request_id, request_detail_id]
            );

            // ตรวจสอบว่ายังมี relate_EIR ที่เป็น NULL อยู่หรือไม่
            const [remainingNulls] = await query(
              "SELECT COUNT(*) as count FROM request_container_returns_detail WHERE request_id = ? AND relate_EIR IS NULL",
              [request_id]
            );

            // อัพเดทสถานะใน request_container_returns
            const newStatus =
              remainingNulls.count > 0 ? "Processing" : "Complete";
            await query(
              "UPDATE request_container_returns SET status = ? WHERE id = ?",
              [newStatus, request_id]
            );
          } catch (error) {
            console.error("Error updating request status:", error);
            // คุณอาจต้องจัดการข้อผิดพลาดนี้อย่างเหมาะสม
            // เช่น ส่งการตอบกลับที่เหมาะสมไปยังไคลเอนต์
          }
        }

        if (request_type === "Receive") {
          console.log("Access Here");
          console.log(equipmentId);
          console.log(request_id);
          console.log(request_detail_id);
          try {
            // อัพเดท relate_EIR ใน request_container_receive_detail
            await query(
              "UPDATE request_container_receive_detail SET relate_EIR = ? WHERE request_return_id = ? AND id = ?",
              [equipmentId, request_id, request_detail_id]
            );

            // ตรวจสอบว่ายังมี relate_EIR ที่เป็น NULL อยู่หรือไม่
            const [remainingNulls] = await query(
              "SELECT COUNT(*) as count FROM request_container_receive_detail WHERE request_return_id = ? AND relate_EIR IS NULL",
              [request_id]
            );

            // อัพเดทสถานะใน request_container_receive
            const newStatus =
              remainingNulls.count > 0 ? "Processing" : "Complete";
            await query(
              "UPDATE request_container_receive SET status = ? WHERE id = ?",
              [newStatus, request_id]
            );
          } catch (error) {
            console.error("Error updating receive request status:", error);
            // อาจจะจัดการ error เพิ่มเติมตามต้องการ
          }
        }

        try {
          await Promise.all(conditionQueries);
          if (!(entry_type === "IN" && drop_container)) {
            let isInitialItem = true;
            if (drop_container) {
              isInitialItem = false;
            }
            await createInvoice(
              equipmentId,
              date,
              agent_id,
              yard_id,
              size_type,
              entry_type,
              isInitialItem,
              res
            );
          } else {
            res.status(201).send({
              message:
                "Equipment, conditions successfully with invoice details",
              equipment_interchange_receipt_id: equipmentId,
              invoice_id: null,
            });
          }
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

const createInvoice = async (
  equipmentId,
  date,
  agent_id,
  yard_id,
  size_type,
  entry_type,
  initialItem = true,
  res
) => {
  try {
    const InvoiceDate = new Date(date);
    const invoice_no =
      InvoiceDate.getMonth() + 1 >= 7 && InvoiceDate.getFullYear() >= 2024
        ? await getRunningNo("INV", "GRT", InvoiceDate, 4)
        : await getRunningNo("INV", "GRT", InvoiceDate);

    const invoiceQuery = `
      INSERT INTO invoice_header (invoice_no, eir_id)
      VALUES (?, ?)
    `;

    db.query(invoiceQuery, [invoice_no, equipmentId], async (err, result) => {
      if (err) {
        res.status(500).send({
          message: "Error adding invoice header",
          error: err,
        });
        return;
      }

      const invoiceId = result.insertId;

      try {
        await updateInvoiceHeader(equipmentId, invoiceId);

        if (initialItem) {
          const insertInvoiceDetailQuery = `
              INSERT INTO invoice_detail(invoice_header_id, price_list_id, description, description_eng, quantity, unit_price, amount, remark)
              SELECT ?, a.price_list_id, b.name_th, b.name_eng, 1, 
                     IFNULL(c.price, b.price) AS price, IFNULL(c.price, b.price) as amt,
                     CASE
                         WHEN c.price IS NOT NULL THEN "ราคาอ้างอิงจากลาน"
                         ELSE ""
                     END AS remark
              FROM default_service_template a 
              LEFT JOIN price_list b ON a.price_list_id = b.id
              LEFT JOIN price_list_custom c ON b.id = c.main_price_list_id AND c.agent_id = ? AND c.yards_id = ? AND c.size = ?
              WHERE a.entry_type = ?
            `;

          db.query(
            insertInvoiceDetailQuery,
            [invoiceId, agent_id, yard_id, size_type, entry_type],
            async (err, result) => {
              if (err) {
                res.status(500).send({
                  message: "Error inserting invoice details",
                  error: err,
                });
                return;
              }

              try {
                await updateInvoiceTotal(invoiceId);
                res.status(201).send({
                  message:
                    "Equipment, conditions, and invoice added successfully with invoice details",
                  equipment_interchange_receipt_id: equipmentId,
                  invoice_id: invoiceId,
                });
              } catch (updateTotalErr) {
                res.status(500).send({
                  message: "Error updating invoice totals",
                  error: updateTotalErr,
                });
              }
            }
          );
        } else {
          try {
            await updateInvoiceTotal(invoiceId);
            res.status(201).send({
              message:
                "Equipment and invoice added successfully without initial item details",
              equipment_interchange_receipt_id: equipmentId,
              invoice_id: invoiceId,
            });
          } catch (updateTotalErr) {
            res.status(500).send({
              message: "Error updating invoice totals",
              error: updateTotalErr,
            });
          }
        }
      } catch (updateErr) {
        res.status(500).send({
          message: "Error updating invoice header",
          error: updateErr,
        });
      }
    });
  } catch (error) {
    res.status(500).send({
      message: "Error generating running number for invoice",
      error: error.message,
    });
  }
};

const updateInvoiceHeader = (equipmentId, invoiceId) => {
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
          invoice_header.grand_total = 0,
          invoice_header.payment_total = 0,
          invoice_header.note = CONCAT(equipment_interchange_receipt.receipt_no,' : ', equipment_interchange_receipt.yard),
          invoice_header.status_id = statuses.id,
          invoice_header.status = statuses.status_name_th,
          invoice_header.create_user = equipment_interchange_receipt.create_user,
          invoice_header.update_user = equipment_interchange_receipt.update_user
      WHERE invoice_header.eir_id = ? and invoice_header.id = ?
    `;

    db.query(updateInvoiceQuery, [equipmentId, invoiceId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const updateInvoiceTotal = (invoice_id) => {
  return new Promise((resolve, reject) => {
    const updateInvoiceQuery = `
      UPDATE invoice_header
      LEFT JOIN (
          SELECT a.id AS invoice_header_id, IFNULL(SUM(b.amount), 0) AS TOTAL_PRICE
          FROM invoice_header a 
LEFT JOIN invoice_detail b ON a.id = b.invoice_header_id
          WHERE a.id = ?
          GROUP BY a.id
      ) INVDETAIL ON invoice_header.id = INVDETAIL.invoice_header_id
      SET 
        invoice_header.total_amount = INVDETAIL.TOTAL_PRICE,
        invoice_header.net_total = INVDETAIL.TOTAL_PRICE - invoice_header.total_discount,
        invoice_header.vat_amount = ROUND((INVDETAIL.TOTAL_PRICE - invoice_header.total_discount) * 0.07, 2),
        invoice_header.grand_total = (INVDETAIL.TOTAL_PRICE - invoice_header.total_discount) + ROUND(((INVDETAIL.TOTAL_PRICE - invoice_header.total_discount) * 0.07), 2),
        invoice_header.total_with_holding_tax = ROUND((invoice_header.wht_status / 100) * (INVDETAIL.TOTAL_PRICE - invoice_header.total_discount), 2),
        invoice_header.payment_total = (INVDETAIL.TOTAL_PRICE - invoice_header.total_discount) + ROUND(((INVDETAIL.TOTAL_PRICE - invoice_header.total_discount) * 0.07), 2) - IFNULL(ROUND((invoice_header.wht_status / 100) * (INVDETAIL.TOTAL_PRICE - invoice_header.total_discount), 2), 0)
      WHERE invoice_header.id = ?
    `;

    db.query(updateInvoiceQuery, [invoice_id, invoice_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.createInvoiceWithoutInitialItem = async (req, res) => {
  const { equipmentId, date, agent_id, yard_id, size_type, entry_type } =
    req.body;
  await createInvoice(
    equipmentId,
    date,
    agent_id,
    yard_id,
    size_type,
    entry_type,
    false,
    res
  );
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
            CASE
                WHEN eir_mva.eir_in IS NULL THEN eir_mvb.eir_in_no
                ELSE eir_mva.eir_out_no
            END AS match_eir,
            CASE
                WHEN eir_mva.eir_in IS NULL THEN eir_mvb.eir_in_dt
                ELSE eir_mva.eir_out_dt
            END AS match_eir_dt,
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
        LEFT JOIN eir_match_view eir_mva ON eir.id = eir_mva.eir_in
        LEFT JOIN eir_match_view eir_mvb ON eir.id = eir_mvb.eir_out
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
          match_eir: row.match_eir,
          match_eir_dt: row.match_eir_dt,
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

/**
 * ฟังก์ชั่นสำหรับสร้าง invoice_detail โดยรับค่า equipmentId
 */
exports.createInvoiceDetailsForEquipment = async (req, res) => {
  const { equipmentId, invoiceHeaderId } = req.body;

  if (!equipmentId || !invoiceHeaderId) {
    return res.status(400).send({
      message: "equipmentId and invoiceHeaderId are required",
    });
  }

  try {
    // ดึงข้อมูลตาม equipmentId
    const selectQuery = `
      SELECT 
        a.id, 
        a.date as out_date, 
        c.id AS in_ID, 
        c.date AS in_date, 
        d.size, 
        d.std_price, 
        d.ext_price,
        a.client_id
      FROM equipment_interchange_receipt a 
      INNER JOIN eir_match b ON a.id = b.eir_out AND b.is_active = 1
      INNER JOIN equipment_interchange_receipt c ON b.eir_in = c.id
      INNER JOIN price_drop d ON a.size_type = d.size
      WHERE a.id = ?
    `;

    const results = await query(selectQuery, [equipmentId]);

    if (results.length === 0) {
      return res.status(404).send({
        message: "No matching records found for the provided equipmentId.",
      });
    }

    const invoiceDetails = [];

    // ตรวจสอบ free_period จาก client_free_drop_period
    const clientId = results[0].client_id;
    const freeDropQuery = `
      SELECT free_period 
      FROM client_free_drop_period 
      WHERE client_id = ? 
      AND is_active = 1 
      AND expire_date > NOW()
      LIMIT 1
    `;

    const freeDropResults = await query(freeDropQuery, [clientId]);

    // กำหนด default freePeriod เป็น 72 ชั่วโมง
    let freePeriodInHours = 72;

    // ถ้ามีข้อมูลใน client_free_drop_period ให้ใช้ free_period แทน
    if (freeDropResults.length > 0) {
      const freePeriodInDays = freeDropResults[0].free_period;
      freePeriodInHours = freePeriodInDays * 24; // แปลง free_period เป็นชั่วโมง
    }

    results.forEach((row) => {
      const outDate = new Date(row.out_date);
      const inDate = new Date(row.in_date);
      const diffInHours = Math.abs(inDate - outDate) / 36e5; // คำนวณเวลาห่างเป็นชั่วโมง

      // ถ้าห่างกันไม่เกิน freePeriodInHours
      if (diffInHours <= freePeriodInHours) {
        invoiceDetails.push({
          invoice_header_id: invoiceHeaderId,
          price_list_id: 99, // ปรับตาม schema ของคุณ
          description: `ค่าฝากตู้ สำหรับขนาด ${row.size}`, // ภาษาไทย
          description_eng: `CONTAINER DROP for size ${row.size}`, // ภาษาอังกฤษ
          quantity: 1,
          unit_price: row.std_price,
          amount: row.std_price * 1,
          remark: `Within ${freePeriodInHours} hours`,
        });
      } else {
        // ถ้าห่างกันเกิน freePeriodInHours
        const extraHours = diffInHours - freePeriodInHours;
        const extraDays = Math.ceil(extraHours / 24); // ปัดขึ้นเป็นวัน

        // เพิ่ม std_price
        invoiceDetails.push({
          invoice_header_id: invoiceHeaderId,
          price_list_id: 99,
          description: `ค่าฝากตู้	 สำหรับขนาด ${row.size}`, // ภาษาไทย
          description_eng: `CONTAINER DROP for size ${row.size}`, // ภาษาอังกฤษ
          quantity: 1,
          unit_price: row.std_price,
          amount: row.std_price * 1,
          remark: `Exceeds ${freePeriodInHours} hours`,
        });

        // เพิ่ม ext_price ตามจำนวนวัน
        invoiceDetails.push({
          invoice_header_id: invoiceHeaderId,
          price_list_id: 99,
          description: `ค่าบริการเพิ่มเติม สำหรับตู้ขนาด ${row.size}`, // ภาษาไทย
          description_eng: `Extra price for for size ${row.size}`, // ภาษาอังกฤษ
          quantity: extraDays,
          unit_price: row.ext_price,
          amount: row.ext_price * extraDays,
          remark: `Extra charges for exceeding ${freePeriodInHours} hours by ${extraDays} day(s)`,
        });
      }
    });

    // Insert ข้อมูลเข้าไปใน invoice_detail
    const insertQuery = `
      INSERT INTO invoice_detail 
        (invoice_header_id, price_list_id, description, description_eng, quantity, unit_price, amount, remark) 
      VALUES ?
    `;

    const values = invoiceDetails.map((detail) => [
      detail.invoice_header_id,
      detail.price_list_id,
      detail.description,
      detail.description_eng, // เพิ่ม description_eng เข้าไปในค่าที่จะ insert
      detail.quantity,
      detail.unit_price,
      detail.amount,
      detail.remark,
    ]);

    await query(insertQuery, [values]);

    // เรียกใช้ updateInvoiceTotal หลังจาก insert ข้อมูล detail เสร็จแล้ว
    await updateInvoiceTotal(invoiceHeaderId);

    res.status(201).send({
      message: "Invoice details created and total updated successfully",
      invoice_header_id: invoiceHeaderId,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error creating invoice details",
      error: error.message,
    });
  }
};

exports.getAvailableContainers = async (req, res) => {
  try {
    // รับค่า parameters จาก query string
    const { agent_id, size_type } = req.query;

    // ตรวจสอบว่ามีการส่งค่าที่จำเป็นมาครบหรือไม่
    if (!agent_id || !size_type) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ agent_id และ size_type",
      });
    }

    // สร้าง SQL query
    const sqlQuery = `
            SELECT * 
            FROM equipment_interchange_receipt a 
            WHERE a.agent_id = ?
            AND a.size_type = ?
            AND a.entry_type = 'IN'
            AND a.drop_container = 0 
            AND a.id NOT IN (SELECT eir_in FROM eir_match)
            ORDER BY a.date DESC
        `;

    // execute query with parameters
    const results = await query(sqlQuery, [agent_id, size_type]);

    // จัดการกับ datetime fields ให้อยู่ในรูปแบบที่เหมาะสม
    const formattedResults = results.map((record) => ({
      ...record,
      date: record.date ? new Date(record.date).toISOString() : null,
      create_datetime: record.create_datetime
        ? new Date(record.create_datetime).toISOString()
        : null,
      update_datetime: record.update_datetime
        ? new Date(record.update_datetime).toISOString()
        : null,
    }));

    // ส่ง response กลับ
    res.status(200).json({
      success: true,
      total: results.length,
      data: formattedResults,
    });
  } catch (error) {
    console.error("Error in getAvailableContainers:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

exports.getBookingOrContainerFiles = async (req, res) => {
  const { type, relate_eir } = req.query;

  if (!type || !relate_eir) {
    return res.status(400).send({
      message: "Please provide both 'type' (IN/OUT) and 'relate_eir'",
    });
  }

  try {
    let sqlQuery = "";
    let params = [relate_eir];

    if (type.toUpperCase() === "OUT") {
      sqlQuery = `
        SELECT 'Booking' as subtype, b.file_url, b.file_name, b.file_type 
        FROM request_container_receive_detail a 
        LEFT JOIN firebase_upload_file b ON a.request_return_id = b.relate_id 
        WHERE a.relate_EIR = ?
        AND b.type = 'Receive' AND b.sub_type = 'Booking';
      `;
    } else if (type.toUpperCase() === "IN") {
      sqlQuery = `
        SELECT 'BL' as subtype, c.file_url, c.file_name, c.file_type 
        FROM request_container_returns_detail a 
        LEFT JOIN request_container_returns b ON a.request_id = b.id
        LEFT JOIN firebase_upload_file c ON a.request_id = c.relate_id 
        WHERE a.relate_eir = ?
        AND c.type = 'Return' AND c.sub_type = 'BL'
        UNION ALL 
        SELECT 'Container' as subtype, c.file_url, c.file_name, c.file_type 
        FROM request_container_returns_detail a 
        LEFT JOIN request_container_returns b ON a.request_id = b.id
        LEFT JOIN firebase_upload_file c ON a.request_id = c.relate_id AND a.id = c.container_id
        WHERE a.relate_eir = ?
        AND c.type = 'Return' AND c.sub_type = 'Container';
      `;
      params.push(relate_eir); // เนื่องจาก query สำหรับ IN มี 2 ที่ที่ต้องใช้ relate_eir
    } else {
      return res.status(400).send({
        message: "Invalid type. Please provide 'IN' or 'OUT'",
      });
    }

    const results = await query(sqlQuery, params);
    res.status(200).send(results);
  } catch (error) {
    console.error("Error fetching booking or container files:", error);
    res.status(500).send({
      message: "Error fetching booking or container files",
      error: error.message,
    });
  }
};

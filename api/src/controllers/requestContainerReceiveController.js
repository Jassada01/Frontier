const db = require("../config/dbConfig");

const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

exports.addContainerReceive = async (req, res) => {
  const {
    agent_id,
    booking_no,
    request_date,
    create_line_id,
    remark,
    status,
    containers,
    booking_document_urls,
  } = req.body;

  try {
    await db.beginTransaction();

    // Insert main receive request
    const result = await executeQuery(
      `INSERT INTO request_container_receive 
         (agent_id, booking_no, request_date, create_line_id, remark, status, total_container) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        agent_id,
        booking_no,
        request_date,
        create_line_id,
        remark,
        status,
        containers.length,
      ]
    );

    const request_id = result.insertId;

    // Insert container details
    if (containers.length > 0) {
      const containerValues = containers.map((container) => [
        request_id,
        container.container_size,
        container.remark || null,
      ]);

      await executeQuery(
        `INSERT INTO request_container_receive_detail 
           (request_return_id, container_size, remark) 
           VALUES ${containerValues.map(() => "(?, ?, ?)").join(",")}`,
        containerValues.flat()
      );
    }

    // Insert booking documents
    if (booking_document_urls && booking_document_urls.length > 0) {
      const fileUploads = booking_document_urls.map((url) => [
        "Receive", // type
        "Booking", // sub_type
        request_id, // relate_id
        null, // container_id
        url, // file_url
        url.split("/").pop(), // file_name
        "document", // file_type
      ]);

      await executeQuery(
        `INSERT INTO firebase_upload_file 
           (type, sub_type, relate_id, container_id, file_url, file_name, file_type) 
           VALUES ?`,
        [fileUploads]
      );
    }

    await db.commit();
    res.status(201).send({
      message: "Container receive request added successfully",
      request_id: request_id,
    });
  } catch (error) {
    await db.rollback();
    res.status(500).send({
      message: "Error processing container receive request",
      error: error.message,
    });
  }
};

exports.getContainerReceives = async (req, res) => {
  const { request_id, agent_id, status, line_user_id } = req.query;

  let query = `
      WITH user_groups AS (
        SELECT DISTINCT lgm.group_id
        FROM line_group_members lgm
        WHERE lgm.line_user_id = ?
      )
      SELECT DISTINCT r.*, 
             agn.agent_code,
             d.id AS detail_id, 
             d.container_size,
             d.relate_EIR,
             d.remark AS detail_remark,
             eir.receipt_no,
             eir.date AS EIR_date,
             eir.container, 
             COALESCE(f.booking_documents, '') AS booking_documents,
             lup.id AS user_id,
             lup.line_user_id,
             lup.display_name,
             lup.picture_url,
             lup.user_type,
             lup.name,
             lup.company_name,
             lup.company_id,
             GROUP_CONCAT(DISTINCT lcig.group_id) AS group_ids,
             GROUP_CONCAT(DISTINCT lcig.group_name) AS group_names
      FROM request_container_receive r
      LEFT JOIN request_container_receive_detail d ON r.id = d.request_return_id
      LEFT JOIN (
          SELECT relate_id,
                 GROUP_CONCAT(DISTINCT file_url) AS booking_documents
          FROM firebase_upload_file 
          WHERE type = 'Receive' AND sub_type = 'Booking'
          GROUP BY relate_id
      ) f ON r.id = f.relate_id
      LEFT JOIN line_user_profiles lup ON r.create_line_id = lup.line_user_id
      LEFT JOIN line_group_members lgm ON lup.line_user_id = lgm.line_user_id
      LEFT JOIN line_customer_id_group lcig ON lgm.group_id = lcig.group_id
      LEFT JOIN agents agn ON r.agent_id = agn.agent_id
      LEFT JOIN equipment_interchange_receipt eir ON d.relate_EIR = eir.id
      WHERE 1=1
      
    `;

  let params = [line_user_id, line_user_id]; // เพิ่ม parameter สำหรับ line_user_id 2 ครั้ง

  if (request_id) {
    query += ` AND r.id = ?`;
    params.push(request_id);
  }
  if (agent_id) {
    query += ` AND r.agent_id = ?`;
    params.push(agent_id);
  }
  if (status) {
    query += ` AND r.status = ?`;
    params.push(status);
  }
  if (line_user_id) {
    query += ` AND (
        lgm.group_id IN (SELECT group_id FROM user_groups)
        OR r.create_line_id = ?
      )`;
    params.push(status);
  }

  query += ` GROUP BY r.id, d.id`; // Group by เพื่อรวมข้อมูล group_ids และ group_names
  query += ` ORDER BY r.request_date DESC`;

  try {
    const results = await executeQuery(query, params);

    // Format results to group details under main request
    const formattedResults = results.reduce((acc, row) => {
      const container = {
        id: row.detail_id,
        container_size: row.container_size,
        relate_EIR: row.relate_EIR,
        remark: row.detail_remark,
        receipt_no: row.receipt_no,
        EIR_date: row.EIR_date,
        container: row.container,
      };

      const existingReceive = acc.find((r) => r.id === row.id);
      if (existingReceive) {
        existingReceive.containers.push(container);
      } else {
        // แปลง string ของ group_ids และ group_names เป็น array
        const group_ids = row.group_ids ? row.group_ids.split(",") : [];
        const group_names = row.group_names ? row.group_names.split(",") : [];

        acc.push({
          id: row.id,
          agent_id: row.agent_id,
          agent_code: row.agent_code,
          booking_no: row.booking_no,
          request_date: row.request_date,
          create_line_id: row.create_line_id,
          remark: row.remark,
          status: row.status,
          total_container: row.total_container,
          create_date: row.create_date,
          update_date: row.update_date,
          booking_documents: row.booking_documents
            ? row.booking_documents.split(",")
            : [],
          user: {
            id: row.user_id,
            line_user_id: row.line_user_id,
            display_name: row.display_name,
            picture_url: row.picture_url,
            user_type: row.user_type,
            name: row.name,
            company_name: row.company_name,
            company_id: row.company_id,
          },
          groups: group_ids.map((id, index) => ({
            group_id: id,
            group_name: group_names[index],
          })),
          containers: [container],
        });
      }
      return acc;
    }, []);

    res.send(formattedResults);
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving container receive information",
      error: error.message,
    });
  }
};
exports.updateContainerReceive = async (req, res) => {
  const { request_id } = req.params;
  const {
    agent_id,
    booking_no,
    request_date,
    create_line_id,
    remark,
    status,
    containers,
  } = req.body;

  try {
    await db.beginTransaction();

    // Update main receive request
    await executeQuery(
      `UPDATE request_container_receive 
       SET agent_id = ?, 
           booking_no = ?, 
           request_date = ?,
           create_line_id = ?,
           remark = ?,
           status = ?,
           total_container = ?,
           update_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        agent_id,
        booking_no,
        request_date,
        create_line_id,
        remark,
        status,
        containers.length,
        request_id,
      ]
    );

    // Delete existing details
    await executeQuery(
      `DELETE FROM request_container_receive_detail WHERE request_return_id = ?`,
      [request_id]
    );

    // Insert new container details
    if (containers.length > 0) {
      const containerValues = containers.map((container) => [
        request_id,
        container.container_size,
        container.relate_EIR || null,
        container.remark || null,
      ]);

      await executeQuery(
        `INSERT INTO request_container_receive_detail 
         (request_return_id, container_size, relate_EIR, remark) 
         VALUES ${containerValues.map(() => "(?, ?, ?, ?)").join(",")}`,
        containerValues.flat()
      );
    }

    await db.commit();
    res.send({
      message: "Container receive request updated successfully",
      request_id: request_id,
    });
  } catch (error) {
    await db.rollback();
    res.status(500).send({
      message: "Error updating container receive request",
      error: error.message,
    });
  }
};

exports.updateContainerReceiveDetail = async (req, res) => {
  const { detail_id, request_id } = req.params;

  try {
    await db.beginTransaction();

    // Update relate_EIR to -1
    await executeQuery(
      `UPDATE request_container_receive_detail 
       SET relate_EIR = -1,
           update_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [detail_id]
    );

    // Decrease total_container by 1
    await executeQuery(
      `UPDATE request_container_receive 
       SET total_container = total_container - 1,
           update_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [request_id]
    );

    // Check remaining containers status
    const containerStatus = await executeQuery(
      `SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 'NO_RECORDS'
          WHEN COUNT(*) = SUM(CASE WHEN relate_EIR = -1 THEN 1 ELSE 0 END) THEN 'ALL_CANCELLED'
          WHEN COUNT(*) = SUM(CASE WHEN relate_EIR IS NOT NULL AND relate_EIR != -1 THEN 1 ELSE 0 END) 
               + SUM(CASE WHEN relate_EIR = -1 THEN 1 ELSE 0 END) THEN 'ALL_PROCESSED'
          ELSE 'PARTIALLY_PROCESSED'
        END as status
       FROM request_container_receive_detail 
       WHERE request_return_id = ?`,
      [request_id]
    );

    // Update main request status based on container statuses
    const newStatus =
      containerStatus[0].status === "ALL_CANCELLED"
        ? "Cancel"
        : containerStatus[0].status === "ALL_PROCESSED"
        ? "Complete"
        : "InProgress"; // Default status if neither condition is met

    await executeQuery(
      `UPDATE request_container_receive 
       SET status = ?,
           update_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, request_id]
    );

    await db.commit();
    res.send({
      message: "Container receive detail updated successfully",
      detail_id: detail_id,
      request_id: request_id,
      new_status: newStatus,
    });
  } catch (error) {
    await db.rollback();
    res.status(500).send({
      message: "Error updating container receive detail",
      error: error.message,
    });
  }
};

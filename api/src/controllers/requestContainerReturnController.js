const db = require("../config/dbConfig");

const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

exports.addContainerReturn = async (req, res) => {
  const {
    agent,
    bl,
    containers,
    returnDocumentUrls,
    additionalNotes,
    line_user_id,
  } = req.body;

  try {
    await db.beginTransaction();

    // Insert main return request
    const result = await executeQuery(
      `INSERT INTO request_container_returns (agent_id, bl_number, additional_notes, create_line_id) VALUES (?, ?, ?, ?)`,
      [agent, bl, additionalNotes, line_user_id]
    );

    const request_id = result.insertId;

    // Insert container details
    const containerValues = containers.map((container) => [
      request_id,
      container.containerNumber,
      container.containerSize,
    ]);

    const detailResult = await executeQuery(
      `INSERT INTO request_container_returns_detail (request_id, container_number, container_size) VALUES ?`,
      [containerValues]
    );

    // Prepare file uploads
    const fileUploads = [];

    // Add container images
    containers.forEach((container, index) => {
      container.imageUrls.forEach((url) => {
        fileUploads.push([
          "Return",
          "Container",
          request_id,
          detailResult.insertId + index,
          url,
          url.split("/").pop(),
          "image",
        ]);
      });
    });

    // Add return documents
    returnDocumentUrls.forEach((url) => {
      fileUploads.push([
        "Return",
        "BL",
        request_id,
        null,
        url,
        url.split("/").pop(),
        "document",
      ]);
    });

    // Insert file uploads
    if (fileUploads.length > 0) {
      await executeQuery(
        `INSERT INTO firebase_upload_file (type, sub_type, relate_id, container_id, file_url, file_name, file_type) VALUES ?`,
        [fileUploads]
      );
    }

    await db.commit();
    res.status(201).send({
      message: "Container return request added successfully",
      request_id: request_id,
    });
  } catch (error) {
    await db.rollback();
    res.status(500).send({
      message: "Error processing container return request",
      error: error.message,
    });
  }
};

exports.getContainerReturns = async (req, res) => {
  const { request_id, agent_id, status, line_user_id } = req.query;

  let query = `
    WITH user_groups AS (
      SELECT DISTINCT lgm.group_id
      FROM line_group_members lgm
      WHERE lgm.line_user_id = ?
    )
    SELECT DISTINCT r.*, agn.agent_code, 
           d.id AS container_id, 
           d.container_number, 
           d.container_size,
           eir.receipt_no,
           eir.date AS EIR_date,
           d.relate_EIR, 
           GROUP_CONCAT(DISTINCT CASE WHEN f.sub_type = 'Container' THEN f.file_url END) AS container_images,
           GROUP_CONCAT(DISTINCT CASE WHEN f.sub_type = 'BL' THEN f.file_url END) AS return_documents,
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
    FROM request_container_returns r
    LEFT JOIN request_container_returns_detail d ON r.id = d.request_id
    LEFT JOIN firebase_upload_file f ON (f.sub_type = 'Container' AND d.id = f.container_id) OR (f.sub_type = 'BL' AND r.id = f.relate_id) AND f.type = 'Return'
    LEFT JOIN line_user_profiles lup ON r.create_line_id = lup.line_user_id
    LEFT JOIN line_group_members lgm ON lup.line_user_id = lgm.line_user_id
    LEFT JOIN line_customer_id_group lcig ON lgm.group_id = lcig.group_id
    LEFT JOIN agents agn ON r.agent_id = agn.agent_id
    LEFT JOIN equipment_interchange_receipt eir ON d.relate_EIR = eir.id
    WHERE 1=1
  `;
  let params = [line_user_id || ""];

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
    query += ` AND (r.create_line_id = ? OR lgm.group_id IN (SELECT group_id FROM user_groups))`;
    params.push(line_user_id);
  }

  query += ` GROUP BY r.id, d.id Order By r.created_at DESC`;

  try {
    const results = await executeQuery(query, params);

    const formattedResults = results.reduce((acc, row) => {
      let container = {
        id: row.container_id,
        container_number: row.container_number,
        container_size: row.container_size,
        EIR_NO: row.receipt_no,
        EIR_date: row.EIR_date,
        relate_EIR: row.relate_EIR,
        container_images: row.container_images
          ? row.container_images.split(",")
          : [],
      };

      let existingReturn = acc.find((r) => r.id === row.id);
      if (existingReturn) {
        existingReturn.container_details.push(container);
      } else {
        acc.push({
          id: row.id,
          agent_id: row.agent_id,
          agent_code: row.agent_code,
          bl_number: row.bl_number,
          additional_notes: row.additional_notes,
          create_line_id: row.create_line_id,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          container_details: [container],
          return_documents: row.return_documents
            ? row.return_documents.split(",")
            : [],
          user_profile: {
            id: row.user_id,
            line_user_id: row.line_user_id,
            display_name: row.display_name,
            picture_url: row.picture_url,
            user_type: row.user_type,
            name: row.name,
            company_name: row.company_name,
            company_id: row.company_id,
          },
          user_groups: row.group_ids
            ? row.group_ids.split(",").map((id, index) => ({
                group_id: parseInt(id),
                group_name: row.group_names.split(",")[index],
              }))
            : [],
        });
      }

      return acc;
    }, []);

    res.send(formattedResults);
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving container return information",
      error: error.message,
    });
  }
};

exports.updateContainerReturn = async (req, res) => {
  const { request_id } = req.params;
  const {
    agent_id,
    bl_number,
    additional_notes,
    status,
    containers,
    return_document_urls,
    line_user_id,
  } = req.body;

  try {
    await db.beginTransaction();

    await executeQuery(
      `UPDATE request_container_returns 
       SET agent_id = ?, bl_number = ?, additional_notes = ?, status = ?, update_line_id = ? 
       WHERE id = ?`,
      [agent_id, bl_number, additional_notes, status, line_user_id, request_id]
    );

    await executeQuery(
      `DELETE FROM request_container_returns_detail WHERE request_id = ?;
       DELETE FROM firebase_upload_file WHERE relate_id = ?;`,
      [request_id, request_id]
    );

    const containerValues = containers.map((container) => [
      request_id,
      container.containerNumber,
      container.containerSize,
    ]);

    const detailResult = await executeQuery(
      `INSERT INTO request_container_returns_detail (request_id, container_number, container_size) VALUES ?`,
      [containerValues]
    );

    const fileUploads = [];
    containers.forEach((container, index) => {
      container.imageUrls.forEach((url) => {
        fileUploads.push([
          "Return",
          "Container",
          request_id,
          detailResult.insertId + index,
          url,
          url.split("/").pop(),
          "image",
        ]);
      });
    });

    return_document_urls.forEach((url) => {
      fileUploads.push([
        "Return",
        "BL",
        request_id,
        null,
        url,
        url.split("/").pop(),
        "document",
      ]);
    });

    await executeQuery(
      `INSERT INTO firebase_upload_file (type, sub_type, relate_id, container_id, file_url, file_name, file_type) VALUES ?`,
      [fileUploads]
    );

    await db.commit();
    res.send({
      message: "Container return request updated successfully",
      request_id: request_id,
    });
  } catch (error) {
    await db.rollback();
    res.status(500).send({
      message: "Error updating container return request",
      error: error.message,
    });
  }
};

exports.cancelContainerReturn = async (req, res) => {
  const { request_id } = req.params;
  const { line_user_id } = req.body; // เพิ่ม line_user_id เพื่อบันทึกว่าใครเป็นคนยกเลิก

  try {
    await db.beginTransaction();

    // ตรวจสอบว่า request นี้มีอยู่จริงและมีสถานะเป็น 'Pending'
    const [checkResult] = await executeQuery(
      "SELECT status FROM request_container_returns WHERE id = ?",
      [request_id]
    );

    if (!checkResult) {
      throw new Error("Container return request not found");
    }

    if (checkResult.status !== "Pending") {
      throw new Error("Only pending requests can be cancelled");
    }

    // อัพเดทสถานะเป็น 'Cancel' และบันทึก line_user_id ของคนที่ยกเลิก
    await executeQuery(
      `UPDATE request_container_returns 
       SET status = 'Cancel', updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [request_id]
    );

    await db.commit();
    res.send({
      message: "Container return request cancelled successfully",
      request_id: request_id,
    });
  } catch (error) {
    await db.rollback();
    res.status(400).send({
      message: "Error cancelling container return request",
      error: error.message,
    });
  }
};

exports.updateContainerEIR = async (req, res) => {
  const { request_id, detail_id } = req.params;

  try {
    await db.beginTransaction();

    // Update relate_EIR to -1 for the specific container detail
    await executeQuery(
      `UPDATE request_container_returns_detail 
       SET relate_EIR = -1 
       WHERE id = ? AND request_id = ?`,
      [detail_id, request_id]
    );

    // Check the status of all containers in this request
    const [statusCheck] = await executeQuery(
      `SELECT 
        COUNT(*) as total_containers,
        SUM(CASE 
          WHEN relate_EIR IS NULL THEN 1 
          ELSE 0 
        END) as null_count,
        SUM(CASE 
          WHEN relate_EIR = -1 THEN 1 
          ELSE 0 
        END) as cancelled_count,
        SUM(CASE 
          WHEN relate_EIR > 0 THEN 1 
          ELSE 0 
        END) as completed_count
      FROM request_container_returns_detail 
      WHERE request_id = ?`,
      [request_id]
    );

    // Determine new status based on conditions
    let newStatus;
    if (statusCheck.null_count === 0) {
      // ไม่มี NULL เหลือแล้ว
      if (statusCheck.cancelled_count === statusCheck.total_containers) {
        // ทุกตู้มีค่า relate_EIR = -1
        newStatus = "Cancel";
      } else if (statusCheck.completed_count > 0) {
        // มีอย่างน้อย 1 ตู้ที่มี relate_EIR > 0
        newStatus = "Complete";
      }

      if (newStatus) {
        await executeQuery(
          `UPDATE request_container_returns 
           SET status = ? 
           WHERE id = ?`,
          [newStatus, request_id]
        );
      }
    }

    await db.commit();
    res.send({
      message: "Container EIR updated successfully",
      request_id: request_id,
      detail_id: detail_id,
      new_status: newStatus || "No status change",
    });
  } catch (error) {
    await db.rollback();
    res.status(500).send({
      message: "Error updating container EIR",
      error: error.message,
    });
  }
};

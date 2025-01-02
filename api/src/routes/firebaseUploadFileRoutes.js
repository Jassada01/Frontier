const express = require("express");
const router = express.Router();
const firebaseUploadFileController = require("../controllers/firebaseUploadController");

/**
 * @swagger
 * /api/firebase-upload-file/add:
 *   post:
 *     summary: Add a new file upload record
 *     tags: [Firebase Upload Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - file_url
 *               - file_name
 *             properties:
 *               type:
 *                 type: string
 *                 description: Type of the upload (Required)
 *               sub_type:
 *                 type: string
 *                 description: Sub-type of the upload (Optional)
 *               relate_id:
 *                 type: integer
 *                 description: Related ID (Optional)
 *               container_id:
 *                 type: integer
 *                 description: Container ID (Optional)
 *               file_url:
 *                 type: string
 *                 description: URL of the uploaded file (Required)
 *               file_name:
 *                 type: string
 *                 description: Name of the file (Required)
 *               file_type:
 *                 type: string
 *                 description: Type of the file (Optional)
 *     responses:
 *       201:
 *         description: File record created successfully
 *       500:
 *         description: Error adding new file record
 */
router.post("/add", firebaseUploadFileController.addFile);




/**
 * @swagger
 * /api/firebase-upload-file/get:
 *   get:
 *     summary: Get list of file upload records
 *     tags: [Firebase Upload Files]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: The ID of the file record
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type
 *       - in: query
 *         name: sub_type
 *         schema:
 *           type: string
 *         description: Filter by sub_type
 *       - in: query
 *         name: relate_id
 *         schema:
 *           type: integer
 *         description: Filter by relate_id
 *     responses:
 *       200:
 *         description: A list of file records
 *       500:
 *         description: Error retrieving file records
 */
router.get("/get", firebaseUploadFileController.getFiles);

/**
 * @swagger
 * /api/firebase-upload-file/update/{id}:
 *   put:
 *     summary: Update an existing file record
 *     tags: [Firebase Upload Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the file record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               sub_type:
 *                 type: string
 *               relate_id:
 *                 type: integer
 *               container_id:
 *                 type: integer
 *               file_url:
 *                 type: string
 *               file_name:
 *                 type: string
 *               file_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: File record updated successfully
 *       500:
 *         description: Error updating file record
 */
router.put("/update/:id", firebaseUploadFileController.updateFile);

/**
 * @swagger
 * /api/firebase-upload-file/delete/{id}:
 *   delete:
 *     summary: Delete a file record
 *     tags: [Firebase Upload Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the file record to delete
 *     responses:
 *       200:
 *         description: File record deleted successfully
 *       500:
 *         description: Error deleting file record
 */
router.delete("/delete/:id", firebaseUploadFileController.deleteFile);

module.exports = router;

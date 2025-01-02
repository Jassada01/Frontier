const express = require("express");
const multer = require("multer");
const {
  upload,
  uploadToSubfolder,
} = require("../controllers/uploadController");

const router = express.Router();
const uploadMiddleware = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file to Firebase Storage
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileUrl:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post("/upload", uploadMiddleware.single("file"), upload);

/**
 * @swagger
 * /api/upload-to-subfolder:
 *   post:
 *     summary: Upload a file to Firebase Storage in a specific subfolder under "Upload_File_Attached"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 description: Subfolder name (e.g., invoice number) where the file will be stored
 *                 example: "INV001"
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Alternative way to specify the subfolder name
 *         example: "INV001"
 *     responses:
 *       200:
 *         description: File uploaded successfully to subfolder
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileUrl:
 *                   type: string
 *                   description: Public URL of the uploaded file
 *                   example: "https://storage.googleapis.com/bucket-name/Upload_File_Attached/INV001/example.pdf"
 *       400:
 *         description: Bad request (e.g., no file uploaded)
 *       500:
 *         description: Internal server error
 */
router.post(
  "/upload-to-subfolder",
  uploadMiddleware.single("file"),
  uploadToSubfolder
);

module.exports = router;

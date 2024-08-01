const express = require("express");
const router = express.Router();
const detentionLogsController = require("../controllers/detentionLogsController");

/**
 * @swagger
 * /api/detentionLogs:
 *   get:
 *     summary: Get list of detention logs
 *     tags: [DetentionLogs]
 *     parameters:
 *       - in: query
 *         name: EIR_ID
 *         schema:
 *           type: integer
 *         description: The ID of the EIR
 *     responses:
 *       200:
 *         description: A list of detention logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   EIR_ID:
 *                     type: integer
 *                   detention_datetime:
 *                     type: string
 *                     format: date-time
 *                   remark:
 *                     type: string
 *       500:
 *         description: Error retrieving detention logs
 */
router.get("/", detentionLogsController.getDetentionLogs);

/**
 * @swagger
 * /api/detentionLogs:
 *   post:
 *     summary: Add a new detention log
 *     tags: [DetentionLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               EIR_ID:
 *                 type: integer
 *               detention_datetime:
 *                 type: string
 *                 format: date-time
 *               remark:
 *                 type: string
 *     responses:
 *       201:
 *         description: Detention log created successfully
 *       500:
 *         description: Error adding new detention log
 */
router.post("/", detentionLogsController.insertOrUpdateDetentionLog);

/**
 * @swagger
 * /api/detentionLogs:
 *   put:
 *     summary: Update an existing detention log
 *     tags: [DetentionLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               EIR_ID:
 *                 type: integer
 *               detention_datetime:
 *                 type: string
 *                 format: date-time
 *               remark:
 *                 type: string
 *     responses:
 *       200:
 *         description: Detention log updated successfully
 *       500:
 *         description: Error updating detention log
 */
router.put("/", detentionLogsController.updateDetentionLog);

/**
 * @swagger
 * /api/detentionLogs:
 *   delete:
 *     summary: Delete a detention log
 *     tags: [DetentionLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Detention log deleted successfully
 *       500:
 *         description: Error deleting detention log
 */
router.delete("/", detentionLogsController.deleteDetentionLog);

module.exports = router;

const express = require("express");
const router = express.Router();
const groupEirController = require("../controllers/groupEirController");

/**
 * @swagger
 * /api/group-eir/create:
 *   post:
 *     summary: Create new group EIR header
 *     tags: [Group EIR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               create_by:
 *                 type: integer
 *                 description: User ID who creates the group
 *               booking_bl:
 *                 type: string
 *                 description: Booking/BL number
 *     responses:
 *       200:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *                 group_code:
 *                   type: string
 *       500:
 *         description: Error creating group
 */
router.post("/create", groupEirController.createGroupEirHeader);

/**
 * @swagger
 * /api/group-eir/detail:
 *   post:
 *     summary: Create new group EIR detail
 *     tags: [Group EIR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_id:
 *                 type: integer
 *                 description: ID of the group header
 *               eir_id:
 *                 type: integer
 *                 description: ID of the EIR record
 *     responses:
 *       200:
 *         description: Detail created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Error creating detail
 */
router.post("/detail", groupEirController.createGroupEirDetail);

/**
 * @swagger
 * /api/group-eir/detail/add:
 *   post:
 *     summary: Add detail to existing group
 *     tags: [Group EIR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_id:
 *                 type: integer
 *                 description: ID of the group header
 *               eir_id:
 *                 type: integer
 *                 description: ID of the EIR record to add
 *     responses:
 *       200:
 *         description: Detail added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Error adding detail
 */
router.post("/detail/add", groupEirController.addDetailToGroup);

/**
 * @swagger
 * /api/group-eir/detail/{id}:
 *   delete:
 *     summary: Delete group detail by ID
 *     tags: [Group EIR]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group detail ID to delete
 *     responses:
 *       200:
 *         description: Detail deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Error deleting detail
 */
router.delete("/detail/:id", groupEirController.deleteGroupDetail);


/**
 * @swagger
 * /api/group-eir/{group_id}:
 *   get:
 *     summary: Get group EIR details with EIRs and invoices
 *     tags: [Group EIR]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the group to retrieve
 *     responses:
 *       200:
 *         description: Group details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     group_code:
 *                       type: string
 *                     booking_bl:
 *                       type: string
 *                     eirs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           receipt_no:
 *                             type: string
 *                           invoices:
 *                             type: array
 *                             items:
 *                               type: object
 *       404:
 *         description: Group not found
 *       500:
 *         description: Error retrieving group details
 */
router.get("/:group_id", groupEirController.getGroupDetails);



module.exports = router;
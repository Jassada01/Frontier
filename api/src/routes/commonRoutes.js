const express = require("express");
const router = express.Router();
const commonController = require("../controllers/commonController");

/**
 * @swagger
 * /api/common/getProvince:
 *   get:
 *     summary: Get list of provinces
 *     tags: [Common]
 *     parameters:
 *       - in: query
 *         name: province_id
 *         schema:
 *           type: integer
 *         description: The ID of the province
 *     responses:
 *       200:
 *         description: A list of provinces
 *       500:
 *         description: Error retrieving provinces
 */
router.get("/getProvince", commonController.getProvinces);

/**
 * @swagger
 * /api/common/getConditions:
 *   get:
 *     summary: Get list of active conditions
 *     tags: [Common]
 *     responses:
 *       200:
 *         description: A list of active conditions
 *       500:
 *         description: Error retrieving conditions
 */
router.get("/getConditions", commonController.getConditions);

/**
 * @swagger
 * /api/common/getProductPrices:
 *   get:
 *     summary: Get product prices
 *     tags: [Common]
 *     parameters:
 *       - in: query
 *         name: agent_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the agent
 *       - in: query
 *         name: yards_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the yard
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         required: true
 *         description: The size of the product
 *     responses:
 *       200:
 *         description: A list of product prices
 *       400:
 *         description: Missing required query parameters
 *       500:
 *         description: Error retrieving product prices
 */
router.get("/getProductPrices", commonController.getProductPrices);

/**
 * @swagger
 * /api/common/agentEirCount:
 *   get:
 *     summary: Get agent EIR count
 *     tags: [Agent EIR Count]
 *     responses:
 *       200:
 *         description: Agent EIR count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   agent_id:
 *                     type: integer
 *                   agent_code:
 *                     type: string
 *                   image_path:
 *                     type: string
 *                   size_types:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         size_type:
 *                           type: string
 *                         CNT:
 *                           type: integer
 *       500:
 *         description: Error retrieving agent EIR count
 */
router.get("/agentEirCount", commonController.getAgentEirCount);

/**
 * @swagger
 * /api/common/initialData:
 *   get:
 *     summary: Get initial data for agents, clients, drivers, yards, zones, and conditions
 *     tags: [Common]
 *     responses:
 *       200:
 *         description: Initial data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Agent:
 *                   type: array
 *                   items:
 *                     type: object
 *                 Client:
 *                   type: array
 *                   items:
 *                     type: object
 *                 Driver:
 *                   type: array
 *                   items:
 *                     type: object
 *                 Yard:
 *                   type: array
 *                   items:
 *                     type: object
 *                 Zone:
 *                   type: array
 *                   items:
 *                     type: object
 *                 Condition:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Error retrieving initial data
 */
router.get("/initialData", commonController.getInitialData);

/**
 * @swagger
 * /api/common/getDetentionLogs:
 *   get:
 *     summary: Get detention logs
 *     tags: [Common]
 *     responses:
 *       200:
 *         description: Detention logs retrieved successfully
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
 *                   receipt_no:
 *                     type: string
 *                   detention_datetime:
 *                     type: string
 *                     format: date-time
 *                   booking_bl:
 *                     type: string
 *                   container:
 *                     type: string
 *                   remark:
 *                     type: string
 *                   agent_code:
 *                     type: string
 *                   size_type:
 *                     type: string
 *                   yard:
 *                     type: string
 *       500:
 *         description: Error retrieving detention logs
 */
router.get("/getDetentionLogs", commonController.getDetentionLogs);

/**
 * @swagger
 * /api/common/getEquipmentInterchangeReceipt:
 *   get:
 *     summary: Get equipment interchange receipt by container number
 *     tags: [Common]
 *     parameters:
 *       - in: query
 *         name: container
 *         schema:
 *           type: string
 *         required: true
 *         description: The container number
 *     responses:
 *       200:
 *         description: Equipment interchange receipt retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   entry_type:
 *                     type: string
 *                   drop_container:
 *                     type: boolean
 *                   receipt_no:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   agent_id:
 *                     type: integer
 *                   agent_code:
 *                     type: string
 *                   client_id:
 *                     type: integer
 *                   client_code:
 *                     type: string
 *                   booking_bl:
 *                     type: string
 *                   container:
 *                     type: string
 *                   container_color:
 *                     type: string
 *                   size_type:
 *                     type: string
 *                   seal_no:
 *                     type: string
 *                   vessel:
 *                     type: string
 *                   zone_id:
 *                     type: integer
 *                   zone:
 *                     type: string
 *                   path_map:
 *                     type: string
 *                   tare:
 *                     type: number
 *                   voyage:
 *                     type: string
 *                   truck_license:
 *                     type: string
 *                   driver_id:
 *                     type: integer
 *                   driver_name:
 *                     type: string
 *                   truck_company:
 *                     type: string
 *                   tel:
 *                     type: string
 *                   yard_id:
 *                     type: integer
 *                   yard:
 *                     type: string
 *                   status_id:
 *                     type: integer
 *                   remark:
 *                     type: string
 *                   driver_sign:
 *                     type: string
 *                   receiver_sign:
 *                     type: string
 *                   create_user:
 *                     type: integer
 *                   create_datetime:
 *                     type: string
 *                     format: date-time
 *                   update_user:
 *                     type: integer
 *                   update_datetime:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Container number is required
 *       500:
 *         description: Error retrieving equipment interchange receipt
 */
router.get(
  "/getEquipmentInterchangeReceipt",
  commonController.getEquipmentInterchangeReceipt
);

module.exports = router;

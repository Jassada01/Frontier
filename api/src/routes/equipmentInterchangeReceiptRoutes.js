const express = require("express");
const router = express.Router();
const equipmentInterchangeReceiptController = require("../controllers/equipmentInterchangeReceiptController");

/**
 * @swagger
 * /api/EIR/add:
 *   post:
 *     summary: Add a new equipment interchange receipt
 *     tags: [EquipmentInterchangeReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entry_type:
 *                 type: string
 *                 enum: [IN, OUT]
 *               drop_container:
 *                 type: boolean
 *               receipt_no:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               agent_id:
 *                 type: integer
 *               agent_code:
 *                 type: string
 *               client_id:
 *                 type: integer
 *               client_code:
 *                 type: string
 *               booking_bl:
 *                 type: string
 *               container:
 *                 type: string
 *               container_color:
 *                 type: string
 *               size_type:
 *                 type: string
 *               seal_no:
 *                 type: string
 *               vessel:
 *                 type: string
 *               zone_id:
 *                 type: integer
 *               zone:
 *                 type: string
 *               path_map:
 *                 type: string
 *               tare:
 *                 type: number
 *               voyage:
 *                 type: string
 *               truck_license:
 *                 type: string
 *               driver_id:
 *                 type: integer
 *               driver_name:
 *                 type: string
 *               truck_company:
 *                 type: string
 *               tel:
 *                 type: string
 *               yard_id:
 *                 type: integer
 *               yard:
 *                 type: string
 *               status_id:
 *                 type: integer
 *               remark:
 *                 type: string
 *               driver_sign:
 *                 type: string
 *               receiver_sign:
 *                 type: string
 *               create_user:
 *                 type: integer
 *               update_user:
 *                 type: integer
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     condition_id:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Equipment interchange receipt created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 equipment_interchange_receipt_id:
 *                   type: integer
 *       500:
 *         description: Error adding new equipment interchange receipt
 */
router.post(
  "/add",
  equipmentInterchangeReceiptController.addEquipmentInterchangeReceipt
);

/**
 * @swagger
 * /api/EIR/get:
 *   get:
 *     summary: Get list of equipment interchange receipts
 *     tags: [EquipmentInterchangeReceipt]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: The ID of the equipment interchange receipt
 *       - in: query
 *         name: entry_type
 *         schema:
 *           type: string
 *           enum: [IN, OUT]
 *         description: The entry type of the equipment interchange receipt
 *       - in: query
 *         name: status_id
 *         schema:
 *           type: integer
 *         description: The status ID of the equipment interchange receipt
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date for filtering the receipts
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date for filtering the receipts
 *     responses:
 *       200:
 *         description: A list of equipment interchange receipts
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
 *                   status_name_th:
 *                     type: string
 *                   status_name_en:
 *                     type: string
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
 *                   group_id:
 *                     type: integer
 *                     description: The ID of the equipment interchange receipt group
 *                   group_code:
 *                     type: string
 *                     description: The code of the equipment interchange receipt group
 *                   conditions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         condition_id:
 *                           type: integer
 *                         condition_name_en:
 *                           type: string
 *                         condition_name_th:
 *                           type: string
 *                         position_x:
 *                           type: number
 *                         position_y:
 *                           type: number
 *       500:
 *         description: Error retrieving equipment interchange receipts
 */
router.get(
  "/get",
  equipmentInterchangeReceiptController.getEquipmentInterchangeReceipts
);

/**
 * @swagger
 * /api/EIR/update/{id}:
 *   put:
 *     summary: Update an existing equipment interchange receipt
 *     tags: [EquipmentInterchangeReceipt]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the equipment interchange receipt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entry_type:
 *                 type: string
 *                 enum: [IN, OUT]
 *               drop_container:
 *                 type: boolean
 *               receipt_no:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               agent_id:
 *                 type: integer
 *               agent_code:
 *                 type: string
 *               client_id:
 *                 type: integer
 *               client_code:
 *                 type: string
 *               booking_bl:
 *                 type: string
 *               container:
 *                 type: string
 *               container_color:
 *                 type: string
 *               size_type:
 *                 type: string
 *               seal_no:
 *                 type: string
 *               vessel:
 *                 type: string
 *               zone_id:
 *                 type: integer
 *               zone:
 *                 type: string
 *               path_map:
 *                 type: string
 *               tare:
 *                 type: number
 *               voyage:
 *                 type: string
 *               truck_license:
 *                 type: string
 *               driver_id:
 *                 type: integer
 *               driver_name:
 *                 type: string
 *               truck_company:
 *                 type: string
 *               tel:
 *                 type: string
 *               yard_id:
 *                 type: integer
 *               yard:
 *                 type: string
 *               status_id:
 *                 type: integer
 *               remark:
 *                 type: string
 *               driver_sign:
 *                 type: string
 *               receiver_sign:
 *                 type: string
 *               create_user:
 *                 type: integer
 *               update_user:
 *                 type: integer
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     condition_id:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Equipment interchange receipt updated successfully
 *       500:
 *         description: Error updating equipment interchange receipt
 */
router.put(
  "/update/:id",
  equipmentInterchangeReceiptController.updateEquipmentInterchangeReceipt
);

/**
 * @swagger
 * /api/EIR/getFiltered:
 *   get:
 *     summary: Get filtered list of equipment interchange receipts
 *     tags: [EquipmentInterchangeReceipt]
 *     parameters:
 *       - in: query
 *         name: entry_type
 *         schema:
 *           type: string
 *           enum: [IN, OUT]
 *         description: The entry type of the equipment interchange receipt
 *       - in: query
 *         name: drop_container
 *         schema:
 *           type: boolean
 *         description: Filter by drop container status
 *     responses:
 *       200:
 *         description: A list of filtered equipment interchange receipts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   receipt_no:
 *                     type: string
 *                   entry_type:
 *                     type: string
 *                   drop_container:
 *                     type: boolean
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   agent_id:
 *                     type: integer
 *                   container:
 *                     type: string
 *       500:
 *         description: Error retrieving filtered equipment interchange receipts
 */
router.get(
  "/getFiltered",
  equipmentInterchangeReceiptController.getFilteredEquipmentInterchangeReceipts
);

/**
 * @swagger
 * /api/EIR/createInvoiceManual:
 *   post:
 *     summary: Create invoice without initial item
 *     tags: [EquipmentInterchangeReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               equipmentId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date-time
 *               agent_id:
 *                 type: integer
 *               yard_id:
 *                 type: integer
 *               size_type:
 *                 type: string
 *               entry_type:
 *                 type: string
 *                 enum: [IN, OUT]
 *     responses:
 *       201:
 *         description: Invoice created successfully without initial item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 equipment_interchange_receipt_id:
 *                   type: integer
 *                 invoice_id:
 *                   type: integer
 *       500:
 *         description: Error creating invoice
 */
router.post(
  "/createInvoiceManual",
  equipmentInterchangeReceiptController.createInvoiceWithoutInitialItem
);

/**
 * @swagger
 * /api/EIR/createInvoiceDetailsforDropOut:
 *   post:
 *     summary: Create invoice details based on equipmentId and invoiceHeaderId
 *     tags: [EquipmentInterchangeReceipt]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               equipmentId:
 *                 type: integer
 *                 description: The ID of the equipment interchange receipt
 *                 example: 123
 *               invoiceHeaderId:
 *                 type: integer
 *                 description: The ID of the invoice header where details will be added
 *                 example: 456
 *     responses:
 *       201:
 *         description: Invoice details created and total updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invoice details created and total updated successfully
 *                 invoice_header_id:
 *                   type: integer
 *                   description: The ID of the invoice header
 *                   example: 456
 *       400:
 *         description: Invalid input, equipmentId and invoiceHeaderId are required
 *       404:
 *         description: No matching records found for the provided equipmentId
 *       500:
 *         description: Error creating invoice details
 */
router.post(
  "/createInvoiceDetailsforDropOut",
  equipmentInterchangeReceiptController.createInvoiceDetailsForEquipment
);

/**
 * @swagger
 * /api/EIR/getAvailableContainers:
 *   get:
 *     summary: Get available containers for specific agent with optional filters
 *     tags: [EquipmentInterchangeReceipt]
 *     parameters:
 *       - in: query
 *         name: agent_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the agent
 *         example: 1
 *       - in: query
 *         name: size_type
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional - The size type of container (e.g., "40' HC")
 *         example: "40' HC"
 *       - in: query
 *         name: drop_container
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Optional - Filter by drop container status
 *         example: false
 *     responses:
 *       200:
 *         description: List of available containers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Container'
 */
router.get(
  "/getAvailableContainers",
  equipmentInterchangeReceiptController.getAvailableContainers
);

/**
 * @swagger
 * /api/EIR/getBookingOrContainerFiles:
 *   get:
 *     summary: Get booking or container files by type and relate_eir
 *     tags: [EquipmentInterchangeReceipt]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IN, OUT]
 *         required: true
 *         description: The type of equipment interchange receipt (IN or OUT)
 *       - in: query
 *         name: relate_eir
 *         schema:
 *           type: integer
 *         required: true
 *         description: The relate EIR ID to fetch files for
 *     responses:
 *       200:
 *         description: A list of booking or container files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   subtype:
 *                     type: string
 *                   file_url:
 *                     type: string
 *                   file_name:
 *                     type: string
 *                   file_type:
 *                     type: string
 *       400:
 *         description: Invalid input, type and relate_eir are required
 *       500:
 *         description: Error fetching booking or container files
 */
router.get(
  "/getBookingOrContainerFiles",
  equipmentInterchangeReceiptController.getBookingOrContainerFiles
);

module.exports = router;

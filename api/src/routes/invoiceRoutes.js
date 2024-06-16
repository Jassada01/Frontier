const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

/**
 * @swagger
 * /api/invoices/get:
 *   get:
 *     summary: Get invoice details
 *     tags: [Invoices]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: The ID of the invoice
 *       - in: query
 *         name: eir_id
 *         schema:
 *           type: integer
 *         description: The EIR ID associated with the invoice
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date for filtering invoices
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date for filtering invoices
 *     responses:
 *       200:
 *         description: An invoice with details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   invoice_no:
 *                     type: string
 *                   invoice_date:
 *                     type: string
 *                     format: date
 *                   client_id:
 *                     type: integer
 *                   customer_name:
 *                     type: string
 *                   customer_name_eng:
 *                     type: string
 *                     nullable: true
 *                   customer_address:
 *                     type: string
 *                     nullable: true
 *                   customer_address_eng:
 *                     type: string
 *                     nullable: true
 *                   customer_address_branch:
 *                     type: string
 *                     nullable: true
 *                   customer_address_branch_eng:
 *                     type: string
 *                     nullable: true
 *                   tax_id:
 *                     type: string
 *                   invoice_language:
 *                     type: string
 *                   agent_id:
 *                     type: integer
 *                   agent_code:
 *                     type: string
 *                   driver_id:
 *                     type: integer
 *                   driver:
 *                     type: string
 *                   truck_license:
 *                     type: string
 *                   truck_company:
 *                     type: string
 *                   container:
 *                     type: string
 *                   size_type:
 *                     type: string
 *                     nullable: true
 *                   shipper:
 *                     type: string
 *                   vessel:
 *                     type: string
 *                     nullable: true
 *                   voyage:
 *                     type: string
 *                     nullable: true
 *                   booking_bl:
 *                     type: string
 *                     nullable: true
 *                   yard_id:
 *                     type: integer
 *                   yard:
 *                     type: string
 *                   total_amount:
 *                     type: number
 *                     format: decimal
 *                   vat_amount:
 *                     type: number
 *                     format: decimal
 *                   total_with_holding_tax:
 *                     type: number
 *                     format: decimal
 *                     nullable: true
 *                   total_discount:
 *                     type: number
 *                     format: decimal
 *                   net_total:
 *                     type: number
 *                     format: decimal
 *                   grand_total:
 *                     type: number
 *                     format: decimal
 *                   payment_total:
 *                     type: number
 *                     format: decimal
 *                   status_id:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   wht_status:
 *                     type: integer
 *                     nullable: true
 *                   note:
 *                     type: string
 *                     nullable: true
 *                   payment_method:
 *                     type: string
 *                     nullable: true
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
 *                   eir_id:
 *                     type: integer
 *                   detail:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         invoice_header_id:
 *                           type: integer
 *                         price_list_id:
 *                           type: integer
 *                         description:
 *                           type: string
 *                         description_eng:
 *                           type: string
 *                           nullable: true
 *                         quantity:
 *                           type: number
 *                           format: decimal
 *                         unit_price:
 *                           type: number
 *                           format: decimal
 *                         amount:
 *                           type: number
 *                           format: decimal
 *                         remark:
 *                           type: string
 *                           nullable: true
 *       500:
 *         description: Error retrieving invoice
 */
router.get("/get", invoiceController.getInvoice);

/**
 * @swagger
 * /api/invoices/update/{id}:
 *   put:
 *     summary: Update an existing invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the invoice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoice_no:
 *                 type: string
 *               invoice_date:
 *                 type: string
 *                 format: date
 *               client_id:
 *                 type: integer
 *               customer_name:
 *                 type: string
 *               customer_name_eng:
 *                 type: string
 *                 nullable: true
 *               customer_address:
 *                 type: string
 *                 nullable: true
 *               customer_address_eng:
 *                 type: string
 *                 nullable: true
 *               customer_address_branch:
 *                 type: string
 *                 nullable: true
 *               customer_address_branch_eng:
 *                 type: string
 *                 nullable: true
 *               tax_id:
 *                 type: string
 *               invoice_language:
 *                 type: string
 *               agent_id:
 *                 type: integer
 *               agent_code:
 *                 type: string
 *               driver_id:
 *                 type: integer
 *               driver:
 *                 type: string
 *               truck_license:
 *                 type: string
 *               truck_company:
 *                 type: string
 *               container:
 *                 type: string
 *               size_type:
 *                 type: string
 *                 nullable: true
 *               shipper:
 *                 type: string
 *               vessel:
 *                 type: string
 *                 nullable: true
 *               voyage:
 *                 type: string
 *                 nullable: true
 *               booking_bl:
 *                 type: string
 *                 nullable: true
 *               yard_id:
 *                 type: integer
 *               yard:
 *                 type: string
 *               total_amount:
 *                 type: number
 *                 format: decimal
 *               vat_amount:
 *                 type: number
 *                 format: decimal
 *               total_with_holding_tax:
 *                 type: number
 *                 format: decimal
 *                 nullable: true
 *               total_discount:
 *                 type: number
 *                 format: decimal
 *               net_total:
 *                 type: number
 *                 format: decimal
 *               grand_total:
 *                 type: number
 *                 format: decimal
 *               payment_total:
 *                 type: number
 *                 format: decimal
 *               status_id:
 *                 type: integer
 *               status:
 *                 type: string
 *               wht_status:
 *                 type: integer
 *                 nullable: true
 *               note:
 *                 type: string
 *                 nullable: true
 *               payment_method:
 *                 type: string
 *                 nullable: true
 *               create_user:
 *                 type: integer
 *               create_datetime:
 *                 type: string
 *                 format: date-time
 *               update_user:
 *                 type: integer
 *               update_datetime:
 *                 type: string
 *                 format: date-time
 *               eir_id:
 *                 type: integer
 *               detail:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     price_list_id:
 *                       type: integer
 *                     description:
 *                       type: string
 *                     description_eng:
 *                       type: string
 *                       nullable: true
 *                     quantity:
 *                       type: number
 *                       format: decimal
 *                     unit_price:
 *                       type: number
 *                       format: decimal
 *                     amount:
 *                       type: number
 *                       format: decimal
 *                     remark:
 *                       type: string
 *                       nullable: true
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       500:
 *         description: Error updating invoice
 */
router.put("/update/:id", invoiceController.updateInvoice);

/**
 * @swagger
 * /api/invoices/getInvoiceByEirId:
 *   get:
 *     summary: Get invoice by EIR ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: query
 *         name: eir_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The EIR ID associated with the invoice
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   invoice_id:
 *                     type: integer
 *                   invoice_no:
 *                     type: string
 *                   status_id:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   eir_id:
 *                     type: integer
 *       400:
 *         description: Missing or invalid eir_id
 *       500:
 *         description: Error retrieving invoices
 */
router.get("/getInvoiceByEirId", invoiceController.getInvoiceByEirId);

module.exports = router;

const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required:
 *         - client_code
 *         - name
 *         - line_token
 *       properties:
 *         client_code:
 *           type: string
 *         name:
 *           type: string
 *         branch:
 *           type: string
 *         address:
 *           type: string
 *         billing_address:
 *           type: string
 *         tax_id:
 *           type: string
 *         contact_person:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         attribute1:
 *           type: string
 *         attribute2:
 *           type: string
 *         attribute3:
 *           type: string
 *         attribute4:
 *           type: string
 *         attribute5:
 *           type: string
 *         line_token:
 *           type: string
 *           description: Token for LINE integration
 *         is_active:
 *           type: boolean
 *           default: true
 *         remark:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Client
 *   description: API for managing clients
 */

/**
 * @swagger
 * /api/client/add:
 *   post:
 *     summary: Add a new client
 *     tags: [Client]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Client added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 client_id:
 *                   type: integer
 *       500:
 *         description: Error adding new client
 */

router.post("/add", clientController.addClient);

/**
 * @swagger
 * /api/client/get:
 *   get:
 *     summary: Get client information
 *     tags: [Client]
 *     parameters:
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: integer
 *         description: The ID of the client
 *     responses:
 *       200:
 *         description: Client information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       500:
 *         description: Error retrieving client information
 */

router.get("/get", clientController.getClient); // เส้นทางสำหรับดึงข้อมูลของ Client

/**
 * @swagger
 * /api/client/update/{client_id}:
 *   put:
 *     summary: Update an existing client
 *     tags: [Client]
 *     parameters:
 *       - in: path
 *         name: client_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the client to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error updating client
 */

router.put("/update/:client_id", clientController.updateClient); // เส้นทางสำหรับอัปเดตข้อมูลของ Client

module.exports = router;

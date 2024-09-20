// clientFreeDropPeriodRoutes.js
const express = require("express");
const router = express.Router();
const clientFreeDropPeriodController = require("../controllers/clientFreeDropPeriodController");

/**
 * @swagger
 * components:
 *   schemas:
 *     ClientFreeDropPeriod:
 *       type: object
 *       required:
 *         - client_id
 *         - free_period
 *         - expire_date
 *       properties:
 *         client_id:
 *           type: integer
 *         free_period:
 *           type: integer
 *           description: Number of free days
 *         expire_date:
 *           type: string
 *           format: date
 *           description: Expiry date of the free period
 *         is_active:
 *           type: boolean
 *           default: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: ClientFreeDropPeriod
 *   description: API for managing client free drop periods
 */

/**
 * @swagger
 * /api/clientFreeDropPeriod/add:
 *   post:
 *     summary: Add a new client free drop period
 *     tags: [ClientFreeDropPeriod]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientFreeDropPeriod'
 *     responses:
 *       200:
 *         description: Client free drop period added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *       500:
 *         description: Error adding client free drop period
 */

router.post("/add", clientFreeDropPeriodController.addClientFreeDropPeriod);

/**
 * @swagger
 * /api/clientFreeDropPeriod/get:
 *   get:
 *     summary: Get client free drop period information
 *     tags: [ClientFreeDropPeriod]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: The ID of the client free drop period
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: integer
 *         description: The client ID to filter by
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Client free drop period information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClientFreeDropPeriod'
 *       500:
 *         description: Error retrieving client free drop period information
 */

router.get("/get", clientFreeDropPeriodController.getClientFreeDropPeriod);

/**
 * @swagger
 * /api/clientFreeDropPeriod/update/{id}:
 *   put:
 *     summary: Update an existing client free drop period
 *     tags: [ClientFreeDropPeriod]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the client free drop period to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientFreeDropPeriod'
 *     responses:
 *       200:
 *         description: Client free drop period updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Error updating client free drop period
 */

router.put(
  "/update/:id",
  clientFreeDropPeriodController.updateClientFreeDropPeriod
);

module.exports = router;

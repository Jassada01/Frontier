const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceListController');

/**
 * @swagger
 * /api/prices/add:
 *   post:
 *     summary: Add a new price
 *     tags: [Prices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name_th:
 *                 type: string
 *               name_eng:
 *                 type: string
 *               price:
 *                 type: number
 *               note:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Price created successfully
 *       500:
 *         description: Error adding new price
 */
router.post('/add', priceController.addPrice);

/**
 * @swagger
 * /api/prices/get:
 *   get:
 *     summary: Get list of prices
 *     tags: [Prices]
 *     parameters:
 *       - in: query
 *         name: price_id
 *         schema:
 *           type: integer
 *         description: The ID of the price
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter prices by active status
 *     responses:
 *       200:
 *         description: A list of prices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name_th:
 *                     type: string
 *                   name_eng:
 *                     type: string
 *                   price:
 *                     type: number
 *                   note:
 *                     type: string
 *                   is_active:
 *                     type: boolean
 *       500:
 *         description: Error retrieving prices
 */
router.get('/get', priceController.getPrices);

/**
 * @swagger
 * /api/prices/update/{price_id}:
 *   put:
 *     summary: Update an existing price
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: price_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the price
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name_th:
 *                 type: string
 *               name_eng:
 *                 type: string
 *               price:
 *                 type: number
 *               note:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Price updated successfully
 *       500:
 *         description: Error updating price
 */
router.put('/update/:price_id', priceController.updatePrice);

module.exports = router;

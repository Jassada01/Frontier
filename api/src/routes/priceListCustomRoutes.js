const express = require("express");
const router = express.Router();
const priceListCustomController = require("../controllers/priceListCustomController");

/**
 * @swagger
 * /api/price_custom/add:
 *   post:
 *     summary: Add a new custom price
 *     tags: [PriceCustoms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_id:
 *                 type: integer
 *               yards_id:
 *                 type: integer
 *               size:
 *                 type: string
 *               price:
 *                 type: number
 *               main_price_list_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Custom price created successfully
 *       500:
 *         description: Error adding new custom price
 */
router.post("/add", priceListCustomController.addPriceCustom);

/**
 * @swagger
 * /api/price_custom/get:
 *   get:
 *     summary: Get list of custom prices
 *     tags: [PriceCustoms]
 *     parameters:
 *       - in: query
 *         name: price_custom_id
 *         schema:
 *           type: integer
 *         description: The ID of the custom price
 *       - in: query
 *         name: agent_id
 *         schema:
 *           type: integer
 *         description: The ID of the agent
 *       - in: query
 *         name: yards_id
 *         schema:
 *           type: integer
 *         description: The ID of the yard
 *       - in: query
 *         name: main_price_list_id
 *         schema:
 *           type: integer
 *         description: The ID of the main price list
 *     responses:
 *       200:
 *         description: A list of custom prices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   agent_id:
 *                     type: integer
 *                   yards_id:
 *                     type: integer
 *                   size:
 *                     type: string
 *                   price:
 *                     type: number
 *                   main_price_list_id:
 *                     type: integer
 *       500:
 *         description: Error retrieving custom prices
 */
router.get("/get", priceListCustomController.getPriceCustoms);

/**
 * @swagger
 * /api/price_custom/update/{price_custom_id}:
 *   put:
 *     summary: Update an existing custom price
 *     tags: [PriceCustoms]
 *     parameters:
 *       - in: path
 *         name: price_custom_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the custom price
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_id:
 *                 type: integer
 *               yards_id:
 *                 type: integer
 *               size:
 *                 type: string
 *               price:
 *                 type: number
 *               main_price_list_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Custom price updated successfully
 *       500:
 *         description: Error updating custom price
 */
router.put(
  "/update/:price_custom_id",
  priceListCustomController.updatePriceCustom
);

/**
 * @swagger
 * /api/price_custom/delete/{price_custom_id}:
 *   delete:
 *     summary: Delete a custom price
 *     tags: [PriceCustoms]
 *     parameters:
 *       - in: path
 *         name: price_custom_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the custom price
 *     responses:
 *       200:
 *         description: Custom price deleted successfully
 *       500:
 *         description: Error deleting custom price
 */
router.delete(
  "/delete/:price_custom_id",
  priceListCustomController.deletePriceCustom
);

module.exports = router;

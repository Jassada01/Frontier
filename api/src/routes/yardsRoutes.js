const express = require("express");
const router = express.Router();
const yardsController = require("../controllers/yardsController");

/**
 * @swagger
 * /api/yards/add:
 *   post:
 *     summary: Add a new yard
 *     tags: [Yards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               short_name:
 *                 type: string
 *               yard_name:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               website:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               google_map_link:
 *                 type: string
 *               remark:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Yard created successfully
 *       500:
 *         description: Error adding new yard
 */
router.post("/add", yardsController.addYard);

/**
 * @swagger
 * /api/yards/get:
 *   get:
 *     summary: Get list of yards
 *     tags: [Yards]
 *     parameters:
 *       - in: query
 *         name: yard_id
 *         schema:
 *           type: integer
 *         description: The ID of the yard
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter yards by active status
 *     responses:
 *       200:
 *         description: A list of yards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   short_name:
 *                     type: string
 *                   yard_name:
 *                     type: string
 *                   contact_person:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *                   website:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   google_map_link:
 *                     type: string
 *                   remark:
 *                     type: string
 *                   active:
 *                     type: boolean
 *       500:
 *         description: Error retrieving yards
 */
router.get("/get", yardsController.getYards);

/**
 * @swagger
 * /api/yards/update/{yard_id}:
 *   put:
 *     summary: Update an existing yard
 *     tags: [Yards]
 *     parameters:
 *       - in: path
 *         name: yard_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the yard
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               short_name:
 *                 type: string
 *               yard_name:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               website:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               google_map_link:
 *                 type: string
 *               remark:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Yard updated successfully
 *       500:
 *         description: Error updating yard
 */
router.put("/update/:yard_id", yardsController.updateYard);

module.exports = router;

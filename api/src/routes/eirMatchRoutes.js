const express = require("express");
const router = express.Router();
const eirMatchController = require("../controllers/eirMatchController");

/**
 * @swagger
 * /api/eir_match/add:
 *   post:
 *     summary: Add a new EIR match
 *     tags: [EIR Match]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eir_in:
 *                 type: integer
 *               eir_out:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: EIR match created successfully
 *       500:
 *         description: Error adding new EIR match
 */
router.post("/add", eirMatchController.addEirMatch);

/**
 * @swagger
 * /api/eir_match/get:
 *   get:
 *     summary: Get EIR matches
 *     tags: [EIR Match]
 *     parameters:
 *       - in: query
 *         name: entry_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [IN, OUT]
 *         description: Entry type (IN or OUT)
 *       - in: query
 *         name: eir_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the EIR
 *     responses:
 *       200:
 *         description: A list of EIR matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   eir_in:
 *                     type: integer
 *                   eir_out:
 *                     type: integer
 *                   is_active:
 *                     type: boolean
 *       400:
 *         description: Invalid entry_type
 *       500:
 *         description: Error retrieving EIR matches
 */
router.get("/get", eirMatchController.getEirMatch);

/**
 * @swagger
 * /api/eir_match/update/{match_id}:
 *   put:
 *     summary: Update an existing EIR match
 *     tags: [EIR Match]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the EIR match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eir_in:
 *                 type: integer
 *               eir_out:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: EIR match updated successfully
 *       500:
 *         description: Error updating EIR match
 */
router.put("/update/:match_id", eirMatchController.updateEirMatch);

module.exports = router;

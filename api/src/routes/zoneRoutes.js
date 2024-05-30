const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');

/**
 * @swagger
 * /api/zones/add:
 *   post:
 *     summary: Add a new zone
 *     tags: [Zones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               yard_name:
 *                 type: string
 *               zone:
 *                 type: string
 *               details:
 *                 type: string
 *               contact:
 *                 type: string
 *               path_map:
 *                 type: string
 *               google_map_link:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               max_capacity:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Zone created successfully
 *       500:
 *         description: Error adding new zone
 */
router.post('/add', zoneController.addZone);

/**
 * @swagger
 * /api/zones/get:
 *   get:
 *     summary: Get list of zones
 *     tags: [Zones]
 *     parameters:
 *       - in: query
 *         name: zone_id
 *         schema:
 *           type: integer
 *         description: The ID of the zone
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter zones by active status
 *     responses:
 *       200:
 *         description: A list of zones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   yard_name:
 *                     type: string
 *                   zone:
 *                     type: string
 *                   details:
 *                     type: string
 *                   contact:
 *                     type: string
 *                   path_map:
 *                     type: string
 *                   google_map_link:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   max_capacity:
 *                     type: integer
 *                   active:
 *                     type: boolean
 *       500:
 *         description: Error retrieving zones
 */
router.get('/get', zoneController.getZones);

/**
 * @swagger
 * /api/zones/update/{zone_id}:
 *   put:
 *     summary: Update an existing zone
 *     tags: [Zones]
 *     parameters:
 *       - in: path
 *         name: zone_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the zone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               yard_name:
 *                 type: string
 *               zone:
 *                 type: string
 *               details:
 *                 type: string
 *               contact:
 *                 type: string
 *               path_map:
 *                 type: string
 *               google_map_link:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               max_capacity:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Zone updated successfully
 *       500:
 *         description: Error updating zone
 */
router.put('/update/:zone_id', zoneController.updateZone);

module.exports = router;

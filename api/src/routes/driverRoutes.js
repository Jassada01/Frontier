const express = require("express");
const router = express.Router();
const driversController = require("../controllers/driversController");

/**
 * @swagger
 * /api/drivers/add:
 *   post:
 *     summary: Add a new driver
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driver_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               license_plate:
 *                 type: string
 *               province:
 *                 type: string
 *               truck_company_id:
 *                 type: integer
 *               truck_company_name:
 *                 type: string
 *               driver_image_path:
 *                 type: string
 *               truck_image_path:
 *                 type: string
 *               attr1:
 *                 type: string
 *               attr2:
 *                 type: string
 *               attr3:
 *                 type: string
 *               attr4:
 *                 type: string
 *               attr5:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Driver created successfully
 *       500:
 *         description: Error adding new driver
 */
router.post("/add", driversController.addDriver);

/**
 * @swagger
 * /api/drivers/get:
 *   get:
 *     summary: Get list of drivers
 *     tags: [Drivers]
 *     parameters:
 *       - in: query
 *         name: driver_id
 *         schema:
 *           type: integer
 *         description: The ID of the driver
 *       - in: query
 *         name: truck_company_id
 *         schema:
 *           type: integer
 *         description: The ID of the truck company
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter drivers by active status
 *     responses:
 *       200:
 *         description: A list of drivers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   driver_name:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *                   license_plate:
 *                     type: string
 *                   province:
 *                     type: string
 *                   truck_company_id:
 *                     type: integer
 *                   truck_company_name:
 *                     type: string
 *                   driver_image_path:
 *                     type: string
 *                   truck_image_path:
 *                     type: string
 *                   attr1:
 *                     type: string
 *                   attr2:
 *                     type: string
 *                   attr3:
 *                     type: string
 *                   attr4:
 *                     type: string
 *                   attr5:
 *                     type: string
 *                   is_active:
 *                     type: boolean
 *       500:
 *         description: Error retrieving drivers
 */
router.get("/get", driversController.getDrivers);

/**
 * @swagger
 * /api/drivers/update/{driver_id}:
 *   put:
 *     summary: Update an existing driver
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: driver_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driver_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               license_plate:
 *                 type: string
 *               province:
 *                 type: string
 *               truck_company_id:
 *                 type: integer
 *               truck_company_name:
 *                 type: string
 *               driver_image_path:
 *                 type: string
 *               truck_image_path:
 *                 type: string
 *               attr1:
 *                 type: string
 *               attr2:
 *                 type: string
 *               attr3:
 *                 type: string
 *               attr4:
 *                 type: string
 *               attr5:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Driver updated successfully
 *       500:
 *         description: Error updating driver
 */
router.put("/update/:driver_id", driversController.updateDriver);

module.exports = router;

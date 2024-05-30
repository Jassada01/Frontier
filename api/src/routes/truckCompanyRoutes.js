const express = require("express");
const router = express.Router();
const truckCompanyController = require("../controllers/truckCompanyController");

/**
 * @swagger
 * /api/truck_companies/add:
 *   post:
 *     summary: Add a new truck company
 *     tags: [Truck Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               short_name:
 *                 type: string
 *               address:
 *                 type: string
 *               tax_id:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               line_id:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Truck company created successfully
 *       500:
 *         description: Error adding new truck company
 */
router.post("/add", truckCompanyController.addTruckCompany);

/**
 * @swagger
 * /api/truck_companies/get:
 *   get:
 *     summary: Get list of truck companies
 *     tags: [Truck Companies]
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *         description: The ID of the truck company
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter truck companies by active status
 *     responses:
 *       200:
 *         description: A list of truck companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   company_name:
 *                     type: string
 *                   short_name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   tax_id:
 *                     type: string
 *                   contact_person:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *                   line_id:
 *                     type: string
 *                   active:
 *                     type: boolean
 *       500:
 *         description: Error retrieving truck companies
 */
router.get("/get", truckCompanyController.getTruckCompanies);

/**
 * @swagger
 * /api/truck_companies/update/{company_id}:
 *   put:
 *     summary: Update an existing truck company
 *     tags: [Truck Companies]
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the truck company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               short_name:
 *                 type: string
 *               address:
 *                 type: string
 *               tax_id:
 *                 type: string
 *               contact_person:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               line_id:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Truck company updated successfully
 *       500:
 *         description: Error updating truck company
 */
router.put("/update/:company_id", truckCompanyController.updateTruckCompany);

module.exports = router;

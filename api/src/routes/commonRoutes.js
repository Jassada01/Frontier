const express = require("express");
const router = express.Router();
const commonController = require("../controllers/commonController");

/**
 * @swagger
 * /api/common/getProvince:
 *   get:
 *     summary: Get list of provinces
 *     tags: [Common]
 *     parameters:
 *       - in: query
 *         name: province_id
 *         schema:
 *           type: integer
 *         description: The ID of the province
 *     responses:
 *       200:
 *         description: A list of provinces
 *       500:
 *         description: Error retrieving provinces
 */
router.get("/getProvince", commonController.getProvinces);

/**
 * @swagger
 * /api/common/getConditions:
 *   get:
 *     summary: Get list of active conditions
 *     tags: [Common]
 *     responses:
 *       200:
 *         description: A list of active conditions
 *       500:
 *         description: Error retrieving conditions
 */
router.get("/getConditions", commonController.getConditions);

module.exports = router;

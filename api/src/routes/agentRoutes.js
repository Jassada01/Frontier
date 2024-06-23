const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");

/**
 * @swagger
 * /api/agents/add:
 *   post:
 *     summary: Add a new agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_code:
 *                 type: string
 *               company_name:
 *                 type: string
 *               contact_name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *               other_details:
 *                 type: string
 *               image_path:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Agent created successfully
 *       500:
 *         description: Error adding new agent
 */
router.post("/add", agentController.addAgent);

/**
 * @swagger
 * /api/agents/get:
 *   get:
 *     summary: Get list of agents
 *     tags: [Agents]
 *     parameters:
 *       - in: query
 *         name: agent_id
 *         schema:
 *           type: integer
 *         description: The ID of the agent
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter agents by active status
 *     responses:
 *       200:
 *         description: A list of agents
 *       500:
 *         description: Error retrieving agents
 */
router.get("/get", agentController.getAgents);

/**
 * @swagger
 * /api/agents/update/{agent_id}:
 *   put:
 *     summary: Update an existing agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: agent_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the agent
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_code:
 *                 type: string
 *               company_name:
 *                 type: string
 *               contact_name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *               other_details:
 *                 type: string
 *               image_path:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *       500:
 *         description: Error updating agent
 */
router.put("/update/:agent_id", agentController.updateAgent);

module.exports = router;

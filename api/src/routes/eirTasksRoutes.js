const express = require("express");
const router = express.Router();
const eirTasksController = require("../controllers/eirTasksController");

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get tasks by EIR ID
 *     tags: [EIR Tasks]
 *     parameters:
 *       - in: query
 *         name: eir_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the EIR
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   task_id:
 *                     type: integer
 *                   eir_id:
 *                     type: integer
 *                   task_name:
 *                     type: string
 *                   task_details:
 *                     type: string
 *                   create_datetime:
 *                     type: string
 *                     format: date-time
 *                   complete_datetime:
 *                     type: string
 *                     format: date-time
 *                   cancel_flag:
 *                     type: integer
 *                     enum: [0, 1]
 *                     description: 0 = active, 1 = cancelled
 *       400:
 *         description: EIR ID is required
 *       500:
 *         description: Error retrieving tasks
 */
router.get("/", eirTasksController.getTasksByEIR);

/**
 * @swagger
 * /api/tasks/batch:
 *   post:
 *     summary: Add multiple tasks for an EIR
 *     tags: [EIR Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tasks
 *             properties:
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - eir_id
 *                     - task_name
 *                     - task_details
 *                   properties:
 *                     eir_id:
 *                       type: integer
 *                       description: The ID of the EIR
 *                     task_name:
 *                       type: string
 *                       description: Name of the task
 *                     task_details:
 *                       type: string
 *                       description: Detailed description of the task
 *     responses:
 *       200:
 *         description: Tasks added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tasks added successfully
 *                 inserted_count:
 *                   type: integer
 *                   description: Number of tasks successfully inserted
 *       400:
 *         description: Tasks array is required and cannot be empty
 *       500:
 *         description: Error adding tasks
 */
router.post("/batch", eirTasksController.addTasks);

/**
 * @swagger
 * /api/tasks/{task_id}:
 *   put:
 *     summary: Update a specific task
 *     tags: [EIR Tasks]
 *     parameters:
 *       - in: path
 *         name: task_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task_name:
 *                 type: string
 *                 description: Updated name of the task
 *               task_details:
 *                 type: string
 *                 description: Updated details of the task
 *               complete_datetime:
 *                 type: string
 *                 format: date-time
 *                 description: Completion datetime of the task
 *               cancel_flag:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: 0 = active, 1 = cancelled
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task updated successfully
 *       400:
 *         description: Task ID is required
 *       500:
 *         description: Error updating task
 */
router.put("/:task_id", eirTasksController.updateTask);

/**
 * @swagger
 * /api/tasks/{task_id}:
 *   delete:
 *     summary: Delete a specific task
 *     tags: [EIR Tasks]
 *     parameters:
 *       - in: path
 *         name: task_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the task to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task deleted successfully
 *       400:
 *         description: Task ID is required
 *       500:
 *         description: Error deleting task
 */
router.delete("/:task_id", eirTasksController.deleteTask);


/**
 * @swagger
 * /api/tasks/{task_id}/complete:
 *   put:
 *     summary: Mark a task as completed
 *     tags: [EIR Tasks]
 *     parameters:
 *       - in: path
 *         name: task_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the task to complete
 *     responses:
 *       200:
 *         description: Task completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task completed successfully
 *                 complete_datetime:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Task ID is required
 *       404:
 *         description: Task not found or already completed
 *       500:
 *         description: Error completing task
 */
router.put("/:task_id/complete", eirTasksController.completeTask);



module.exports = router;
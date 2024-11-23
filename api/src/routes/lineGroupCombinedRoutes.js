const express = require("express");
const router = express.Router();
const lineGroupCombinedController = require("../controllers/lineGroupCombinedController");

/**
 * @swagger
 * /api/line-groups/create:
 *   post:
 *     summary: Create a new LINE customer group with members
 *     tags: [LINE Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_name:
 *                 type: string
 *               group_image:
 *                 type: string
 *               notes:
 *                 type: string
 *               created_by:
 *                 type: integer
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     line_user_id:
 *                       type: string
 *     responses:
 *       200:
 *         description: Group and members created successfully
 *       500:
 *         description: Error creating group and members
 */
router.post("/create", lineGroupCombinedController.createGroupWithMembers);

/**
 * @swagger
 * /api/line-groups:
 *   get:
 *     summary: Get LINE customer groups with their members
 *     tags: [LINE Groups]
 *     parameters:
 *       - in: query
 *         name: group_id
 *         schema:
 *           type: integer
 *         description: The ID of the group (optional)
 *     responses:
 *       200:
 *         description: Group(s) and members information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   group_id:
 *                     type: integer
 *                   group_name:
 *                     type: string
 *                   group_image:
 *                     type: string
 *                   notes:
 *                     type: string
 *                   created_by:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                   members:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         line_user_id:
 *                           type: string
 *                         display_name:
 *                           type: string
 *                         picture_url:
 *                           type: string
 *                         user_type:
 *                           type: string
 *                         name:
 *                           type: string
 *                         company_name:
 *                           type: string
 *       500:
 *         description: Error retrieving group information
 */
router.get("/", lineGroupCombinedController.getGroupsWithMembers);

/**
 * @swagger
 * /api/line-groups/update/{group_id}:
 *   put:
 *     summary: Update a LINE customer group and its members
 *     tags: [LINE Groups]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_name:
 *                 type: string
 *               group_image:
 *                 type: string
 *               notes:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Group and members updated successfully
 *       500:
 *         description: Error updating group and members
 */
router.put(
  "/update/:group_id",
  lineGroupCombinedController.updateGroupAndMembers
);

/**
 * @swagger
 * /api/line-groups/delete/{group_id}:
 *   delete:
 *     summary: Delete a LINE customer group and its members
 *     tags: [LINE Groups]
 *     parameters:
 *       - in: path
 *         name: group_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the group
 *     responses:
 *       200:
 *         description: Group and all associated members deleted successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Error deleting group and members
 */
router.delete(
  "/delete/:group_id",
  lineGroupCombinedController.deleteGroupAndMembers
);

module.exports = router;

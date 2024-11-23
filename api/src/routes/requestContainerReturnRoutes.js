const express = require("express");
const router = express.Router();
const requestContainerReturnController = require("../controllers/requestContainerReturnController");

/**
 * @swagger
 * /api/container-returns/add:
 *   post:
 *     summary: Add a new container return request
 *     tags: [Container Returns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_id:
 *                 type: integer
 *               bl_number:
 *                 type: string
 *               additional_notes:
 *                 type: string
 *               containers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     containerNumber:
 *                       type: string
 *                     containerSize:
 *                       type: string
 *                     imageUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *               return_document_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *               line_user_id:
 *                 type: string
 *                 description: LINE User ID of the requester
 *     responses:
 *       201:
 *         description: Container return request created successfully
 *       500:
 *         description: Error adding new container return request
 */
router.post("/add", requestContainerReturnController.addContainerReturn);

/**
 * @swagger
 * /api/container-returns/get:
 *   get:
 *     summary: Get list of container return requests
 *     tags: [Container Returns]
 *     parameters:
 *       - in: query
 *         name: request_id
 *         schema:
 *           type: integer
 *         description: Filter by specific request ID
 *       - in: query
 *         name: agent_id
 *         schema:
 *           type: integer
 *         description: Filter by agent ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Complete, Cancel]
 *         description: Filter by request status
 *       - in: query
 *         name: line_user_id
 *         schema:
 *           type: string
 *         description: Filter by LINE User ID (includes requests from the same group)
 *     responses:
 *       200:
 *         description: A list of container return requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Request ID
 *                   agent_id:
 *                     type: integer
 *                     description: Agent ID
 *                   agent_code:
 *                     type: string
 *                     description: Agent code
 *                   bl_number:
 *                     type: string
 *                     description: Bill of Lading number
 *                   additional_notes:
 *                     type: string
 *                     description: Additional notes for the request
 *                   create_line_id:
 *                     type: string
 *                     description: LINE User ID of request creator
 *                   status:
 *                     type: string
 *                     enum: [Pending, Complete, Cancel]
 *                     description: Current status of the request
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     description: Request creation timestamp
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     description: Request last update timestamp
 *                   container_details:
 *                     type: array
 *                     description: List of containers in the request
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Container detail ID
 *                         container_number:
 *                           type: string
 *                           description: Container number
 *                         container_size:
 *                           type: string
 *                           description: Container size
 *                         EIR_NO:
 *                           type: string
 *                           description: Equipment Interchange Receipt number
 *                         EIR_date:
 *                           type: string
 *                           format: date-time
 *                           description: EIR date
 *                         container_images:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: URLs of container images
 *                   return_documents:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: URLs of return documents
 *                   user_profile:
 *                     type: object
 *                     description: Profile information of the request creator
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: User profile ID
 *                       line_user_id:
 *                         type: string
 *                         description: LINE User ID
 *                       display_name:
 *                         type: string
 *                         description: User display name
 *                       picture_url:
 *                         type: string
 *                         description: User profile picture URL
 *                       user_type:
 *                         type: string
 *                         description: Type of user
 *                       name:
 *                         type: string
 *                         description: User's full name
 *                       company_name:
 *                         type: string
 *                         description: User's company name
 *                       company_id:
 *                         type: integer
 *                         description: User's company ID
 *                   user_groups:
 *                     type: array
 *                     description: List of LINE groups the user belongs to
 *                     items:
 *                       type: object
 *                       properties:
 *                         group_id:
 *                           type: integer
 *                           description: LINE group ID
 *                         group_name:
 *                           type: string
 *                           description: LINE group name
 *       500:
 *         description: Error retrieving container return requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.get("/get", requestContainerReturnController.getContainerReturns);

/**
 * @swagger
 * /api/container-returns/update/{request_id}:
 *   put:
 *     summary: Update an existing container return request
 *     tags: [Container Returns]
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the container return request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_id:
 *                 type: integer
 *               bl_number:
 *                 type: string
 *               additional_notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               containers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     containerNumber:
 *                       type: string
 *                     containerSize:
 *                       type: string
 *                     imageUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *               return_document_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *               line_user_id:
 *                 type: string
 *                 description: LINE User ID of the updater
 *     responses:
 *       200:
 *         description: Container return request updated successfully
 *       500:
 *         description: Error updating container return request
 */
router.put(
  "/update/:request_id",
  requestContainerReturnController.updateContainerReturn
);

/**
 * @swagger
 * /api/container-returns/cancel/{request_id}:
 *   put:
 *     summary: Cancel an existing container return request
 *     tags: [Container Returns]
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the container return request to cancel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               line_user_id:
 *                 type: string
 *                 description: LINE User ID of the user cancelling the request
 *     responses:
 *       200:
 *         description: Container return request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 request_id:
 *                   type: integer
 *       400:
 *         description: Error cancelling container return request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.put(
  "/cancel/:request_id",
  requestContainerReturnController.cancelContainerReturn
);


/**
 * @swagger
 * /api/container-returns/{request_id}/details/{detail_id}/eir:
 *   patch:
 *     summary: Update container EIR status and manage request status
 *     tags: [Container Returns]
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the container return request
 *       - in: path
 *         name: detail_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the container detail to update
 *     responses:
 *       200:
 *         description: Container EIR updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 request_id:
 *                   type: integer
 *                   description: The request ID
 *                 detail_id:
 *                   type: integer
 *                   description: The container detail ID
 *                 new_status:
 *                   type: string
 *                   enum: [Complete, Cancel, 'No status change']
 *                   description: The new status of the request after update
 *       500:
 *         description: Error updating container EIR
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.patch(
  "/:request_id/details/:detail_id/eir",
  requestContainerReturnController.updateContainerEIR
);

module.exports = router;

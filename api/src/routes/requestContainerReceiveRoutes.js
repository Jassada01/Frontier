const express = require("express");
const router = express.Router();
const requestContainerReceiveController = require("../controllers/requestContainerReceiveController");

/**
 * @swagger
 * /api/container-receives/add:
 *   post:
 *     summary: Add a new container receive request
 *     tags: [Container Receives]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_id:
 *                 type: integer
 *                 description: ID of the agent
 *               booking_no:
 *                 type: string
 *                 description: Booking number
 *               request_date:
 *                 type: string
 *                 format: date-time
 *                 description: Request date and time
 *               create_line_id:
 *                 type: string
 *                 description: LINE User ID of the requester
 *               remark:
 *                 type: string
 *                 description: Additional notes for the request
 *               status:
 *                 type: string
 *                 enum: [Pending, Complete, Cancel]
 *                 description: Status of the request
 *               containers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     container_size:
 *                       type: string
 *                       description: Size of the container
 *                     remark:
 *                       type: string
 *                       description: Notes for this container
 *     responses:
 *       201:
 *         description: Container receive request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 request_id:
 *                   type: string
 *       500:
 *         description: Error processing container receive request
 */
router.post("/add", requestContainerReceiveController.addContainerReceive);

/**
 * @swagger
 * /api/container-receives/get:
 *   get:
 *     summary: Get list of container receive requests
 *     tags: [Container Receives]
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
 *         description: A list of container receive requests
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
 *                   booking_no:
 *                     type: string
 *                     description: Booking number
 *                   request_date:
 *                     type: string
 *                     format: date-time
 *                     description: Request date
 *                   create_line_id:
 *                     type: string
 *                     description: LINE User ID of request creator
 *                   remark:
 *                     type: string
 *                     description: Additional remarks for the request
 *                   status:
 *                     type: string
 *                     enum: [Pending, Complete, Cancel]
 *                     description: Current status of the request
 *                   total_container:
 *                     type: integer
 *                     description: Total number of containers in the request
 *                   create_date:
 *                     type: string
 *                     format: date-time
 *                     description: Request creation timestamp
 *                   update_date:
 *                     type: string
 *                     format: date-time
 *                     description: Request last update timestamp
 *                   booking_documents:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: URLs of booking documents
 *                   containers:
 *                     type: array
 *                     description: List of containers in the request
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Container detail ID
 *                         container_size:
 *                           type: string
 *                           description: Container size
 *                         relate_EIR:
 *                           type: integer
 *                           description: Related EIR ID
 *                         receipt_no:
 *                           type: string
 *                           description: EIR receipt number
 *                         EIR_date:
 *                           type: string
 *                           format: date-time
 *                           description: EIR date
 *                         remark:
 *                           type: string
 *                           description: Container specific remarks
 *                   user:
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
 *                   groups:
 *                     type: array
 *                     description: List of LINE groups the user belongs to
 *                     items:
 *                       type: object
 *                       properties:
 *                         group_id:
 *                           type: string
 *                           description: LINE group ID
 *                         group_name:
 *                           type: string
 *                           description: LINE group name
 *       500:
 *         description: Error retrieving container receive requests
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
router.get("/get", requestContainerReceiveController.getContainerReceives);

/**
 * @swagger
 * /api/container-receives/update/{request_id}:
 *   put:
 *     summary: Update an existing container receive request
 *     tags: [Container Receives]
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the container receive request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_id:
 *                 type: integer
 *               booking_no:
 *                 type: string
 *               request_date:
 *                 type: string
 *                 format: date-time
 *               create_line_id:
 *                 type: string
 *               remark:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, Complete, Cancel]
 *               containers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     container_size:
 *                       type: string
 *                     relate_EIR:
 *                       type: integer
 *                       nullable: true
 *                     remark:
 *                       type: string
 *     responses:
 *       200:
 *         description: Container receive request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 request_id:
 *                   type: string
 *       500:
 *         description: Error updating container receive request
 */
router.put(
  "/update/:request_id",
  requestContainerReceiveController.updateContainerReceive
);

/**
 * @swagger
 * /api/container-receives/{request_id}/detail/{detail_id}/cancel:
 *   put:
 *     summary: Cancel a specific container in a receive request
 *     tags: [Container Receives]
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the container receive request
 *       - in: path
 *         name: detail_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the container detail to cancel
 *     responses:
 *       200:
 *         description: Container cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 detail_id:
 *                   type: string
 *                   description: ID of the cancelled container detail
 *                 request_id:
 *                   type: string
 *                   description: ID of the container receive request
 *                 new_status:
 *                   type: string
 *                   enum: [Complete, Cancel, InProgress]
 *                   description: Updated status of the main request
 *       500:
 *         description: Error cancelling container
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
router.put(
  "/:request_id/detail/:detail_id/cancel",
  requestContainerReceiveController.updateContainerReceiveDetail
);

module.exports = router;

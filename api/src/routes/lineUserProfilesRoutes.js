const express = require("express");
const router = express.Router();
const lineUserProfilesController = require("../controllers/lineUserProfilesController");

/**
 * @swagger
 * /api/line_user_profiles/add:
 *   post:
 *     summary: Add a new line user profile
 *     tags: [LineUserProfiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               line_user_id:
 *                 type: string
 *               display_name:
 *                 type: string
 *               picture_url:
 *                 type: string
 *               driverID:
 *                 type: string
 *               user_type:
 *                 type: string
 *                 enum: [Driver, Client]
 *               name:
 *                 type: string
 *               company_name:
 *                 type: string
 *               company_id:
 *                 type: integer
 *               group_id:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Line user profile created successfully
 *       500:
 *         description: Error adding new line user profile
 */
router.post("/add", lineUserProfilesController.addLineUserProfile);

/**
 * @swagger
 * /api/line_user_profiles/get:
 *   get:
 *     summary: Get list of line user profiles
 *     tags: [LineUserProfiles]
 *     parameters:
 *       - in: query
 *         name: user_profile_id
 *         schema:
 *           type: integer
 *         description: The ID of the user profile
 *       - in: query
 *         name: line_user_id
 *         schema:
 *           type: string
 *         description: The LINE user ID
 *       - in: query
 *         name: user_type
 *         schema:
 *           type: string
 *           enum: [Driver, Client]
 *         description: The type of the user
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter profiles by active status
 *     responses:
 *       200:
 *         description: A list of line user profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   line_user_id:
 *                     type: string
 *                   display_name:
 *                     type: string
 *                   picture_url:
 *                     type: string
 *                   driverID:
 *                     type: string
 *                   user_type:
 *                     type: string
 *                     enum: [Driver, Client]
 *                   name:
 *                     type: string
 *                   company_name:
 *                     type: string
 *                   company_id:
 *                     type: integer
 *                   group_id:
 *                     type: integer
 *                   is_active:
 *                     type: boolean
 *       500:
 *         description: Error retrieving line user profiles
 */
router.get("/get", lineUserProfilesController.getLineUserProfiles);

/**
 * @swagger
 * /api/line_user_profiles/update/{user_profile_id}:
 *   put:
 *     summary: Update an existing line user profile
 *     tags: [LineUserProfiles]
 *     parameters:
 *       - in: path
 *         name: user_profile_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *               picture_url:
 *                 type: string
 *               driverID:
 *                 type: string
 *               user_type:
 *                 type: string
 *                 enum: [Driver, Client]
 *               name:
 *                 type: string
 *               company_name:
 *                 type: string
 *               company_id:
 *                 type: integer
 *               group_id:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Line user profile updated successfully
 *       500:
 *         description: Error updating line user profile
 */
router.put("/update/:user_profile_id", lineUserProfilesController.updateLineUserProfile);

module.exports = router;

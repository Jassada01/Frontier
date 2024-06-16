const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateJWT = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - displayName
 *         - password
 *         - position
 *         - location_image_url
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *         displayName:
 *           type: string
 *           description: The display name of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         position:
 *           type: string
 *           description: The position of the user
 *         location_image_url:
 *           type: string
 *           description: The location image URL of the user
 *         sign_img_path:
 *           type: string
 *           description: The path of the user's signature image
 *       example:
 *         username: johndoe
 *         displayName: John
 *         password: secret123
 *         position: Manager
 *         location_image_url: https://example.com/image.jpg
 *         sign_img_path: /path/to/signature.png
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user was successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user_id:
 *                   type: integer
 *       500:
 *         description: Some server error
 */
router.post("/register", userController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: The user was successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Some server error
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /api/users/status:
 *   get:
 *     summary: Check if user is logged in
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User is logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 display_name:
 *                   type: string
 *                 position:
 *                   type: string
 *       401:
 *         description: User is not logged in
 */
router.get("/status", authenticateJWT, (req, res) => {
  // ใน middleware authenticateJWT ได้ส่ง response แล้ว
  // ไม่จำเป็นต้องส่ง response ซ้ำในที่นี้
});

/**
 * @swagger
 * /api/users/getAllUsers:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   display_name:
 *                     type: string
 *                   position:
 *                     type: string
 *                   password_expire:
 *                     type: string
 *                     format: date
 *                   location_image_url:
 *                     type: string
 *                   language:
 *                     type: string
 *                   sign_img_path:
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
 *                   active:
 *                     type: integer
 *                   create_user:
 *                     type: string
 *                   create_datetime:
 *                     type: string
 *                     format: date-time
 *                   update_user:
 *                     type: string
 *                   update_datetime:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Some server error
 */
router.get("/getAllUsers", userController.getAllUsers);

/**
 * @swagger
 * /api/users/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: The user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 display_name:
 *                   type: string
 *                 position:
 *                   type: string
 *                 password_expire:
 *                   type: string
 *                   format: date
 *                 location_image_url:
 *                   type: string
 *                 language:
 *                   type: string
 *                 sign_img_path:
 *                   type: string
 *                 attr1:
 *                   type: string
 *                 attr2:
 *                   type: string
 *                 attr3:
 *                   type: string
 *                 attr4:
 *                   type: string
 *                 attr5:
 *                   type: string
 *                 active:
 *                   type: integer
 *                 create_user:
 *                   type: string
 *                 create_datetime:
 *                   type: string
 *                   format: date-time
 *                 update_user:
 *                   type: string
 *                 update_datetime:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Some server error
 */
router.get("/user/:id", userController.getUserById); // เส้นทางสำหรับดึงข้อมูลผู้ใช้ตาม ID

/**
 * @swagger
 * /api/users/user/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *               position:
 *                 type: string
 *               location_image_url:
 *                 type: string
 *               language:
 *                 type: string
 *               active:
 *                 type: integer
 *               sign_img_path:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Some server error
 */
router.put("/user/:id", userController.updateUserById); // เส้นทางสำหรับอัพเดตข้อมูลผู้ใช้ตาม ID

/**
 * @swagger
 * /api/users/user/{id}/reset-password:
 *   post:
 *     summary: Reset a user's password
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The new password of the user
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Some server error
 */
router.post("/user/:id/reset-password", userController.updatePasswordById); // เส้นทางสำหรับรีเซ็ตรหัสผ่านของผู้ใช้ตาม ID

router.post('/logout', userController.logout); // เพิ่ม route สำหรับ logout


module.exports = router;

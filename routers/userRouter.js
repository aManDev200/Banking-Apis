import { Router } from 'express';
import { 
    updateUserRole, 
    toggleUserActivation, 
    registerUser, 
    loginUser, 
    updateUserProfile, 
    getUserProfile,
    deleteUser 
} from '../controllers/userController.js';
import { authMiddleware, authorizeUser,authorizeEmployee } from '../middleware/authMiddleware.js';

const router = Router();
/**
 * @swagger
 * /api/users/role:
 *   put:
 *     summary: Update user role
 *     description: Update the authenticated user's role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/role', authMiddleware, authorizeUser,updateUserRole);

/**
 * @swagger
 * /api/users/activation:
 *   put:
 *     summary: Toggle user activation
 *     description: Toggle the authenticated user's activation status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activation status changed successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/activation', authMiddleware,authorizeUser, toggleUserActivation);

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: Delete user
 *     description: Delete the authenticated user's account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/', authMiddleware,authorizeUser, deleteUser);

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user and receive a token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/login',loginUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', authMiddleware,authorizeUser, getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdate'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/profile', authMiddleware, authorizeUser, updateUserProfile);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         isActive:
 *           type: boolean
 *     UserRegistration:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     UserLogin:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     UserProfileUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export default router;

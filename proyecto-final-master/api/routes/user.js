'use strict';

const express = require('express');
const UserController = require('../controllers/user');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const followRoutes = require('./follow');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.get('/home', authMiddleware, UserController.home);
router.get('/pruebas', authMiddleware, UserController.pruebas);
router.post('/register', UserController.saveUser);
router.post('/login', UserController.loginUser);
router.put('/update/:id', authMiddleware, UserController.updateUser);
router.get('/profile/:id', authMiddleware, UserController.getUserProfile);
router.get('/users/:page', authMiddleware, UserController.getUsersByPage);
router.post('/upload-image/:id', authMiddleware, upload.single('image'), UserController.uploadImage);
router.get('/avatar/:id', authMiddleware, UserController.getUserAvatar);
router.get('/follow-users', authMiddleware, UserController.FollowUsersIds);
router.get('/get-counters/:id?', authMiddleware, UserController.getCounters);

// Rutas de seguimiento
router.use('/follow', followRoutes);

module.exports = router;

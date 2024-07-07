'use strict'

const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const MessageController = require('../controllers/message');
const path = require('path');

const router = express.Router();

router.get('/probando-md', authMiddleware, MessageController.probando);
router.post('/message', authMiddleware, MessageController.saveMessage);
router.get('/my-messages/:page?', authMiddleware, MessageController.getReceivedMessages); // Endpoint para listar mensajes recibidos, con paginación opcional
router.get('/messages/:page?', authMiddleware, MessageController.getEmitMessages); // Endpoint para listar mensajes recibidos, con paginación opcional
router.get('/unviewed-messages', authMiddleware, MessageController.getUnviewedMessages); // Endpoint para listar mensajes no leídos
router.get('/set-viewed-messages', authMiddleware, MessageController.setViewedMessages); 

module.exports = router;

'use strict';

const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const PublicationController = require('../controllers/publication');
const path = require('path');

const router = express.Router();


// Crear la instancia de multer con la configuración de almacenamiento
const upload = multer({ dest: 'uploads/' });

// Utiliza el middleware 'authMiddleware' en las rutas relevantes
router.post('/api/publication/image/:id', upload.single('image'), authMiddleware, PublicationController.uploadImage);
router.get('/probando-pub', authMiddleware, PublicationController.probando);
router.post('/publication', authMiddleware, PublicationController.savePublication);
router.get('/publications/:page?', authMiddleware, PublicationController.getPublications);
router.get('/publication/:id', authMiddleware, PublicationController.getPublication); // Ruta para obtener una publicación por su ID
router.delete('/publication/:id', PublicationController.deletePublication); // Ruta para eliminar una publicación por su ID
router.delete('/publication/:id', authMiddleware, PublicationController.deletePublication);
router.post('/publication/image/:id', authMiddleware, upload.single('image'), PublicationController.uploadImage);
router.get('/publication/image/:imageFile', PublicationController.getImageFile);

module.exports = router;

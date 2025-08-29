const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadPhoto, upload } = require('../controllers/profileController');
const authenticate = require('../middlewares/authMiddleware');


// Crear perfil del usuario autenticado
const { createProfile } = require('../controllers/profileController');
router.post('/', authenticate, createProfile);

// Obtener el perfil del usuario autenticado
router.get('/', authenticate, getProfile);

// Actualizar datos del perfil
router.put('/', authenticate, updateProfile);

// Subir foto de perfil
router.post('/photo', authenticate, upload.single('photo'), uploadPhoto);

module.exports = router;
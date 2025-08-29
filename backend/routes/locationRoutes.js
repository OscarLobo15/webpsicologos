const express = require('express');
const router = express.Router();
const { getComunas, getUniversidades } = require('../controllers/locationController');

router.get('/comunas', getComunas);
router.get('/universidades', getUniversidades);

module.exports = router;
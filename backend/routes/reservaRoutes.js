const express = require('express');
const router = express.Router();
const { reservarHorario } = require('../controllers/reservaController');

router.post('/', reservarHorario);

module.exports = router;
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const { getDashboardInfo } = require('../controllers/dashboardController');

router.get('/info/:psicologo_id', authenticate, getDashboardInfo);

module.exports = router;

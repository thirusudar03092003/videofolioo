const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// Dashboard home
router.get('/', protect, dashboardController.getDashboard);

// Portfolio routes
router.get('/edit-portfolio', protect, dashboardController.renderEditPortfolio);
router.put('/edit-portfolio', protect, dashboardController.updatePortfolio);
router.put('/toggle-publish', protect, dashboardController.togglePublish);

module.exports = router;

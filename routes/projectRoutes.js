const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// Add project
router.get('/add', protect, projectController.renderAddProject);
router.post('/add', protect, projectController.addProject);

// Edit project
router.get('/edit/:id', protect, projectController.renderEditProject);
router.put('/edit/:id', protect, projectController.updateProject);

// Delete project
router.delete('/delete/:id', protect, projectController.deleteProject);

// Reorder projects
router.put('/reorder', protect, projectController.reorderProjects);

module.exports = router;

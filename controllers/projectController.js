const Portfolio = require('../models/Portfolio');
const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');

// @desc    Render add project page
// @route   GET /projects/add
exports.renderAddProject = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      req.flash('error_msg', 'Portfolio not found');
      return res.redirect('/dashboard');
    }
    
    res.render('dashboard/add-project', {
      title: 'Add Project'
    });
  } catch (err) {
    console.error('Error in renderAddProject:', err);
    req.flash('error_msg', 'Server Error');
    return res.redirect('/dashboard');
  }
};

// @desc    Add new project
// @route   POST /projects/add
exports.addProject = async (req, res, next) => {
  try {
    const { title, description, category, tags } = req.body;
    
    if (!req.files || !req.files.video || !req.files.thumbnail) {
      req.flash('error_msg', 'Please upload both video and thumbnail');
      return res.redirect('/projects/add');
    }
    
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      req.flash('error_msg', 'Portfolio not found');
      return res.redirect('/dashboard');
    }
    
    // Handle video upload
    const video = req.files.video;
    const videoPath = `/uploads/videos/${Date.now()}_${video.name}`;
    
    // Ensure directory exists
    const videoDir = path.join(__dirname, '..', 'public', 'uploads', 'videos');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }
    
    await video.mv(path.join(__dirname, '..', 'public', videoPath));
    
    // Handle thumbnail upload
    const thumbnail = req.files.thumbnail;
    const thumbnailPath = `/uploads/thumbnails/${Date.now()}_${thumbnail.name}`;
    
    // Ensure directory exists
    const thumbnailDir = path.join(__dirname, '..', 'public', 'uploads', 'thumbnails');
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    
    await thumbnail.mv(path.join(__dirname, '..', 'public', thumbnailPath));
    
    // Convert tags string to array
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    // Get project count for ordering
    const projectCount = await Project.countDocuments({ portfolio: portfolio._id });
    
    // Create project
    await Project.create({
      portfolio: portfolio._id,
      title,
      description,
      videoUrl: videoPath,
      thumbnailUrl: thumbnailPath,
      category,
      tags: tagsArray,
      order: projectCount
    });
    
    req.flash('success_msg', 'Project added successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error in addProject:', err);
    req.flash('error_msg', 'Server Error: ' + (err.message || 'Unknown error'));
    return res.redirect('/projects/add');
  }
};

// @desc    Render edit project page
// @route   GET /projects/edit/:id
exports.renderEditProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      req.flash('error_msg', 'Project not found');
      return res.redirect('/dashboard');
    }
    
    const portfolio = await Portfolio.findById(project.portfolio);
    
    if (!portfolio) {
      req.flash('error_msg', 'Portfolio not found');
      return res.redirect('/dashboard');
    }
    
    // Check if user owns the portfolio
    if (portfolio.user.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/dashboard');
    }
    
    res.render('dashboard/edit-project', {
      title: 'Edit Project',
      project,
      tags: project.tags.join(', ')
    });
  } catch (err) {
    console.error('Error in renderEditProject:', err);
    req.flash('error_msg', 'Server Error');
    return res.redirect('/dashboard');
  }
};

// @desc    Update project
// @route   PUT /projects/edit/:id
exports.updateProject = async (req, res, next) => {
  try {
    const { title, description, category, tags } = req.body;
    
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      req.flash('error_msg', 'Project not found');
      return res.redirect('/dashboard');
    }
    
    const portfolio = await Portfolio.findById(project.portfolio);
    
    if (!portfolio) {
      req.flash('error_msg', 'Portfolio not found');
      return res.redirect('/dashboard');
    }
    
    // Check if user owns the portfolio
    if (portfolio.user.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/dashboard');
    }
    
    // Handle video upload if new video is provided
    if (req.files && req.files.video) {
      // Delete old video
      const oldVideoPath = path.join(__dirname, '..', 'public', project.videoUrl);
      if (fs.existsSync(oldVideoPath)) {
        fs.unlinkSync(oldVideoPath);
      }
      
      // Upload new video
      const video = req.files.video;
      const videoPath = `/uploads/videos/${Date.now()}_${video.name}`;
      
      // Ensure directory exists
      const videoDir = path.join(__dirname, '..', 'public', 'uploads', 'videos');
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
      }
      
      await video.mv(path.join(__dirname, '..', 'public', videoPath));
      project.videoUrl = videoPath;
    }
    
    // Handle thumbnail upload if new thumbnail is provided
    if (req.files && req.files.thumbnail) {
      // Delete old thumbnail
      const oldThumbnailPath = path.join(__dirname, '..', 'public', project.thumbnailUrl);
      if (fs.existsSync(oldThumbnailPath)) {
        fs.unlinkSync(oldThumbnailPath);
      }
      
      // Upload new thumbnail
      const thumbnail = req.files.thumbnail;
      const thumbnailPath = `/uploads/thumbnails/${Date.now()}_${thumbnail.name}`;
      
      // Ensure directory exists
      const thumbnailDir = path.join(__dirname, '..', 'public', 'uploads', 'thumbnails');
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }
      
      await thumbnail.mv(path.join(__dirname, '..', 'public', thumbnailPath));
      project.thumbnailUrl = thumbnailPath;
    }
    
    // Convert tags string to array
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    // Update project
    project.title = title;
    project.description = description;
    project.category = category;
    project.tags = tagsArray;
    
    await project.save();
    
    req.flash('success_msg', 'Project updated successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error in updateProject:', err);
    req.flash('error_msg', 'Server Error: ' + (err.message || 'Unknown error'));
    return res.redirect('/dashboard');
  }
};

// @desc    Delete project
// @route   DELETE /projects/delete/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      req.flash('error_msg', 'Project not found');
      return res.redirect('/dashboard');
    }
    
    const portfolio = await Portfolio.findById(project.portfolio);
    
    if (!portfolio) {
      req.flash('error_msg', 'Portfolio not found');
      return res.redirect('/dashboard');
    }
    
    // Check if user owns the portfolio
    if (portfolio.user.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/dashboard');
    }
    
    // Delete video and thumbnail files
    const videoPath = path.join(__dirname, '..', 'public', project.videoUrl);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    
    const thumbnailPath = path.join(__dirname, '..', 'public', project.thumbnailUrl);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
    
    // Delete project
    await Project.findByIdAndDelete(req.params.id);
    
    req.flash('success_msg', 'Project deleted successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error in deleteProject:', err);
    req.flash('error_msg', 'Server Error: ' + (err.message || 'Unknown error'));
    return res.redirect('/dashboard');
  }
};

// @desc    Reorder projects
// @route   PUT /projects/reorder
exports.reorderProjects = async (req, res, next) => {
  try {
    const { projects } = req.body;
    
    if (!projects || !Array.isArray(projects)) {
      return res.status(400).json({ success: false, error: 'Invalid data' });
    }
    
    // Verify user owns all projects
    for (const item of projects) {
      const project = await Project.findById(item.id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      
      const portfolio = await Portfolio.findById(project.portfolio);
      if (!portfolio) {
        return res.status(404).json({ success: false, error: 'Portfolio not found' });
      }
      
      if (portfolio.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Not authorized' });
      }
      
      // Update order
      project.order = item.order;
      await project.save();
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error in reorderProjects:', err);
    res.status(500).json({ success: false, error: 'Server Error: ' + (err.message || 'Unknown error') });
  }
};

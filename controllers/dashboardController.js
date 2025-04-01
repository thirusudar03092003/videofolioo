const Portfolio = require('../models/Portfolio');
const Project = require('../models/Project');

// @desc    Dashboard
// @route   GET /dashboard
exports.getDashboard = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    // If no portfolio exists, create one
    if (!portfolio) {
      const newPortfolio = await Portfolio.create({
        user: req.user.id,
        title: `${req.user.name}'s Portfolio`
      });
      
      return res.render('dashboard/index', {
        title: 'Dashboard',
        portfolio: newPortfolio,
        projects: []
      });
    }
    
    const projects = await Project.find({ portfolio: portfolio._id }).sort({ order: 1 });
    
    res.render('dashboard/index', {
      title: 'Dashboard',
      portfolio,
      projects
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// @desc    Edit portfolio
// @route   GET /dashboard/edit-portfolio
exports.renderEditPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      req.flash('error_msg', 'Portfolio not found');
      return res.redirect('/dashboard');
    }
    
    res.render('dashboard/edit-portfolio', {
      title: 'Edit Portfolio',
      portfolio
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/dashboard');
  }
};

// @desc    Update portfolio
// @route   PUT /dashboard/edit-portfolio
exports.updatePortfolio = async (req, res) => {
  try {
    const { title, template, colorScheme, about, skills, twitter, instagram, linkedin, youtube, email, phone } = req.body;
    
    // Convert skills string to array
    const skillsArray = skills.split(',').map(skill => skill.trim()).filter(Boolean);
    
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      req.flash('error_msg', 'Portfolio not found');
      return res.redirect('/dashboard');
    }
    
    portfolio.title = title;
    portfolio.template = template;
    portfolio.colorScheme = colorScheme;
    portfolio.about = about;
    portfolio.skills = skillsArray;
    portfolio.social = {
      twitter,
      instagram,
      linkedin,
      youtube
    };
    portfolio.contact = {
      email,
      phone
    };
    
    await portfolio.save();
    
    req.flash('success_msg', 'Portfolio updated successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/dashboard');
  }
};

// @desc    Toggle publish status
// @route   PUT /dashboard/toggle-publish
exports.togglePublish = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      req.flash('error_msg', 'Portfolio not found');
      return res.redirect('/dashboard');
    }
    
    portfolio.isPublished = !portfolio.isPublished;
    await portfolio.save();
    
    const status = portfolio.isPublished ? 'published' : 'unpublished';
    req.flash('success_msg', `Portfolio ${status} successfully`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/dashboard');
  }
};

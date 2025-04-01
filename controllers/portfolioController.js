const Portfolio = require('../models/Portfolio');
const Project = require('../models/Project');

// @desc    View public portfolio
// @route   GET /p/:id
exports.viewPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio || !portfolio.isPublished) {
      req.flash('error_msg', 'Portfolio not found or not published');
      return res.redirect('/');
    }
    
    const projects = await Project.find({ portfolio: portfolio._id }).sort({ order: 1 });
    
    // Determine which template to use
    let template = 'portfolio/modern-dark';
    if (portfolio.template === 'minimalist') {
      template = 'portfolio/minimalist';
    } else if (portfolio.template === 'creative') {
      template = 'portfolio/creative';
    }
    
    res.render(template, {
      title: portfolio.title,
      portfolio,
      projects
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

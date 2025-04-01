const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    req.flash('error_msg', 'Please log in to access this resource');
    return res.redirect('/auth/login');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/auth/login');
    }
    
    next();
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Not authorized to access this resource');
    return res.redirect('/auth/login');
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      req.flash('error_msg', 'Not authorized to access this resource');
      return res.redirect('/dashboard');
    }
    next();
  };
};

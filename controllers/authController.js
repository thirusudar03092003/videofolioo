const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Render register page
// @route   GET /auth/register
exports.renderRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register'
  });
};

// @desc    Register user
// @route   POST /auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;
    
    // Validation
    let errors = [];
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
    }
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }
    
    if (errors.length > 0) {
      return res.render('auth/register', {
        errors,
        name,
        email,
        success_msg: '',
        error_msg: '',
        error: ''
      });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('auth/register', {
        errors,
        name,
        email,
        success_msg: '',
        error_msg: '',
        error: ''
      });
    }
    
    // Create user
    user = await User.create({
      name,
      email,
      password
    });
    
    // Create token and send cookie
    const token = createToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/auth/register');
  }
};

// @desc    Render login page
// @route   GET /auth/login
exports.renderLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login'
  });
};

// @desc    Login user
// @route   POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      req.flash('error_msg', 'Please fill in all fields');
      return res.redirect('/auth/login');
    }
    
    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/auth/login');
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid credentials');
      return res.redirect('/auth/login');
    }
    
    // Create token and send cookie
    const token = createToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/auth/login');
  }
};

// @desc    Logout user
// @route   GET /auth/logout
exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  req.flash('success_msg', 'You are logged out');
  res.redirect('/auth/login');
};

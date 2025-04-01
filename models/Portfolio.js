const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  template: {
    type: String,
    enum: ['modern-dark', 'minimalist', 'creative'],
    default: 'modern-dark'
  },
  colorScheme: {
    type: String,
    default: 'dark'
  },
  about: {
    type: String,
    default: ''
  },
  skills: [String],
  social: {
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  },
  contact: {
    email: String,
    phone: String
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);

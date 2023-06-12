var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Any = mongoose.Schema.Types.Mixed;
// Define collection and schema for Items
var User = new Schema({
  firstName: {
    type: String,
    trim: true
  },
  adminUserId: {
    type: String
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  adminUsersLimit: {
    type: Number
  },
  accessList: Any,
  phoneNumber: {
    type: String
  },
  role: {
    type: String
  },
  status: {
    type: Number
  },
  forgotLink: String,
  forgotStatus: Any,
  updatedAt: Any,
  createdAt: Any,
}, {
  collection: 'users'
});

module.exports = mongoose.model('User', User);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Any = mongoose.Schema.Types.Mixed;
// Define collection and schema for Items
var logSchema = new Schema({
  logName: {
    type: String,
    trim: true
  },
  userId: {
    type: String,
    trim: true
  },
  logHeader: Any,
  logData: Any,
  description: Any,
  error: Any,
  warning: Any,
  pattern: Any,
  time: Any,
  noOfWarning: Any,
  noOfError: Any,
  total: Any,
  createdAt: Any,
  updatedAt: Any,
  level: Any,
  fileNamePrefix: Any,
  fileNamepattern: Any,
  logLocation: Any,
  uploadType: Any,
  status: {
    type: Number
  },
}, {
  collection: 'logs'
});

module.exports = mongoose.model('logs', logSchema);
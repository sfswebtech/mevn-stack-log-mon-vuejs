var express = require("express");
var logRoutes = express.Router();
// Require Item model in our routes module
var Logs = require("./../models/logs");

var async = require("async");
var request = require('request');

// Defined store route
logRoutes.route("/add").post((req, res) => {
  var data = req.body;
  var newLogs = new Logs();
  newLogs.logName = data.logName;
  newLogs.userId = data.currentUser._id;
  newLogs.logHeader = JSON.stringify(data.tableHeader);
  newLogs.logData = JSON.stringify(data.tableData);
  newLogs.description = data.selectedDescription;
  newLogs.error = data.selectedErrorOption;
  newLogs.warning = data.selectedWarningOption;
  newLogs.pattern = data.selectedPattern;
  newLogs.level = data.level;
  newLogs.time = data.selectedStartTime;
  newLogs.noOfError = data.noOfError;
  newLogs.noOfWarning = data.noOfWarning;
  newLogs.total = data.total;
  newLogs.fileNamePrefix = data.fileNamePrefix;
  newLogs.fileNamepattern = data.fileNamepattern;
  newLogs.logLocation = data.logLocation;
  newLogs.uploadType = data.uploadType;
  newLogs.status = 1;
  newLogs.createdAt = new Date();
  newLogs.updatedAt = new Date();
  if (data.logId && data.logName) {
    Logs.updateOne({
        _id: data.logId,
      }, {
        logName: data.logName,
        level: "permanent",
        fileNamepattern: data.fileNamepattern,
        fileNamePrefix: data.fileNamePrefix,
        logLocation: data.logLocation,
        uploadType: data.uploadType
      },
      function (err, data) {
        if (err) {
          console.log("err===", err);
          return res.json({
            status: 500,
            message: "There are in some error while update Logs!.",
            data: err,
          });
        } else {
          return res.json({
            status: 200,
            message: "newLogs updated succesfully.",
            data,
          });
        }
      }
    );
  } else {
    Logs.deleteMany({
      level: "temp",
      userId: data.currentUser._id
    }, (err, doc) => {
      newLogs.save().then((log) => {
          logId = log._id;
          userId = data.currentUser._id;
          return res.json({
            data: {
              userId,
              logId,
            },
            status: 200,
            message: "logs created successfully.",
          });
        })
        .catch(() => {
          return res.json({
            status: 500,
            message: "There are in some error while inserting logs!.",
            data: err,
          });
        });
    });
  }
});

logRoutes.route("/getLogById").post((req, res) => {
  let postData = req.body;
  // console.log("postData==========", postData)
  Logs.find({
    userId: postData.userId,
    _id: postData.logId,
  }, (err, doc) => {
    if (!err) {
      res.status(200).send(doc);
    } else if (err) {
      res.status(400).send(err);
    }
  });
});
logRoutes.route("/checktemp").post((req, res) => {

  let userData = req.body;
  let userId = userData.user._id;
  Logs.find({
    userId: userId,
    level: "temp"
  }, (err, doc) => {
    if (!err) {
      res.status(200).send(doc);
    } else if (err) {
      res.status(400).send(err);
    }
  });
});

logRoutes.route("/resetLog").post((req, res) => {
  let logData = req.body;
  Logs.deleteOne({
      _id: logData.logId,
      userId: logData.currentUser._id,
      level: "temp"
    },
    (err, deleteResp) => {
      if (err) {
        return res.json({
          status: 500,
          message: "Failed to Deleted temporary logs.",
          data: err,
        });
      } else {
        return res.json({
          status: 200,
          message: "Temporary log Deleted succesfully.",
          data: deleteResp,
        });
      }
    }
  );
});

logRoutes.route("/processRemoteFile").post((req, res) => {
  let logData = req.body;
  let logurl = logData.remoteLogUrl.split('/');
  let remoteData = {
    tableHeader: [],
    tableData: [],
    logName: logurl[logurl.length - 1]
  }
  async.waterfall([
    (cb) => {
      request.get(logData.remotePatternUrl, function (error, response, body) {
        // console.log("response.statusCode+++++++++++++++", response.statusCode)
        if (!error && response && response.statusCode == 200) {
          var csvData = body;
          const csvRecordsArray = csvData.split(/\r\n|\n/);
          const headers = csvRecordsArray[0].split(",");
          for (let j = 0; j < headers.length; j++) {
            let element = headers[j].replace(/\u0000/g, "")
            element = element.replace(/��/g, "")
            element = element.replace(/\r/g, "")
            remoteData.tableHeader.push(element);
          }
          cb(null, logData)
        } else {
          cb(null, logData)
        }
      });
    },
    (updateData, cb) => {
      if (remoteData.tableHeader.length) {
        request.get(logData.remoteLogUrl, function (error, response, body) {
          // console.log("response.statusCode+++++++++++++++", response.statusCode)
          if (!error && response && response.statusCode == 200) {
            var csvData = body;
            const csvRecordsArray = csvData.split(/\r\n|\n/);
            const headers = csvRecordsArray[0].split(",");
            for (let i = 0; i < csvRecordsArray.length; i++) {
              const data = csvRecordsArray[i].split(",");
              if (data.length === remoteData.tableHeader.length) {
                const csvRecord = {};
                for (let hi = 0; hi < remoteData.tableHeader.length; hi++) {
                  key = remoteData.tableHeader[hi].replace(/\u0000/g, "");
                  val = data[hi].replace(/\u0000/g, "");
                  val = val.replace(/\r/g, "");
                  csvRecord[key] = val;
                  // csvRecord[tableHeader[hi]] = data[hi];
                  // str.slice(-1);
                }
                if (i !== 0) {
                  remoteData.tableData.push(csvRecord);
                }
              }
            }
            // console.log("tableData==", tableData);
            cb(null, logData)
          } else {
            cb(null, logData)
          }
        });
      } else {
        cb(null, logData)
      }
    },

  ], () => {
    if (remoteData.tableHeader.length || remoteData.tableData.length) {
      return res.json({
        status: 200,
        message: "Remote file has been got successfully.",
        data: remoteData,
      });
    } else {
      return res.json({
        status: 500,
        message: "There are some error in getting remote file.",
      });
    }
  })
});

logRoutes.route("/getalllogs").post((req, res) => {
  let user = req.body.user;

  // console.log("user=============", user);
  Logs.find({
    userId: user._id,
    level: 'permanent'
  }, function (err, doc) {
    if (err) {
      return res.json({
        data: err,
        status: 500,
        message: "There are some error in get logs.",
      });
    } else {
      if (doc.length) {
        return res.json({
          data: doc,
          status: 200,
          message: "Fetched all logs successfully.",
        });
      } else {
        return res.json({
          data: doc,
          status: 500,
          message: "no logs available successfully.",
        });
      }
    }
  });
});

module.exports = logRoutes;
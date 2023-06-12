var express = require("express");
var app = express();
var usersRoutes = express.Router();
const fs = require("fs");
const readline = require("readline");
var MD5 = require("md5");
const GlobalService = require("../core/global.service.js");
require("dotenv").config();

// Require Item model in our routes module
var User = require("./../models/users");

// Defined store route
usersRoutes.route("/create").post(function (req, res) {
  var postData = req.body
  if (postData._id) {
    if (postData.password) {
      postData.password = MD5(postData.password);
    }
    User.updateOne({
      _id: postData._id
    }, postData, function (err, data) {
      if (err) {
        return res.json({
          status: 500,
          message: "There are in some error while update user!.",
          data: err
        });
      } else {
        return res.json({
          status: 200,
          message: "user updated succesfully.",
          data: item
        });
      }
    });
  } else {
    var item = new User(postData);
    item.updatedAt = new Date();
    item.createdAt = new Date();
    if (item.role === 'admin') {
      item.adminUsersLimit = process.env.ADMIN_USERS_LIMIT;
    } else {
      item.adminUsersLimit = 0;
      item.role = 'user';
    }
    if (item.password) {
      item.password = MD5(item.password);
    }
    item.save((err, data) => {
      if (err) {
        return res.json({
          status: 500,
          message: "There are in some error while save user!.",
          data: err
        });
      } else {
        if (item.role === 'admin') {
          req.session.currentUser = data;
        }
        return res.json({
          status: 200,
          message: "user saved succesfully.",
          data: data
        });
      }
    });
  }
});

usersRoutes.route("/doLogin").post(function (req, res) {
  var item = req.body;
  var where = {
    email: item.email,
    password: MD5(item.password),
  };
  User.findOne(where, function (err, items) {
    if (items) {
      req.session.currentUser = items;
      res.json({
        status: 200,
        message: "Logged in successfully.",
        data: items,
      });
    } else {
      res.json({
        status: 500,
        message: "There is some error while fetching the user!",
        data: err,
      });
    }
  });
});

usersRoutes.route("/emailAlreadyExits").post(function (req, res) {
  var postData = req.body;
  if (postData._id) {
    var whereObj = {
      _id: {
        $ne: postData._id
      },
      email: postData.email.toLowerCase(),
    };
  } else {
    var whereObj = {
      email: postData.email.toLowerCase(),
    };
  }
  User.find(whereObj, function (err, data) {
    if (err) {
      return res.json({
        status: 500,
        message: "Some error occrred while getting the email already exits email.",
        data: err,
      });
    } else {
      return res.json({
        status: 200,
        message: "This email is not getting successfully.",
        data: data,
      });
    }
  });
});
usersRoutes.route("/getUserInfo").post(function (req, res) {
  var data = req.body;
  if (data.link && data._id) {
    var whereObj = {
      forgotLink: data.link,
      forgotStatus: 1,
      _id: data._id,
    };
  } else {
    var whereObj = {
      _id: data._id,
    };
  }
  User.findOne(whereObj)
    .select("-password")
    .exec(function (err, data) {
      if (data) {
        return res.json({
          status: 200,
          message: "Get the user info successfully.",
          data: data,
        });
      } else {
        return res.json({
          status: 500,
          message: "Some error occrred while getting the user info.",
          data: err,
        });
      }
    });
});
usersRoutes.route("/saveUserInfo").post(function (req, res) {
  var data = req.body;
  if (data.password) {
    data.password = MD5(data.password);
  }
  User.updateOne({
      _id: data._id,
    },
    data,
    function (err, resp) {
      if (err) {
        req.session.destroy();
        return res.json({
          status: 500,
          message: "There are in some error while update .",
          data: err,
        });
      } else {
        delete data.password;
        return res.json({
          status: 200,
          message: "Password updated succesfully.",
          data: data,
        });
      }
    }
  );
});
usersRoutes.route("/forgotPassword").post(function (req, res) {
  var postData = req.body;
  postData.email = postData.email.toLowerCase();
  const email = postData.email;
  if (email) {
    var whereObj = {
      email: postData.email,
    };
    User.findOne(whereObj, function (err, user) {
      if (user) {
        const rString = exports.randomString(
          32,
          "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        );
        User.updateOne({
            _id: user._id,
          }, {
            forgotLink: rString,
            forgotStatus: 1,
          },
          function (err, forgotResp) {
            if (forgotResp) {
              const linkParam =
                process.env.WEBSITE_URL +
                "recoverPassword/" +
                user._id +
                "/" +
                rString;
              var prepareEmailConfig = {
                email: user.email,
                firstName: GlobalService.capitalize(user.firstName),
                markerData: {
                  name: GlobalService.capitalize(user.firstName),
                  websiteUrl: process.env.WEBSITE_URL,
                  recoverPasswordLink: linkParam,
                },
                templatePath: "public/assets/emailtemplates/forgot-password.html",
                subject: "Reset your password for log viewer your account",
                html: "",
                templateName: "forgot-password", // NEW
              };

              GlobalService.prepareEmailData(
                prepareEmailConfig,
                (err, resp) => {
                  return res.json({
                    status: 200,
                    // emailLink: linkParam,
                    message: "Please check your email, Reset password link has been sent to " +
                      user.email,
                    data: resp,
                  });
                }
              );
            } else {
              return res.json({
                status: 500,
                message: "No account found with this email address : " + email,
              });
            }
          }
        );
      } else {
        return res.json({
          status: 500,
          message: "No account found with this email address : " + email,
        });
      }
    });
  } else {
    return res.json({
      status: 500,
      message: "No account found with this email address : " + email,
    });
  }
});
usersRoutes.route("/authentication").get(function (req, res) {
  User.find({}, function (err, users) {
    if (err) {
      return res.json({
        data: err,
        status: 500,
        message: "There are some error in get logs.",
      });
    } else {
      if (req.session.currentUser && users.length) {
        return res.json({
          status: 200,
          message: "Api authentication Successfully.",
          currentUser: req.session.currentUser,
        });
      } else {
        return res.json({
          status: 500,
          message: "Authentication Failed",
          currentUser: null,
        });
      }
    }
  });

});
usersRoutes.route("/logout").get(function (req, res) {
  req.session.destroy();
  return res.json({
    status: 200,
    message: "User Logouted successfully.",
  });
});
usersRoutes.route("/checkOldPassword").post(function (req, res) {
  var postData = req.body;
  if (postData.oldPassword) {
    var wheObj = {
      _id: postData._id,
      password: MD5(postData.oldPassword),
    };
    User.find(wheObj)
      .then((Response) => {
        if (Response.length) {
          return res.json({
            status: 200,
            message: "password has been matched successfully..",
            data: Response,
          });
        } else {
          return res.json({
            status: 500,
            message: "Password has not been matched ..",
            data: err,
          });
        }
      })
      .catch((err) => {
        return res.json({
          status: 500,
          message: "There are some error with old password checking.",
          data: err,
        });
      });
  } else {
    return res.json({
      status: 500,
      message: "Old password is not aviable in param.",
    });
  }

});
usersRoutes.route("/checkAdminUser").get(function (req, res) {
  User.find({}, function (err, users) {
    if (err) {
      return res.json({
        data: err,
        status: 500,
        message: "There are some error in get logs.",
      });
    } else {
      if (users.length) {
        return res.json({
          data: users,
          envConfig: process.env,
          status: 200,
          message: "Fetched all logs successfully.",
        });
      } else {
        return res.json({
          data: users,
          envConfig: process.env,
          status: 500,
          message: "no logs available successfully.",
        });
      }
    }
  });
});
usersRoutes.route("/getAllUsers").post((req, res) => {
  let user = req.body.user;
  User.find({
    adminUserId: user._id,
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
usersRoutes.route("/deleteUser").post((req, res) => {
  let userData = req.body;
  User.deleteOne({
      _id: userData._id,
    },
    (err, deleteResp) => {
      if (err) {
        return res.json({
          status: 500,
          message: "Failed to Deleted user.",
          data: err,
        });
      } else {
        return res.json({
          status: 200,
          message: "User Deleted succesfully.",
          data: deleteResp,
        });
      }
    }
  );
});

exports.randomString = (length, chars) => {
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};
module.exports = usersRoutes;
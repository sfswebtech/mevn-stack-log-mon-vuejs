/**
 * Name: Global.services.
 * @description : Here is define some common and global function.
 */

const async = require('async');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');
var Logs = require("./../models/logs");
var request = require('request');
const moment = require('moment');
const nodemailer = require('nodemailer');
require('dotenv').config();


exports.autoAnalyzerCronJob = () => {
	console.log('set cron mid night-----------')
	var CronJob = require('cron').CronJob;
	var cronjob = new CronJob({
		// cronTime: '*/10 * * * * *', // every 5 second
		cronTime: '0 */25 * * * *',
		// cronTime: '0 0 0 * * *',
		// cronTime: '45 17 * * *',
		onTick: function () {
			console.log('started cron -------------25 minutes')
			exports.autoAnlyzerLogs(() => {
				console.log("cron job has been run successfully.");
			});
		},
		start: false,
	});
	cronjob.start();
	// console.log(cronjob.running);
};


exports.autoAnlyzerLogs = (callback) => {
	Logs.find({
		level: process.env.LEVEL_PERMANENT,
		uploadType: process.env.UPLOAD_TYPE_MANNUAL
	}, (logErr, logResp) => {
		if (logErr) {
			callback()
		} else {
			console.log('logResp=', logResp.length);
			if (logResp.length) {
				async.forEachSeries(logResp, (obj, forEachSeriesCb) => {
					// console.log("check pattern.fileNamepattern=========", obj.fileNamepattern);
					let url = '';
					let newLogName = '';
					let checkPattern = obj.fileNamepattern.split("-");
					// console.log("obj.fileNamePrefix====0000====", obj.fileNamePrefix);

					// Remove extension from prefix
					obj.fileNamePrefix = obj.fileNamePrefix.replace(/.csv/g, "")
					obj.fileNamePrefix = obj.fileNamePrefix.replace(/.txt/g, "")
					// console.log("obj.fileNamePrefix======1111==", obj.fileNamePrefix);
					if (obj.fileNamepattern) {
						if (checkPattern.length === 4) {
							// newLogName = obj.fileNamePrefix + '-' + moment().subtract(1, 'days').format('DD-MM-YYYY') + '.' + obj.logName.slice(-3)
							newLogName = obj.fileNamePrefix + '-' + moment().format('DD-MM-YYYY') + '.' + obj.logName.slice(-3)
						} else {
							newLogName = obj.fileNamePrefix + ' ' + moment().format('DD-MM-YYYY') + '.' + obj.logName.slice(-3)
						}
					} else {
						newLogName = obj.fileNamePrefix + '.' + obj.logName.slice(-3)
					}
					console.log("logName=", newLogName);
					if (obj.logLocation.slice(-1) === '/') {
						url = obj.logLocation + newLogName;
					} else {
						url = obj.logLocation + '/' + newLogName;
					}
					console.log("url==========", url)
					request.get(url, function (error, response, body) {
						// console.log("response.statusCode+++++++++++++++", response.statusCode)
						if (!error && response && response.statusCode == 200) {
							var csvData = body;
							var tableHeader = [];
							var tableData = [];
							const csvRecordsArray = csvData.split(/\r\n|\n/);
							async.waterfall([
								(cb) => {
									const headers = csvRecordsArray[0].split(",");
									for (let j = 0; j < headers.length; j++) {
										// let element = headers[j]
										let element = headers[j].replace(/\u0000/g, "")
										element = element.replace(/��/g, "")
										element = element.replace(/\r/g, "")
										// const element = removeAccents(headers[j])
										tableHeader.push(element);
									}
									// console.log("tableHeader=", tableHeader);
									cb(null, obj)
								},
								(updatedData, cb) => {
									for (let i = 0; i < csvRecordsArray.length; i++) {
										const data = csvRecordsArray[i].split(",");
										if (data.length === tableHeader.length) {
											const csvRecord = {};
											for (let hi = 0; hi < tableHeader.length; hi++) {
												key = tableHeader[hi].replace(/\u0000/g, "");
												val = data[hi].replace(/\u0000/g, "");
												val = val.replace(/\r/g, "");
												csvRecord[key] = val;
												// csvRecord[tableHeader[hi]] = data[hi];
												// str.slice(-1);
											}
											if (i !== 0) {
												tableData.push(csvRecord);
											}
										}
									}
									// console.log("tableData==", tableData);
									cb(null, obj)
								},
								(updatedData, cb) => {
									const foundError = tableData.filter((element) => {
										return element[obj.pattern.toLowerCase()] === obj.error;
									});
									const foundWarning = tableData.filter((element) => {
										return element[obj.pattern.toLowerCase()] === obj.warning;
									});
									obj.noOfError = foundError.length;
									obj.noOfWarning = foundWarning.length;
									obj.total = obj.noOfError + obj.noOfWarning;
									cb(null, obj)
								},
								(updatedData, cb) => {
									// console.log('obj==========', obj)
									if (tableHeader.length && tableData.length) {
										let newLog = JSON.parse(JSON.stringify(obj));
										delete newLog._id;
										let autoAnalyzerLogs = new Logs(newLog);
										autoAnalyzerLogs.logName = newLogName;
										autoAnalyzerLogs.createdAt = new Date();
										autoAnalyzerLogs.updatedAt = new Date();
										autoAnalyzerLogs.uploadType = process.env.UPLOAD_TYPE_AUTO_ANALYZER;
										autoAnalyzerLogs.logHeader = JSON.stringify(tableHeader);
										autoAnalyzerLogs.logData = JSON.stringify(tableData);
										// console.log("autoAnalyzerLogs=====", autoAnalyzerLogs);

										wherObj = {}
										if (obj.fileNamepattern) {
											wherObj = {
												userId: obj.userId,
												logName: newLogName,
											}
										} else {
											wherObj = {
												userId: obj.userId,
												logName: newLogName,
												noOfError: autoAnalyzerLogs.noOfError,
												noOfWarning: autoAnalyzerLogs.noOfWarning,
												total: autoAnalyzerLogs.total,
												uploadType: autoAnalyzerLogs.uploadType
											}
										}
										// console.log("wherObj=====", wherObj);
										Logs.find(wherObj, (AlreadyFileErr, AlreadyFile) => {
											// console.log("AlreadyFile.length=======", AlreadyFile.length);
											// console.log("autoAnalyzerLogs======", autoAnalyzerLogs.uploadType)
											if (AlreadyFile.length) {
												autoAnalyzerLogs = JSON.parse(JSON.stringify(autoAnalyzerLogs));
												delete autoAnalyzerLogs._id;
												delete autoAnalyzerLogs.uploadType;
												Logs.updateOne(wherObj,
													autoAnalyzerLogs,
													function (err, resp) {
														if (err) {
															cb(null, obj)
														} else {
															cb(null, obj)
														}
													}
												);
											} else {
												autoAnalyzerLogs.save((err, data) => {
													if (err) {
														cb(null, obj)
													} else {
														cb(null, obj)
													}
												});
											}
										});
									} else {
										cb(null, obj)
									}
								}
							], () => {
								forEachSeriesCb()
							})
						} else {
							forEachSeriesCb()
						}
					});
				}, () => {
					console.log("Auto analyzer finished.....")
					callback()
				})
			} else {
				callback()
			}
		}
	});
};



/**
 * Name : prepareEmailData(): 
 * Description : This method will prepare data for email.
 * @param {*} EmailConfig is mail info.
 */
exports.prepareEmailData = (EmailConfig, callBack) => {
	async.waterfall([
		(cb) => {
			/** Get email messages template by template path*/
			exports.getEmailMessages(EmailConfig.templatePath, (err, html) => {
				if (err) {
					cb(true, null);
				} else {
					cb(null, html);
				}
			})
		},
		(messages, cb) => {
			if (messages) {
				/**this function call for replace marker under email messages*/
				exports.replaceMarker(EmailConfig.markerData, messages, (err, html) => {
					if (err) {
						cb(true, null);
					} else {
						EmailConfig.html = html;
						cb(null, html);
					}
				})
			} else {
				cb(null, true);
			}
		},
		(messages, cb) => {
			if (messages) {
				/** finally call send email service for send email */
				exports.emailSend(EmailConfig, function () {
					cb(null, true)
				})
			} else {
				cb(null, true)
			}
		}
	], (error, finalResp) => {
		callBack();
	})
}

/**
 * Name : replaceMarker(): 
 * Description : This method will replace marker in email messages template.
 * @param {*} markerData is no of marker To be replicated.
 * @param {*} messages is mail message Where to replace marker.
 * @return it will return complete messages for email 
 */
exports.replaceMarker = (markerData, messages, callBack) => {
	var keys = Object.keys(markerData);
	async.forEach(keys, (key, cb) => {
		var marker = '##' + key.toUpperCase() + '##';
		messages = messages.replace(new RegExp(marker, 'g'), markerData[key]);
		cb();
	}, () => {
		callBack(null, messages);
	})
}

/**
 * Name : getEmailMessages(): 
 * Description : This method will get email message content behalf template path.
 * @param {*} templatePath is email messages content path.
 * @return it will return email messages content
 */
exports.getEmailMessages = (templatePath, callback) => {
	fs.readFile(templatePath, {
		encoding: 'utf-8'
	}, function (err, html) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, html);
		}
	});
}

/**
 * Name : emailSend(): 
 * Description : This method will send email.
 * @param {*} emailData is email config and user info who to send.
 * @return it will return nothing 
 */
exports.emailSend = async (emailData, mainCb) => {
	/* 	sgMail.setApiKey(process.env.SEND_GRID_API);
		const msg = {
			from: process.env.SEND_GRID_FROM_EMAIL,
			to: emailData.email,
			subject: emailData.subject,
			html: emailData.html
		};
		var sendEamilResponse = await sgMail.send(msg);
		console.log("Message sent: %s", JSON.stringify(sendEamilResponse));
		mainCb(); */

	let mailTransporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.GMAIL_API,
			pass: process.env.GMAIL_PASSWORD,
		}
	});

	let mailDetails = {
		from: 'noreply@gmail.com',
		to: emailData.email,
		subject: emailData.subject,
		html: emailData.html
	};

	mailTransporter.sendMail(mailDetails, function (err, data) {
		if (err) {
			console.log('Error Occurs', err);
			mainCb();
		} else {
			console.log('Email sent successfully');
			mainCb();
		}
	});
}

/**
 * Name : capitalize(): 
 * Description : This method will capitalize of first word.
 * @param {*} s is Word info.
 * @return it will return word with capitalize 
 */
exports.capitalize = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
}

exports.changeStringTotime = (string) => {
	const time = string.split('');
	return time[0] + '' + time[1] + ':' + time[2] + '' + time[3];
}
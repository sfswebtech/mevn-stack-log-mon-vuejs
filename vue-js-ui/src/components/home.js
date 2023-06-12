import jQuery from "jquery";
let $ = jQuery;
import Vue from "vue";
import Chart from "chart.js";
import * as XLSX from "xlsx";
import Loading from "vue-loading-overlay";
// Import stylesheet
// import "vue-loading-overlay/dist/vue-loading.css";
import Datepicker from "vuejs-datepicker";
import * as moment from "moment-timezone";
import VueHtml2pdf from "vue-html2pdf";
// import html2pdf from 'html2pdf.js'

export default {
  name: "upload-files",
  data() {
    return {
      validLogLocation: true,
      isLoading: false,
      fullPage: true,
      logsData: [],
      currentUser: JSON.parse(localStorage.getItem("logViewer_currentUser")),
      selectedFile: "",
      dataTable: null,
      bgcolors: [
        "hexagon-green",
        "hexagon-blue",
        "hexagon-yellow",
        "hexagon-red",
      ],
      doc: "",
      chartBlankData: [],
      userAllLogs: [],
      userTotalLogs: [],
      allCharts: {
        globalSummaryChart: "",
        globalErrorChart: "",
        globalWarningChart: "",
        globalTrendChart: "",
      },
      logConfig: {
        fileNamePrefix: "",
        fileNamepattern: "",
        logLocation: "",
        uploadType: "mannual",
        logName: "",
        logId: "",
        level: "temp",
        tableHeader: [],
        tableData: [],
        error: [],
        warning: [],
        errorWarningOption: [],
        warningOptions: [],
        selectedErrorOption: "",
        selectedWarningOption: "",
        selectedPattern: "",
        selectedDescription: "",
        selectedStartTime: "",
        errorUniqueDescription: [],
        warningUniqueDescription: [],
        prepareErrorWithCount: [],
        prepareWarningWithCount: [],
        noOfError: 0,
        noOfWarning: 0,
        validateStartTime: false,
        total: 0,
        descriptionTrend: "",
        uniqueDate: "",
        graphType: "",
      },
      resetLogConfig: {
        fileNamePrefix: "",
        fileNamepattern: "",
        logLocation: "",
        uploadType: "mannual",
        logName: "",
        logId: "",
        level: "temp",
        tableHeader: [],
        tableData: [],
        error: [],
        warning: [],
        errorWarningOption: [],
        selectedErrorOption: "",
        selectedWarningOption: "",
        selectedPattern: "",
        selectedDescription: "",
        selectedStartTime: "",
        errorUniqueDescription: [],
        warningUniqueDescription: [],
        prepareErrorWithCount: [],
        prepareWarningWithCount: [],
        noOfError: 0,
        noOfWarning: 0,
        validateStartTime: false,
        total: 0,
        currentUser: JSON.parse(localStorage.getItem("logViewer_currentUser")),
        uniqueDate: "",
        graphType: "",
      },
      logFilterConfig: {
        from: new Date(),
        to: new Date()
      },
      trendInfo: {
        trendType: "",
        trendDetails: "",
      },
      remoteFileConfig: {
        remoteLogUrl: '',
        remotePatternUrl: '',
        remoteLogUrlValidate: false,
        remotePatternUrlValidate: false,
      },
      remoteResetFileConfig: {
        remoteLogUrl: '',
        remotePatternUrl: '',
        remoteLogUrlValidate: false,
        remotePatternUrlValidate: false,
      },
    };
  },
  mounted() {
    // $("#topHeader").show();
    this.checkTempLog();
    this.summaryChart(this.chartBlankData, this.chartBlankData); //method1 will execute at pageload
    this.errorChart(this.chartBlankData, "addLog"); //method1 will execute at pageload
    this.warningChart(this.chartBlankData, "addLog"); //method1 will execute at pageload
  },
  components: {
    Loading,
    Datepicker,
    VueHtml2pdf,
  },
  methods: {
    checkLogLocation(type) {
      // var schema = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,10}$/;
      var schema = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
      if (type) {
        let inputtxt = this.remoteFileConfig[type];
        let checkedFile = inputtxt.split('.');
        checkedFile = checkedFile[checkedFile.length - 1]
        if ((inputtxt.match(schema)) && (checkedFile === 'txt')) {
          this.remoteFileConfig[type + 'Validate'] = true;
        } else {
          this.remoteFileConfig[type + 'Validate'] = false;
        }
      } else {
        let inputtxt = this.logConfig.logLocation;
        let checkedFile = inputtxt.split('/');
        checkedFile = checkedFile[checkedFile.length - 1];
        if (checkedFile.includes("txt")) {
          this.validLogLocation = false;
          Vue.$toast.open({
            message: "You can add txt file with remote url.",
            type: "error",
          });
        } else {
          if (inputtxt.match(schema)) {
            this.validLogLocation = true;
          } else {
            this.validLogLocation = false;
          }
        }
      }
    },
    async logReport() {
      this.$router.push("log-report/" + this.logConfig.logId);
    },
    showTrend(type, obj) {
      $("#trendModal").modal({
        show: true,
      });
      this.trendInfo.trendDetails = obj;
      this.trendInfo.trendType =
        type === this.logConfig.selectedErrorOption ?
        "errorDescription" :
        "warningDescription";
      this.logConfig.descriptionTrend = obj[this.trendInfo.trendType];
      let z = this.logConfig.tableData.filter(
        (x) =>
        x[this.logConfig.selectedPattern] == type &&
        x[this.logConfig.selectedDescription] == obj[this.trendInfo.trendType]
      );
      console.log("================", z)
      this.calculateGraphData(z, "trendDescriptionChart");
    },
    onChange(event) {
      if (event.target.name === "selectedErrorOption") {
        this.logConfig.selectedWarningOption = "";
        let newFilterArray = this.logConfig.errorWarningOption.filter(
          (x) => x !== event.target.value
        );
        if (newFilterArray) {
          this.logConfig.warningOptions = newFilterArray;
        }
      }
      if (event.target.name === 'selectedStartTime') {
        let found = this.logConfig.tableData.filter((element) => {
          return element[this.logConfig.selectedStartTime];
        })

        if (found.length) {
          found = found[0];
          let datetimeCheckValue = ''
          // console.log("=========", moment(found[this.logConfig.selectedStartTime]).format('DD/MM/YYYY HH:mm:ss'))
          if (found[this.logConfig.selectedStartTime].split(" ").length === 2 || moment(found[this.logConfig.selectedStartTime]).format('DD/MM/YYYY HH:mm:ss') === 'Invalid date') {
            datetimeCheckValue = found[this.logConfig.selectedStartTime].split(" ");
            // console.log("00000000000000")
          } else {
            // console.log("111111111111")
            datetimeCheckValue = moment(found[this.logConfig.selectedStartTime]).format('DD/MM/YYYY HH:mm:ss').split(" ");
            const logAlldata = JSON.parse(JSON.stringify(this.logConfig.tableData));
            const changedDate = logAlldata.filter((element) => {
              return element[this.logConfig.selectedStartTime] = moment(element[this.logConfig.selectedStartTime]).format('DD/MM/YYYY HH:mm:ss');
            })
            this.logConfig.tableData = changedDate;
          }
          // console.log("datetimeCheckValue=========", datetimeCheckValue);
          if (datetimeCheckValue.length === 2) {
            this.logConfig.validateStartTime = true
          } else {
            this.logConfig.validateStartTime = false
            Vue.$toast.open({
              message: "Here just you can select only Date time index from log pattern.",
              type: "error",
            });
            this.logConfig.selectedStartTime = '';
          }
        } else {
          Vue.$toast.open({
            message: "Here just you can select only Date time index from log pattern.",
            type: "error",
          });
          this.logConfig.validateStartTime = false
          this.logConfig.selectedStartTime = '';
        }
      }
    },
    async filterLogs(type, logId) {

      if (type && type === "from") {
        let disabledDate = this.logFilterConfig.from;
        this.logFilterConfig.from = disabledDate;
        this.logFilterConfig.to = "";
      } else {
        if (!type) {
          let todayDate = new Date();
          let date = todayDate.getDate();
          let month = todayDate.getMonth();
          let year = todayDate.getFullYear();
          this.logFilterConfig.from = new Date(year, month, date)
        }
      }
      let found = [];
      if (this.logFilterConfig.from && !this.logFilterConfig.to) {
        found = await this.userTotalLogs.filter((log) => {
          return (
            moment(log.createdAt).format("YYYY-MM-DD") >=
            moment(this.logFilterConfig.from).format("YYYY-MM-DD")
          );
        });
      } else if (!this.logFilterConfig.from && this.logFilterConfig.to) {
        found = await this.userTotalLogs.filter((log) => {
          return (
            moment(log.createdAt).format("YYYY-MM-DD") <=
            moment(this.logFilterConfig.to).format("YYYY-MM-DD")
          );
        });
      } else if (this.logFilterConfig.from && this.logFilterConfig.to) {
        found = await this.userTotalLogs.filter((log) => {
          return (
            moment(log.createdAt).format("YYYY-MM-DD") >=
            moment(this.logFilterConfig.from).format("YYYY-MM-DD") &&
            moment(log.createdAt).format("YYYY-MM-DD") <=
            moment(this.logFilterConfig.to).format("YYYY-MM-DD")
          );
        });
      } else {
        found = JSON.parse(JSON.stringify(this.userTotalLogs));
      }
      if (!found.length) {
        $("#logviewer-Errors").removeClass("active show");
        $("#logviewer-Warnings").removeClass("active show");
      } else {
        $("#logviewer-Errors").addClass("active show");
      }
      this.userAllLogs = JSON.parse(JSON.stringify(found));
      if (found.length) {
        if (logId) {
          this.showDataOfLog(found[found.length - 1])
        } else {
          this.showDataOfLog(found[0])
        }
      }
    },
    async showDataOfLog(prop) {
      this.logConfig.level = prop.level;
      this.logConfig.noOfError = prop.noOfError;
      this.logConfig.noOfWarning = prop.noOfWarning;
      this.logConfig.logName = prop.logName.split('.')[0];
      this.logConfig.logId = prop._id;
      this.logConfig.selectedPattern = prop.pattern;
      this.logConfig.selectedErrorOption = prop.error;
      this.logConfig.selectedWarningOption = prop.warning;
      this.logConfig.selectedDescription = prop.description;
      this.logConfig.selectedStartTime = prop.time;
      this.logConfig.tableHeader = JSON.parse(prop.logHeader);
      this.logConfig.tableData = JSON.parse(prop.logData);
      await this.calculateWarningErrors();
      let logConfig = this.logConfig;
      let data = logConfig.tableData;

      const found = data.filter((element) => {
        return (
          element[this.logConfig.selectedPattern.toLowerCase()] ===
          this.logConfig.selectedErrorOption ||
          element[this.logConfig.selectedPattern.toLowerCase()] ===
          this.logConfig.selectedWarningOption
        );
      });
      this.calculateGraphData(found, "logViewer");
      this.scrapDescription(found);
    },

    getAllLogs(logId) {
      this.isLoading = true;
      this.logConfig = JSON.parse(JSON.stringify(this.resetLogConfig));
      this.logsData = []
      this.summaryChart([], []); //method1 will execute at pageload
      this.errorChart([], "logViewer"); //method1 will execute at pageload
      this.warningChart([], "logViewer");
      $("#logviewer-ErrorsTab").addClass("active");
      $("#logviewer-WarningsTab").removeClass("active");
      $("#logviewer-Errors").addClass("active show");
      $("#logviewer-Warnings").removeClass("active show");
      let user = {
        user: this.currentUser,
      };
      this.axios
        .post(Vue.config.baseUrl + "logs/getalllogs", user, {
          withCredentials: true,
        })
        .then((res) => {
          this.isLoading = false;
          if (res.data.status === 200) {
            this.userAllLogs = res.data.data;
            this.userTotalLogs = res.data.data;
            if (logId) {
              const found = res.data.data.filter((logElement) => {
                return logElement._id === logId;
              });
              if (found.length) {
                this.logFilterConfig.from = new Date();
                this.logFilterConfig.to = new Date();
                this.filterLogs('', logId)
              }
            } else {
              if (this.userTotalLogs.length) {
                // this.showDataOfLog(this.userTotalLogs[0])
                this.logFilterConfig.from = new Date();
                this.logFilterConfig.to = new Date();
                this.filterLogs('')
              }
            }
          }
        })
        .catch((err) => console.log(err));
    },
    resetData() {
      $("#checkForAddLog").css("visibility", "visible");
      $('#logcheckBox').prop('checked', false);
      this.logConfig = JSON.parse(JSON.stringify(this.resetLogConfig));
      this.remoteFileConfig = JSON.parse(JSON.stringify(this.remoteResetFileConfig));
      this.logsData = [];
      this.logConfig.tableData = [];
    },
    resetAutoAnalyzer() {
      $("#checkForAddLog").css("visibility", "visible");
      $('#logcheckBox').prop('checked', false);
    },

    checkTempLog() {

      this.isLoading = true;
      // simulate AJAX
      this.logConfig = JSON.parse(JSON.stringify(this.resetLogConfig));
      this.remoteFileConfig = JSON.parse(JSON.stringify(this.remoteResetFileConfig));
      this.logsData = [];
      this.summaryChart([], []); //method1 will execute at pageload
      this.errorChart([], "addLog"); //method1 will execute at pageload
      this.warningChart([], "addLog");
      $("#Summary").addClass("active show");
      $("#Errors").removeClass("active show");
      $("#Warnings").removeClass("active show");

      $("#logviewerTab").removeClass("active");
      $("#newlogTab").addClass("active");
      $("#logviewer").removeClass("active show");
      $("#newlog").addClass("active show");
      let user = {
        user: this.currentUser,
      };
      this.axios
        .post(Vue.config.baseUrl + "logs/checktemp", user, {
          withCredentials: true,
        })
        .then(async (res) => {
          if (res.status === 200 && res.data.length) {
            this.isLoading = false;
            res.data = res.data[0];
            this.logConfig.level = res.data.level;
            this.logConfig.noOfError = res.data.noOfError;
            this.logConfig.noOfWarning = res.data.noOfWarning;
            this.logConfig.logName = res.data.logName.split('.')[0];
            this.logConfig.logId = res.data._id;
            this.logConfig.selectedPattern = res.data.pattern;
            this.logConfig.selectedErrorOption = res.data.error;
            this.logConfig.selectedWarningOption = res.data.warning;
            this.logConfig.selectedDescription = res.data.description;
            this.logConfig.selectedStartTime = res.data.time;
            this.logConfig.tableHeader = JSON.parse(res.data.logHeader);
            this.logConfig.tableData = JSON.parse(res.data.logData);
            await this.calculateWarningErrors();
            let logConfig = this.logConfig;
            let data = logConfig.tableData;

            const found = data.filter((element) => {
              return (
                element[this.logConfig.selectedPattern.toLowerCase()] ===
                this.logConfig.selectedErrorOption ||
                element[this.logConfig.selectedPattern.toLowerCase()] ===
                this.logConfig.selectedWarningOption
              );
            });
            this.calculateGraphData(found, "addLog");
            this.scrapDescription(found);
          } else {
            this.isLoading = false;
          }
        })
        .catch((err) => {
          console.log(err);
          this.isLoading = false;
        });
    },

    selectFile(event, logType) {
      let oldlogConfig = JSON.parse(JSON.stringify(this.logConfig));
      this.logConfig = JSON.parse(JSON.stringify(this.resetLogConfig));
      this.remoteFileConfig = JSON.parse(JSON.stringify(this.remoteResetFileConfig));
      var files = event.target.files || event.dataTransfer.files;
      this.logConfig.level = 'temp';
      $("#checkForAddLog").css("visibility", "visible");
      $('#logcheckBox').prop('checked', false); // Checks it
      if (files[0].name.endsWith(".txt")) {
        // if (files[0].name.endsWith(".txt")) {
        // this.fileType = "csv";
        if (logType === 'logHeader') {
          // this.logConfig.tableData = oldlogConfig.tableData;
          if (this.logsData.length) {
            this.logConfig.logName = oldlogConfig.logName;
            this.readPatternFile(event);
          } else {
            Vue.$toast.open({
              message: "Please First of all select the log file.",
              type: "warning",
            });
            $("#fileupload")[0].value = "";
            $("#patterFileupload")[0].value = "";
          }
        } else {
          this.logConfig.logName = files[0].name;
          this.readCsvFile(event);
        }
      } else {
        Vue.$toast.open({
          message: "File Extension should be .txt",
          type: "warning",
        });
        $("#fileupload")[0].value = "";
        $("#patterFileupload")[0].value = "";
      }
    },

    readCsvFile(event) {
      const input = event.target;
      const reader = new FileReader();
      reader.readAsText(input.files[0]);
      reader.onload = () => {
        const csvData = reader.result;
        this.logsData = csvData.split(/\r\n|\n/);
        // const headersRow = this.getHeaderArray(csvRecordsArray);
        // this.logConfig.tableHeader = headersRow;
        /*  this.logConfig.tableData = this.getDataRecordsArrayFromCSVFile(
           csvRecordsArray,
           headersRow.length
         ); */
        // console.log(" this.logConfig.tableData", this.logConfig)
        $("#fileupload")[0].value = "";
        $("#patterFileupload")[0].value = "";
      };

      /*  $("#exampleModal").modal({
        show: true,
      });
       const self = this;
       if (self.dataTable) {
         self.dataTable.destroy();
        }
        setTimeout(function () {
          self.dataTable = $("#logsTable").DataTable({
            searching: false,
            ordering: false,
            lengthChange: false,
            lengthMenu: [
              [5]
            ],
          });
        }, 200); */
      reader.onerror = function () {
        alert("Unable to read " + input.files[0]);
      };
    },

    readPatternFile(event) {
      const input = event.target;
      const reader = new FileReader();
      reader.readAsText(input.files[0]);
      reader.onload = () => {
        const csvData = reader.result;
        const csvRecordsArray = csvData.split(/\r\n|\n/);
        const headersRow = this.getHeaderArray(csvRecordsArray);
        this.logConfig.tableHeader = headersRow;
        this.logConfig.tableData = this.getDataRecordsArrayFromCSVFile(
          this.logsData,
          headersRow.length
        );
        // console.log(" this.logConfig.tableHeader", this.logConfig)
        $("#fileupload")[0].value = "";
        $("#patterFileupload")[0].value = "";
      };
      reader.onerror = function () {
        alert("Unable to read " + input.files[0]);
      };
    },

    getHeaderArray(csvRecordsArr) {
      const headers = csvRecordsArr[0].split(",");
      const headerArray = [];
      for (let j = 0; j < headers.length; j++) {
        headerArray.push(headers[j]);
      }
      return headerArray;
    },
    getDataRecordsArrayFromCSVFile(csvRecordsArray, headerLength) {
      const dataArr = [];
      for (let i = 0; i < csvRecordsArray.length; i++) {
        const data = csvRecordsArray[i].split(",");
        if (data.length === headerLength) {
          const csvRecord = {};
          for (let hi = 0; hi < this.logConfig.tableHeader.length; hi++) {
            csvRecord[this.logConfig.tableHeader[hi]] = data[hi];
          }
          if (i !== 0) {
            dataArr.push(csvRecord);
          }
        }
      }
      return dataArr;
    },
    readXlsxFile($event) {
      const self = this;
      let workBook = null;
      let jsonData = null;
      const reader = new FileReader();
      const file = $event.target.files[0];
      reader.onload = () => {
        const data = reader.result;
        workBook = XLSX.read(data, {
          type: "binary",
        });
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          initial[name] = XLSX.utils.sheet_to_json(sheet);
          return initial;
        }, {});
        const keys = Object.keys(jsonData);
        for (let index = 0; index < keys.length; index++) {
          self.logConfig.tableData = self.logConfig.tableData.concat(
            jsonData[keys[index]]
          );
        }
        self.logConfig.tableHeader = Object.keys(self.logConfig.tableData[0]);
        $("#exampleModal").modal({
          show: true,
        });
        if (self.dataTable) {
          self.dataTable.destroy();
        }
        setTimeout(function () {
          self.dataTable = $("#logsTable").DataTable({
            searching: false,
            ordering: false,
            lengthChange: false,
            lengthMenu: [
              [5]
            ],
          });
        }, 200);
        $("#fileupload")[0].value = "";
        $("#patterFileupload")[0].value = "";
      };
      reader.readAsBinaryString(file);
    },
    async saveData(moniterType) {
      // console.log("moniterType=", moniterType);
      if (
        !this.logConfig.selectedPattern ||
        !this.logConfig.selectedErrorOption ||
        // !this.logConfig.selectedWarningOption ||
        !this.logConfig.selectedDescription ||
        !this.logConfig.selectedStartTime
      ) {
        Vue.$toast.open({
          message: "* Please fill all mandatory fields!.",
          type: "error",
        });
        return false;
      }
      this.isLoading = true;
      await this.calculateWarningErrors();
      let logConfig = this.logConfig;
      let data = logConfig.tableData;

      const found = data.filter((element) => {
        return (
          element[this.logConfig.selectedPattern.toLowerCase()] ===
          this.logConfig.selectedErrorOption ||
          element[this.logConfig.selectedPattern.toLowerCase()] ===
          this.logConfig.selectedWarningOption
        );
      });
      this.calculateGraphData(found, "addLog");
      this.scrapDescription(found);
      this.axios
        .post(Vue.config.baseUrl + "logs/add", logConfig, {
          withCredentials: true,
        })
        .then((response) => {
          if (response.data.status === 200) {
            if (moniterType) {
              $("#newlogTab").removeClass("active");
              $("#logviewerTab").addClass("active");
              $("#newlog").removeClass("active show");
              $("#logviewer").addClass("active show");
              this.getAllLogs(this.logConfig.logId);
              Vue.$toast.open({
                message: "Log has been added Successfully For Auto Analyzer.",
                type: "success",
              });
            } else {
              this.logConfig.logId = response.data.data.logId;
              Vue.$toast.open({
                message: "Log has been added Successfully.",
                type: "success",
              });
            }
            $("#exampleModal").modal("hide");
            this.isLoading = false;
          } else {
            this.isLoading = false;
          }
        })
        .catch(() =>
          Vue.$toast.open({
            message: "Something Failed, Please Try Again.",
            type: "error",
          })
        );
    },
    async calculateGraphData(prop, chartId) {
      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }
      let selectedTimeFrame = this.logConfig.selectedStartTime.toLowerCase();
      let timeFoundData = prop.map((x) => x[selectedTimeFrame]);
      let dates = prop.map((x) => x[selectedTimeFrame].split(" ")[0]);
      let graphType = "";
      let uniqueTimeSplited = [];

      var uniqueDates = dates.filter(onlyUnique).sort();
      if (uniqueDates.length == 1) {
        uniqueTimeSplited = timeFoundData
          .map((x) => x.split(" ")[1])
          .filter(onlyUnique);
        graphType = "hour";
      }
      if (uniqueDates.length > 1) {
        graphType = "date";
      }
      this.logConfig.uniqueDate = uniqueDates[0];
      this.logConfig.graphType = graphType;

      let selectedPattern = this.logConfig.selectedPattern.toLowerCase();

      let errorsWithDate = [];
      let warningWithDate = [];

      var graphXaxisLabel =
        graphType === "date" ?
        JSON.parse(JSON.stringify(uniqueDates)) :
        JSON.parse(JSON.stringify(uniqueTimeSplited));
      var index = graphType === "date" ? 0 : 1;

      if (graphXaxisLabel.length) {
        graphXaxisLabel.map((dateEle) => {
          let errorWarningArray = prop.filter(
            (x) =>
            (x[selectedPattern] == this.logConfig.selectedErrorOption &&
              dateEle === x[selectedTimeFrame].split(" ")[index]) ||
            (x[selectedPattern] == this.logConfig.selectedWarningOption &&
              dateEle === x[selectedTimeFrame].split(" ")[index])
          );
          if (errorWarningArray.length) {
            let errorArray = errorWarningArray.filter(
              (x) => x[selectedPattern] == this.logConfig.selectedErrorOption
            );
            let warningArray = errorWarningArray.filter(
              (x) => x[selectedPattern] == this.logConfig.selectedWarningOption
            );

            errorsWithDate.push({
              date: dateEle,
              number: errorArray.length,
            });
            warningWithDate.push({
              date: dateEle,
              number: warningArray.length,
            });
          } else {
            // console.log("sd");
          }
        });

        if (chartId == "trendDescriptionChart") {
          this.trendDescriptionChart(errorsWithDate, warningWithDate, chartId);
        } else {
          this.summaryChart(errorsWithDate, warningWithDate, chartId);
          this.errorChart(errorsWithDate, chartId);
          this.warningChart(warningWithDate, chartId);
        }
      }
    },
    async scrapDescription(prop) {
      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }
      let filterError = await prop.filter(
        (element) =>
        element[this.logConfig.selectedPattern.toLowerCase()] ===
        this.logConfig.selectedErrorOption
      );
      let filterWarning = await prop.filter(
        (element) =>
        element[this.logConfig.selectedPattern.toLowerCase()] ===
        this.logConfig.selectedWarningOption
      );

      let selectedDescription = this.logConfig.selectedDescription.toLowerCase();
      let errorDescriptionData = await filterError.map(
        (x) => x[selectedDescription]
      );
      let warningDescriptionData = await filterWarning.map(
        (x) => x[selectedDescription]
      );
      // console.log(errorDescriptionData, warningDescriptionData);
      this.logConfig.errorUniqueDescription = await errorDescriptionData.filter(
        onlyUnique
      );
      this.logConfig.warningUniqueDescription = await warningDescriptionData.filter(
        onlyUnique
      );
      //  console.log(this.logConfig.warningUniqueDescription,
      //  this.logConfig.errorUniqueDescription)

      let prepareErrorWithCount = [];
      if (
        this.logConfig.errorUniqueDescription &&
        this.logConfig.errorUniqueDescription.length
      ) {
        this.logConfig.errorUniqueDescription.map((errorUnique) => {
          const found = this.logConfig.tableData.filter((obj) => {
            return (
              obj[this.logConfig.selectedDescription] === errorUnique &&
              obj[this.logConfig.selectedPattern] ===
              this.logConfig.selectedErrorOption
            );
          });
          prepareErrorWithCount.push({
            errorDescription: errorUnique,
            quantity: found.length,
          });
        });
      }

      let prepareWarningWithCount = [];
      if (
        this.logConfig.warningUniqueDescription &&
        this.logConfig.warningUniqueDescription.length
      ) {
        this.logConfig.warningUniqueDescription.map((warningUnique) => {
          const found = this.logConfig.tableData.filter((obj) => {
            return (
              obj[this.logConfig.selectedDescription] === warningUnique &&
              obj[this.logConfig.selectedPattern] ===
              this.logConfig.selectedWarningOption
            );
          });
          prepareWarningWithCount.push({
            warningDescription: warningUnique,
            quantity: found.length,
          });
        });
      }

      this.logConfig.prepareErrorWithCount = prepareErrorWithCount;
      this.logConfig.prepareWarningWithCount = prepareWarningWithCount;
    },
    getLogName() {
      this.logConfig.fileNamePrefix = '';
      this.logConfig.fileNamepattern = '';
      this.logConfig.logLocation = '';
      this.validLogLocation = true;
      $("#confirmModal").modal({
        show: true,
      });

    },
    saveLogContent() {
      // this.isLoading = true;
      this.saveData('addMonitor');
      $("#confirmModal").modal("hide");
      $("#checkForAddLog").css("visibility", "hidden");
      /* this.axios
        .post(Vue.config.baseUrl + "logs/saveLogItems", this.logConfig, {
          withCredentials: true,
        })
        .then(() => {
          this.isLoading = false;
          $("#confirmModal").modal("hide");
          $("#checkForAddLog").css("visibility", "hidden");
        })
        .catch((err) => console.log(err)); */
    },
    calculateWarningErrors() {
      let selectedPattern = this.logConfig.selectedPattern.toLowerCase();
      // console.log(selectedPattern);
      let error = this.logConfig.tableData.filter(
        (x) => x[selectedPattern] == this.logConfig.selectedErrorOption
      );
      let warning = this.logConfig.tableData.filter(
        (x) => x[selectedPattern] == this.logConfig.selectedWarningOption
      );

      this.logConfig.noOfError = error.length;
      this.logConfig.noOfWarning = warning.length;
      this.logConfig.total = error.length + warning.length;
    },
    onPatternChange(event) {
      this.logConfig.selectedErrorOption = "";
      this.logConfig.selectedWarningOption = "";
      let z = this.logConfig.tableData.map(
        (x) => x[event.target.value]
      );

      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }
      var unique = z.filter(onlyUnique);
      this.logConfig.errorWarningOption = unique;
    },
    //charts for add log & log viewer
    trendDescriptionChart(err, war) {
      if (this.allCharts.globalTrendChart) {
        this.allCharts.globalTrendChart.destroy();
      }
      const ctx = document.getElementById("trendDescriptionChart");
      let errorLabel = err.map((x) => x.date);
      let errorData = err.map((x) => x.number);
      // let warningLabel = war.map(x=>x.date)
      let warningData = war.map((x) => x.number);
      let errorBorderColor = err.map(() => "#dc3545");
      let warningBorderColor = war.map(() => "#ffc107");
      let graphType = {};
      if (this.trendInfo.trendType !== "errorDescription") {
        graphType = {
          label: this.logConfig.graphType == "hour" ?
            "WARNING (" + this.logConfig.uniqueDate + ")" : "WARNING",
          data: warningData,
          backgroundColor: [
            "rgba(255,255,0, 0.2)",
            "rgba(255,255,0, 0.2)",
            "rgba(255,255,0, 0.2)",
            "rgba(255,255,0, 0.2)",
            "rgba(255,255,0, 0.2)",
            "rgba(255,255,0, 0.2)",
          ],
          borderColor: warningBorderColor,
          borderWidth: 1,
        };
      } else {
        graphType = {
          label: this.logConfig.graphType == "hour" ?
            "ERROR (" + this.logConfig.uniqueDate + ")" : "ERROR",
          data: errorData,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: errorBorderColor,
          borderWidth: 1,
        };
      }
      this.allCharts.globalTrendChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: errorLabel,
          datasets: [graphType],
        },
        options: {
          legend: {
            labels: {
              fontSize: 11,
            },
          },
          responsive: true,
          lineTension: 1,

          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                callback: function (value) {
                  if (Number.isInteger(value)) {
                    return value;
                  }
                },
                padding: 25,
              },
            }, ],
          },
        },
      });
    },
    summaryChart(err, war) {
      if (this.allCharts.globalSummaryChart) {
        this.allCharts.globalSummaryChart.destroy();
      }
      const ctx = document.getElementById("summaryChart");
      let errorLabel = err.map((x) => x.date);
      let errorData = err.map((x) => x.number);
      // let warningLabel = war.map(x=>x.date)
      let warningData = war.map((x) => x.number);
      let errorBorderColor = err.map(() => "#dc3545");
      let warningBorderColor = war.map(() => "#ffc107");
      this.allCharts.globalSummaryChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: errorLabel,
          datasets: [{
              label: this.logConfig.graphType == "hour" ?
                "ERROR (" + this.logConfig.uniqueDate + ")" : "ERROR",
              data: errorData,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
              ],
              borderColor: errorBorderColor,
              borderWidth: 1,
            },
            {
              label: this.logConfig.graphType == "hour" ?
                "WARNING (" + this.logConfig.uniqueDate + ")" : "WARNING",
              data: warningData,
              backgroundColor: [
                "rgba(255,255,0, 0.2)",
                "rgba(255,255,0, 0.2)",
                "rgba(255,255,0, 0.2)",
                "rgba(255,255,0, 0.2)",
                "rgba(255,255,0, 0.2)",
                "rgba(255,255,0, 0.2)",
              ],
              borderColor: warningBorderColor,
              borderWidth: 1,
            },
          ],
        },
        options: {
          legend: {
            labels: {
              fontSize: 16,
            },
          },
          responsive: true,
          lineTension: 1,

          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                callback: function (value) {
                  if (errorData.length && warningData.length && Number.isInteger(value)) {
                    return value;
                  } else if (!errorData.length && !warningData.length) {
                    return value;
                  }
                },
                padding: 25,
              },
            }, ],
          },
        },
      });
    },
    errorChart(err, chartId) {
      if (this.allCharts.globalErrorChart && chartId !== "logReport") {
        this.allCharts.globalErrorChart.destroy();
      }
      const ctx = document.getElementById(chartId + "errorChart");
      let errorLabel = err.map((x) => x.date);
      let errorData = err.map((x) => x.number);
      let errorBorderColor = err.map(() => "#dc3545");
      this.allCharts.globalErrorChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: errorLabel,
          datasets: [{
            // one line graph
            label: this.logConfig.graphType == "hour" ?
              "ERROR (" + this.logConfig.uniqueDate + ")" : "ERROR",
            data: errorData,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: errorBorderColor,
            borderWidth: 2,
          }, ],
        },
        options: {
          legend: {
            labels: {
              // fontColor: "blue",
              fontSize: 16,
            },
          },
          responsive: true,
          lineTension: 1,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                callback: function (value) {
                  if (errorData.length && Number.isInteger(value)) {
                    return value;
                  } else if (!errorData.length) {
                    return value;
                  }
                },
                padding: 25,
              },
            }, ],
          },
        },
      });
    },
    warningChart(war, chartId) {
      if (this.allCharts.globalWarningChart && chartId !== "logReport") {
        this.allCharts.globalWarningChart.destroy();
      }
      const ctx = document.getElementById(chartId + "warningChart");
      let warningLabel = war.map((x) => x.date);
      let warningData = war.map((x) => x.number);
      let warningBorderColor = war.map(() => "#ffc107");

      this.allCharts.globalWarningChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: warningLabel,
          datasets: [{
            // another line  text-color #856404 graph
            label: this.logConfig.graphType == "hour" ?
              "WARNING (" + this.logConfig.uniqueDate + ")" : "WARNING",
            data: warningData,
            backgroundColor: [
              "rgba(255,255,0, 0.2)",
              "rgba(255,255,0, 0.2)",
              "rgba(255,255,0, 0.2)",
              "rgba(255,255,0, 0.2)",
              "rgba(255,255,0, 0.2)",
              "rgba(255,255,0, 0.2)",
            ],
            borderColor: warningBorderColor,
            borderWidth: 2,
          }, ],
        },
        options: {
          legend: {
            labels: {
              // fontColor: "blue",
              fontSize: 16,
            },
          },
          responsive: true,
          lineTension: 1,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                callback: function (value) {
                  if (warningData.length && Number.isInteger(value)) {
                    return value;
                  } else if (!warningData.length) {
                    return value;
                  }
                },
                padding: 25,
              },
            }, ],
          },
        },
      });
    },
    logout() {
      this.axios
        .get(Vue.config.baseUrl + "users/logout", {
          withCredentials: true
        })
        .then((res) => {
          if (res.data.status == 200) {
            Vue.$toast.open({
              message: "You have successfully logged out.",
              type: "success",
            });
            localStorage.removeItem("logViewer_currentUser");
            // location.reload();
            window.location.href = "/#/signin";

          }
        })
        .catch((err) => {
          if (err) {
            Vue.$toast.open({
              message: "Logout Unsuccessfull!",
              type: "error",
            });
          }
        });
    },
    resetTempFile() {
      this.axios
        .post(Vue.config.baseUrl + "logs/resetLog", this.logConfig, {
          withCredentials: true
        })
        .then((res) => {
          if (res.data.status == 200) {
            Vue.$toast.open({
              message: "Temporary log has been reset.",
              type: "success",
            });
            this.checkTempLog();
          } else {
            Vue.$toast.open({
              message: res.data.message,
              type: "error",
            });
          }
        })
        .catch((err) => {
          if (err) {
            Vue.$toast.open({
              message: "There are some error in reset temporary log!",
              type: "error",
            });
          }
        });
    },
    localFileProcess() {
      this.isLoading = true;
      // console.log("this.logConfig.tableData)", this.logConfig.tableData.length)
      // console.log("this.logConfig.tableHeader", this.logConfig.tableHeader.length)
      $("#exampleModal").modal({
        show: true,
      });
      const self = this;
      setTimeout(() => {
        self.isLoading = false;
        $("#exampleModal").modal({
          show: true,
        });
        if (self.dataTable) {
          self.dataTable.destroy();
          // self.datatable.rows.add(this.logConfig.tableData);
        }
        setTimeout(function () {
          // console.log('coming-----')
          self.dataTable = $("#logsTable").DataTable({
            searching: false,
            lengthChange: false,
            // ordering: false,
            // lengthMenu: [
            //   [5]
            // ],
          });
        }, 1000);
      });
    },
    processWithRemote() {
      this.isLoading = true;
      this.logConfig = JSON.parse(JSON.stringify(this.resetLogConfig));
      this.axios
        .post(Vue.config.baseUrl + "logs/processRemoteFile", this.remoteFileConfig, {
          withCredentials: true
        })
        .then((res) => {
          const self = this;
          if (res.data.status == 200) {
            this.remoteFileConfig = JSON.parse(JSON.stringify(this.remoteResetFileConfig));
            if (!res.data.data.tableHeader.length) {
              this.isLoading = false;
              Vue.$toast.open({
                message: 'There are some error in pattern.',
                type: "error",
              });
            } else if (!res.data.data.tableData.length) {
              this.isLoading = false;
              Vue.$toast.open({
                message: 'There are some error in log with pattern. Please enter proper remote log and pattern',
                type: "error",
              });
            } else {
              Vue.$toast.open({
                message: "Remote file has been got successfully.",
                type: "success",
              });
              self.logConfig.tableHeader = res.data.data.tableHeader
              self.logConfig.tableData = res.data.data.tableData
              self.logConfig.logName = res.data.data.logName
              setTimeout(() => {
                self.isLoading = false;
                $("#exampleModal").modal({
                  show: true,
                });
                if (self.dataTable) {
                  self.dataTable.destroy();
                  // self.datatable.rows.add(this.logConfig.tableData);
                }
                setTimeout(function () {
                  // console.log('coming-----')
                  self.dataTable = $("#logsTable").DataTable({
                    searching: false,
                    lengthChange: false,
                    // ordering: false,
                    // lengthMenu: [
                    //   [5]
                    // ],
                  });
                }, 1000);
              });
            }
          } else {
            this.isLoading = false;
            Vue.$toast.open({
              message: res.data.message,
              type: "error",
            });
          }
        })
        .catch((err) => {
          this.isLoading = false;
          if (err) {
            Vue.$toast.open({
              message: "There are some error in log files!",
              type: "error",
            });
          }
        });
    },
    downloadItem(url, label) {
      url = Vue.config.baseUrl + url
      this.axios.get(url, {
          responseType: 'blob'
        })
        .then(response => {
          const blob = new Blob([response.data], {
            type: 'application/txt'
          })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = label
          link.click()
          URL.revokeObjectURL(link.href)
        }).catch(console.error)
    }
  },
};
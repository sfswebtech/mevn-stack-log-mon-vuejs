  import jQuery from "jquery";
  let $ = jQuery;
  import Vue from "vue";
  import Chart from "chart.js";
  import Loading from "vue-loading-overlay";
  import VueHtml2pdf from "vue-html2pdf";
  import html2pdf from 'html2pdf.js'


  export default {
    name: "upload-files",
    data() {
      return {
        isLoading: false,
        fullPage: true,
        currentUser: JSON.parse(localStorage.getItem("logViewer_currentUser")),
        allCharts: {
          globalErrorChart: "",
          globalWarningChart: "",
        },
        logConfig: {
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
          total: 0,
          descriptionTrend: "",
          uniqueDate: "",
          graphType: "",
        },
        trendInfo: {
          trendType: "",
          trendDetails: "",
        },
        generatePdf: false,
      };
    },
    mounted() {
      console.log(this.$route);
      this.logId = this.$route.params.logId;
      // $("#topHeader").hide();
      if (this.logId) {
        this.getLogDetail();
      }
    },
    components: {
      Loading,
      VueHtml2pdf,
    },
    methods: {
      getLogDetail() {
        this.isLoading = true;
        this.axios
          .post(Vue.config.baseUrl + "logs/getLogById", {
            logId: this.logId,
            userId: this.currentUser._id
          }, {
            withCredentials: true,
          })
          .then(async (res) => {
            if (res.status === 200 && res.data.length) {
              this.isLoading = false;
              res.data = res.data[0];
              this.logConfig.level = res.data.level;
              this.logConfig.noOfError = res.data.noOfError;
              this.logConfig.noOfWarning = res.data.noOfWarning;
              this.logConfig.logName = res.data.logName.split(".")[0];
              // this.logConfig.logName = res.data.logName;
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
              this.calculateGraphData(found, "logReport");
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
      async generateReport() {
        html2pdf(this.$refs.logReportpdf, {
          margin: 0.8,
          filename: 'log-viewer(' + this.logConfig.logName + ').pdf',
          image: {
            type: 'jpeg',
            quality: 1
          },
          html2canvas: {
            dpi: 192,
            scale: 2,
            letterRendering: true
          },
          jsPDF: {
            unit: 'in',
            format: 'a4',
            // orientation: 'landscape'
            orientation: 'landscape'
          }
        })
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
                number: errorArray.length
              });
              warningWithDate.push({
                date: dateEle,
                number: warningArray.length,
              });
            } else {
              console.log("sd");
            }
          });

          if (chartId == "trendDescriptionChart") {
            this.trendDescriptionChart(errorsWithDate, warningWithDate, chartId);
            // console.log(errorsWithDate,warningWithDate);
          } else {
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

      calculateWarningErrors() {
        let selectedPattern = this.logConfig.selectedPattern.toLowerCase();
        console.log(selectedPattern);
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
          (x) => x[event.target.value.toLowerCase()]
        );

        function onlyUnique(value, index, self) {
          return self.indexOf(value) === index;
        }
        var unique = z.filter(onlyUnique);
        this.logConfig.errorWarningOption = unique;
      },
      errorChart(err, chartId) {
        if (this.allCharts.globalErrorChart && chartId !== 'logReport') {
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
                fontSize: 16,
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            lineTension: 1,
            height: 300,
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
        if (this.allCharts.globalWarningChart && chartId !== 'logReport') {
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
            maintainAspectRatio: false,
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
        // console.log(z)
        this.calculateGraphData(z, "trendDescriptionChart");
      },
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
    },
  };
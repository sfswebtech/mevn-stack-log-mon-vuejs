<template>
  <div>
    <div
      id="topHeader"
      class="row bg-light m-0"
      v-if="currentUser && currentUser.firstName"
    >
      <div class="col-12 d-flex justify-content-between">
        <div class="logo">
          <h1>
            <a href="/#/home/" v-on:click="checkTempLog">
              <img src="../../public/assets/log-mon-logo.png" />
            </a>
          </h1>
        </div>
        <div class="d-flex align-items-center navigation-div">
          <div class="nav navbar navigation-div_1">
            <nav>
              <ul class="nav nav-pills nav-fill w-100">
                <li class="nav-item" v-on:click="checkTempLog">
                  <a
                    class="nav-link active"
                    data-toggle="pill"
                    id="newlogTab"
                    href="#newlog"
                    ><i class="fa fa-file mr-1 clr-white" aria-hidden="true"></i
                    >New log</a
                  >
                </li>
                <li class="nav-item m-l-10" v-on:click="getAllLogs('')">
                  <a
                    class="nav-link"
                    data-toggle="pill"
                    id="logviewerTab"
                    href="#logviewer"
                    ><i
                      class="fa fa-file-text mr-1 clr-white"
                      aria-hidden="true"
                    ></i
                    >Log Viewer</a
                  >
                </li>
              </ul>
            </nav>
          </div>
          <div class="label-div">
            <span class="fa fa-user"></span>
            <label
              class="text-capitalize p-2"
              data-toggle="dropdown"
              :title="currentUser.firstName"
            >
              {{
                currentUser.firstName.length > 8
                  ? currentUser.firstName.slice(0, 6) + " ..."
                  : currentUser.firstName
              }}
            </label>
            <label class="cursor-pointer text-capitalizep-2 pl-1">
              <i class="dropdown-toggle" data-toggle="dropdown"> </i>
              <ul class="dropdown-menu">
                <li class="pl-2 p-1 border-bottom-dash">
                  <a href="/#/monitoring-software"
                    ><i class="fa fa-tachometer p-2"></i> Dashboard</a
                  >
                </li>
                <li
                  class="pl-2 p-1 border-bottom-profile"
                  v-if="currentUser.role === 'admin'"
                >
                  <a href="/#/user-list"
                    ><i class="fa fa-list p-2"></i>User list</a
                  >
                </li>
                <li class="pl-2 p-1 border-bottom-profile">
                  <a href="/#/profile"
                    ><i class="fa fa-gear p-2"></i> Profile Setting</a
                  >
                </li>
                <li class="pl-2 p-1 border-bottom-log" v-on:click="logout()">
                  <a><i class="fa fa-sign-out p-2"></i> Logout</a>
                </li>
              </ul>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="logtabs">
      <div class="container">
        <!-- Tab panes -->
        <div class="row content-bgcolor">
          <loading
            color="#09b8aa"
            class="loading"
            :active.sync="isLoading"
            :can-cancel="true"
            :is-full-page="fullPage"
          ></loading>
          <div class="col-12">
            <div class="first tab-content">
              <!-- NEW LOG -->
              <div id="newlog" class="fade container tab-pane show active mb-5">
                <!-- newlog Screen A -->
                <section
                  class="newlog-screen-A pb-3"
                  style="min-height: 250px"
                  v-if="!logConfig.logId"
                >
                  <form class="home-page">
                    <div class="files-tab">
                      <ul class="nav nav-tabs" role="tablist">
                        <li class="nav-item">
                          <a
                            class="nav-link active"
                            data-toggle="tab"
                            href="#tabs-1"
                            role="tab"
                            >LOCAL FILE</a
                          >
                        </li>
                        <li class="nav-item">
                          <a
                            class="nav-link"
                            data-toggle="tab"
                            href="#tabs-2"
                            role="tab"
                            >REMOTE FILE</a
                          >
                        </li>
                      </ul>
                      <!-- Tab panes -->
                      <div class="tab-content">
                        <div
                          class="tab-pane first-row active"
                          id="tabs-1"
                          role="tabpanel"
                        >
                          <div class="row dashboard-gap">
                            <div class="col-md-12 mb-20">
                              <span class="label-input100"
                                >Choose Log File
                                <sup
                                  ><i
                                    aria-hidden="true"
                                    class="fa fa-star star-icon"
                                    v-bind:class="{
                                      'text-danger': !logConfig.logName,
                                      'text-primary': logConfig.logName,
                                    }"
                                  ></i></sup
                              ></span>
                                <div class="question-mark" data-toggle="modal" data-target="#informationModal">
                                    <i class="fa fa-question-circle" aria-hidden="true"></i>
                                </div>
                              <div class="file-drop-area">
                                <b class="file-btn">Choose Log</b>
                                <span class="file-msg"
                                  >File Extension should be .txt separated by
                                  comma
                                </span>
                                <span class="pl-5 text-primary">
                                  {{ this.logConfig.logName }}</span
                                >
                                <input
                                  class="file-input"
                                  type="file"
                                  ref="file"
                                  v-on:change="selectFile($event, 'logContent')"
                                  id="fileupload"
                                  aria-describedby="fileup"
                                />
                              </div>
                              <!-- <div class="form-text" id="fileup">dfdf</div> -->
                            </div>
                            <div class="col-md-12 mb-20">
                              <span class="label-input100"
                                >Choose Pattern File
                                <sup
                                  ><i
                                    aria-hidden="true"
                                    class="fa fa-star star-icon"
                                    v-bind:class="{
                                      'text-danger': !logConfig.tableHeader
                                        .length,
                                      'text-primary':
                                        logConfig.tableHeader.length,
                                    }"
                                  ></i></sup
                              ></span>
                              <div class="file-drop-area">
                                <b class="file-btn">Choose Pattern</b>
                                <span class="file-msg"
                                  >File Extension should be .txt separated by
                                  comma
                                </span>
                                <span class="file-msg pl-5 text-primary">
                                  {{
                                    this.logConfig.tableHeader.length
                                      ? "  Pattern was selected"
                                      : ""
                                  }}</span
                                >
                                <input
                                  class="file-input"
                                  type="file"
                                  ref="file"
                                  v-on:change="selectFile($event, 'logHeader')"
                                  id="patterFileupload"
                                  aria-describedby="fileup"
                                />
                              </div>
                              <!-- <div class="form-text" id="fileup">dfdf</div> -->
                            </div>
                            <div class="col-md-4 pt-2 margin-auto">
                              <button
                                type="button"
                                class="process-local btn bnt-primary p-2"
                                :disabled="
                                  !logConfig.tableData.length ||
                                  !logConfig.tableHeader.length
                                "
                                v-on:click="localFileProcess()"
                              >
                                Process With Local
                              </button>
                            </div>
                          </div>
                        </div>
                        <div
                          class="tab-pane first-row"
                          id="tabs-2"
                          role="tabpanel"
                        >
                          <div class="row dashboard-gap">
                            <div class="col-md-12">
                              <div
                                class="wrap-input100 validate-input m-2"
                                data-validate="Log Location is Required"
                              >
                                <span class="label-input100"
                                  >Remote Log File Url
                                  <sup>
                                    <i
                                      class="fa fa-star star-icon"
                                      v-bind:class="{
                                        'text-danger': !remoteFileConfig.remoteLogUrl,
                                        'text-primary':
                                          remoteFileConfig.remoteLogUrl,
                                      }"
                                      aria-hidden="true"
                                    ></i>
                                  </sup>
                                </span>
                                <div class="question-mark" data-toggle="modal" data-target="#informationModal">
                                    <i class="fa fa-question-circle" aria-hidden="true"></i>
                                </div>
                                <input
                                  class="remote-log form-control"
                                  type="text"
                                  name="logLocation"
                                  placeholder="Please enter remote log url"
                                  v-model="remoteFileConfig.remoteLogUrl"
                                  v-on:input="checkLogLocation('remoteLogUrl')"
                                />
                                <p
                                  class="alert alert-warning text-left"
                                  role="alert"
                                  v-if="
                                    remoteFileConfig.remoteLogUrl &&
                                    !remoteFileConfig.remoteLogUrlValidate
                                  "
                                >
                                  Please enter Valid Log Remote URL with file
                                  name.
                                </p>
                                <span class="focus-input100"></span>
                              </div>
                            </div>
                            <div class="col-md-12">
                              <div
                                class="wrap-input100 validate-input m-2"
                                data-validate="Log Location is Required"
                              >
                                <span class="label-input100"
                                  >Remote Pattern File url
                                  <sup>
                                    <i
                                      class="fa fa-star star-icon"
                                      v-bind:class="{
                                        'text-danger': !remoteFileConfig.remotePatternUrl,
                                        'text-primary':
                                          remoteFileConfig.remotePatternUrl,
                                      }"
                                      aria-hidden="true"
                                    ></i>
                                  </sup>
                                </span>
                                <input
                                  class="remote-pattern form-control"
                                  type="text"
                                  name="logLocation"
                                  placeholder="Please enter remote pattern url"
                                  v-model="remoteFileConfig.remotePatternUrl"
                                  v-on:input="
                                    checkLogLocation('remotePatternUrl')
                                  "
                                />
                                <p
                                  class="alert alert-warning text-left"
                                  role="alert"
                                  v-if="
                                    remoteFileConfig.remotePatternUrl &&
                                    !remoteFileConfig.remotePatternUrlValidate
                                  "
                                >
                                  Please enter Valid Pattern Remote URL with
                                  file name.
                                </p>
                                <span class="focus-input100"></span>
                              </div>
                            </div>
                            <div class="col-md-4 pt-2 margin-auto">
                              <button
                                type="button"
                                class="process-remote btn bnt-primary p-2 mt-3"
                                v-on:click="processWithRemote()"
                                :disabled="
                                  !remoteFileConfig.remoteLogUrl ||
                                  !remoteFileConfig.remoteLogUrl ||
                                  !remoteFileConfig.remoteLogUrlValidate ||
                                  !remoteFileConfig.remotePatternUrlValidate
                                "
                              >
                                Process With Remote
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </section>
                <div class="modal fade" id="informationModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
                  <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="myModalLabel">Information</h5>
                        <button
                          type="button"
                          class="close"
                          data-dismiss="modal"
                          aria-label="Close"
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div class="modal-body">
                          <div class="information-content">
                                <p>- Log and pattern should be .txt file extension</p>
                                <p>- Logs and pattern of the file should be aligned</p>
                                <p>- Select all the required fields for the log monitoring</p>
                                <p>- No text should be added with Date & Time</p>
                          </div>
                          <div class="log-section">
                              <b>For Local Files (Sample) : (Click here)</b>
                              <a href="/#/home"  @click.prevent="
                                    downloadItem('SampleLog1.txt', 'log.txt')
                                  ">log file</a> 
                              <a href="/#/home"
                                  @click.prevent="
                                    downloadItem(
                                      'SampleLog1Pattern.txt',
                                      'log-pattern.txt'
                                    )
                                  ">Log Pattern file</a> 
                          </div>
                          <div class="remote-section">
                              <b>For Remote Files (Sample) :</b>
                              <div class="remote-section-inner">
                                  <span>Log Url:</span>
                                  <p>http://www.example.com/log.txt</p>
                              </div>
                              <div class="remote-section-inner">
                                  <span>Log Pattern Url:</span>
                                  <p>http://www.example.com/log-pattern.txt</p>
                              </div>
                          </div>
                      </div>
                      <div class="button-section">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- newlog Screen A -->

                <!-- newlog Screen B -->
                <section
                  class="newlog-screen-B"
                  v-bind:class="
                    logConfig.logId
                      ? 'custom-display-show'
                      : 'custom-display-none'
                  "
                >
                  <div
                    class="row"
                    v-if="logConfig.logId && logConfig.level === 'temp'"
                  >
                    <div class="col-md-12 reset-button">
                      <label
                        v-on:click="resetTempFile()"
                        class="pull-right label-primary curson-pointer"
                        style="
                          float: left;
                          position: relative;
                          top: 10px;
                          color: #fff;
                          background-color: #999;
                          padding: 3px 9px 4px 9px;
                          border-color: #c6c8ca;
                          right: -10px;
                          cursor: pointer;
                          margin-top: 10px;
                          margin-left: 10px;
                          z-index: 9999;
                        "
                      >
                        <i class="fa fa-refresh" aria-hidden="true"></i
                      ></label>
                    </div>
                    <div class="col-12 d-flex justify-content-end">
                      <!-- Nav pills -->
                      <ul
                        class="header-tabs nav nav-pills nav-fill"
                        style="
                          padding-top: 20px;
                          padding-right: 30px;
                          padding-left: 20px;
                          padding-bottom: 20px;
                        "
                      >
                        <li class="nav-item">
                          <a
                            class="nav-link active xs-device-width"
                            data-toggle="pill"
                            href="#Summary"
                            ><i
                              class="fa fa-list-alt mr-1 clr-white"
                              aria-hidden="true"
                            ></i
                            >Summary</a
                          >
                        </li>
                        <li class="nav-item">
                          <a
                            class="nav-link xs-device-width"
                            data-toggle="pill"
                            href="#Errors"
                            ><i
                              class="fa fa-times-circle-o mr-1 clr-white"
                              aria-hidden="true"
                            ></i
                            >Errors</a
                          >
                        </li>
                        <li class="nav-item">
                          <a
                            class="nav-link xs-device-width"
                            data-toggle="pill"
                            href="#Warnings"
                            ><i
                              class="fa fa-exclamation-circle mr-1 clr-white"
                              aria-hidden="true"
                            ></i
                            >Warnings</a
                          >
                        </li>
                      </ul>
                      <!-- Nav pills -->
                    </div>
                  </div>
                  <!-- herere -->
                  <div class="row dash-tab-content">
                    <div class="col-12">
                      <div class="tab-content">
                        <!-- summary Tab -->
                        <div class="tab-pane fade show active" id="Summary">
                          <div class="row">
                            <div
                              class="col-xl-8 col-lg-8 col-md-12"
                              style="padding-left: 30px"
                            >
                              <canvas id="summaryChart"></canvas>
                            </div>
                            <div
                              class="col-xl-4 col-lg-4 col-md-12"
                              style="padding-right: 30px"
                            >
                              <div class="row mt-5 p-0">
                                <div
                                  class="col-lg-6 col-md-6 col-sm-6 text-center p-0"
                                  v-if="logConfig.noOfError"
                                >
                                  <p class="text-danger p-0">
                                    Total No. Errors
                                  </p>
                                  <h1 class="text-danger">
                                    {{ logConfig.noOfError }}
                                  </h1>
                                </div>
                                <div
                                  class="col-lg-6 col-md-6 col-sm-6 text-center p-0"
                                  v-if="logConfig.noOfWarning"
                                >
                                  <p class="text-warning p-0">
                                    Total No. Warnings
                                  </p>
                                  <h1 class="text-warning">
                                    {{ logConfig.noOfWarning }}
                                  </h1>
                                </div>
                              </div>
                              <div
                                class="row"
                                v-if="
                                  logConfig.logId && logConfig.level === 'temp'
                                "
                              >
                                <div
                                  class="col-md-12 d-flex pl-5 pt-3"
                                  id="checkForAddLog"
                                >
                                  <div class="checkbox">
                                    <label>
                                      <input
                                        id="logcheckBox"
                                        type="checkbox"
                                        v-on:click="getLogName"
                                        value=""
                                      />
                                      <span class="cr"
                                        ><i class="cr-icon fa fa-check"></i
                                      ></span>
                                    </label>
                                  </div>
                                  <div class="add-log">
                                    <p class="pl-3 pt-1">
                                      Add To Log Monitoring
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- errors Tab -->
                        <div class="tab-pane fade" id="Errors">
                          <div class="row">
                            <div class="col-xl-9 col-lg-9 col-md-12">
                              <canvas id="addLogerrorChart"></canvas>
                            </div>
                            <div class="col-xl-3 col-lg-3 col-md-12">
                              <div class="row mt-5">
                                <div
                                  class="col-lg-12 col-md-12 col-sm-12 text-center"
                                >
                                  <p class="text-danger">Total No. Errors</p>
                                  <h1
                                    class="text-danger"
                                    style="font-size: 78px; font-style: bold"
                                  >
                                    {{ logConfig.noOfError }}
                                  </h1>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-lg-12 pt-3">
                              <!-- <div class="border text-center p-2 pt-3"> -->
                              <ul class="list-group">
                                <li
                                  class="list-group-item bg-danger text-white"
                                  aria-current="true"
                                >
                                  Error Description
                                </li>
                                <li
                                  v-for="(
                                    item, id
                                  ) in logConfig.prepareErrorWithCount"
                                  :key="id"
                                  class="list-group-item description-list"
                                  v-on:click="
                                    showTrend(
                                      logConfig.selectedErrorOption,
                                      item
                                    )
                                  "
                                >
                                  {{ item.errorDescription }}
                                  <span
                                    class="btn btn-danger text-white float-right"
                                  >
                                    {{ item.quantity }}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <!-- warning tab -->
                        <div class="tab-pane fade" id="Warnings">
                          <div class="row">
                            <div class="col-xl-9 col-lg-9 col-md-12">
                              <canvas id="addLogwarningChart"></canvas>
                            </div>
                            <div class="col-xl-3 col-lg-3 col-md-12">
                              <div class="row mt-5">
                                <div
                                  class="col-lg-12 col-md-12 col-sm-12 text-center"
                                >
                                  <p class="text-warning">Total No. Warnings</p>
                                  <h1
                                    class="text-warning"
                                    style="font-size: 78px; font-style: bold"
                                  >
                                    {{ logConfig.noOfWarning }}
                                  </h1>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-lg-12 pt-3">
                              <div>
                                <ul
                                  id="warningUniqueDescription"
                                  class="list-group"
                                >
                                  <li
                                    class="list-group-item bg-warning text-white"
                                    aria-current="true"
                                  >
                                    Warning Description
                                  </li>
                                  <li
                                    v-for="(
                                      item, id
                                    ) in logConfig.prepareWarningWithCount"
                                    :key="id"
                                    class="list-group-item description-list"
                                    v-on:click="
                                      showTrend(
                                        logConfig.selectedWarningOption,
                                        item
                                      )
                                    "
                                  >
                                    {{ item.warningDescription }}
                                    <span
                                      class="btn btn-warning text-white float-right"
                                      >{{ item.quantity }}</span
                                    >
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <!-- newlog Screen B -->
              </div>

              <!-- LOG VIEWER -->
              <div
                id="logviewer"
                class="container tab-pane fade mb-5"
                style="min-height: 350px"
              >
                <loading
                  color="#09b8aa"
                  :active.sync="isLoading"
                  :can-cancel="true"
                  :is-full-page="fullPage"
                ></loading>
                <!-- logviewer Screen A -->
                <section class="logviewer-screen-A">
                  <form>
                    <div class="col-auto p-0">
                      <div class="form-group mb-0">
                        <h5 class="Select-date" for="selectdate">
                          Select Date Range :
                        </h5>
                      </div>
                    </div>
                    <div
                      class="form-row align-items-center p-2 container margin-auto log-row-1"
                    >
                      <div class="col-sm-5">
                        <div class="form-group">
                          <h6 for="selectdateFrom">From :</h6>
                          <datepicker
                            placeholder="Select From Date"
                            v-model="logFilterConfig.from"
                            @closed="filterLogs('from')"
                            :highlighted="{ dates: [new Date()] }"
                            format="dd-MM-yyyy"
                            name="from"
                          ></datepicker>
                        </div>
                      </div>

                      <div class="col-sm-5">
                        <div class="form-group">
                          <h6 for="selectdateTo">To :</h6>
                          <datepicker
                            placeholder="Select To Date"
                            v-model="logFilterConfig.to"
                            @closed="filterLogs('to')"
                            :disabledDates="{ to: logFilterConfig.from }"
                            format="dd-MM-yyyy"
                            :highlighted="{ dates: [new Date()] }"
                            name="to"
                          ></datepicker>
                        </div>
                      </div>
                      <div class="col-2">
                        <div
                          class="form-group pt-4"
                          v-if="logFilterConfig.from || logFilterConfig.to"
                        >
                          <button
                            type="button"
                            class="btn btn-warning p-2 clear-filter"
                            v-on:click="
                              logFilterConfig = { from: '', to: '' };
                              filterLogs('to');
                            "
                          >
                            Clear Filter
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="container p-0">
                      <div class="row d-block">
                        <ul class="all-log-viewers">
                          <li
                            v-bind:title="item.logName.split('.')[0]"
                            v-for="(item, id) in userAllLogs"
                            :key="id"
                            class="cursor-pointer"
                            v-bind:class="
                              logConfig.logId === item._id
                                ? 'single-log active-log'
                                : 'single-log'
                            "
                            v-on:click="showDataOfLog(item)"
                          >
                            <div class="log-inner">
                              <p>{{ item.logName.slice(0, 9) }}</p>
                            </div>
                            <div class="d-flex">
                              <div class="error d-flex">
                                <span>Errors</span>
                                <span>{{ item.noOfError }}</span>
                              </div>
                              <div class="warning d-flex">
                                <span>Warnings</span>
                                <span>{{ item.noOfWarning }}</span>
                              </div>
                            </div>
                          </li>
                        </ul>
                        <div
                          class="d-flex justify-content-end hexagon-grid-container"
                        ></div>
                      </div>
                      <p
                        class="text-center p-5 bg-light"
                        v-if="!userAllLogs.length"
                      >
                        <b> No data available in Logs </b>
                      </p>
                    </div>
                  </form>
                  <br />
                </section>
                <!-- logviewer Screen A -->

                <!-- logviewer Screen B -->
                <section class="logviewer-screen-B" style="min-height: 100px">
                  <div class="row" v-if="userAllLogs.length">
                    <div class="col-md-12">
                      <h5 for="selectdate pull-left" class="log-heading">
                        {{ logConfig.logName }}
                      </h5>
                    </div>
                    <!-- Nav pills -->
                    <!-- <button>here</button> -->
                    <div class="col-md-12 log-viewer-tab">
                      <ul class="nav nav-pills pull-right">
                        <li class="nav-item">
                          <a
                            class="nav-link active"
                            data-toggle="pill"
                            href="#logviewer-Errors"
                            id="logviewer-ErrorsTab"
                          >
                            <i
                              class="fa fa-times-circle-o mr-1 clr-white"
                              aria-hidden="true"
                            ></i>
                            Errors</a
                          >
                        </li>
                        <li class="nav-item">
                          <a
                            class="nav-link"
                            data-toggle="pill"
                            href="#logviewer-Warnings"
                            id="logviewer-WarningsTab"
                            ><i
                              class="fa fa-exclamation-circle mr-1 clr-white"
                              aria-hidden="true"
                            ></i>
                            Warnings</a
                          >
                        </li>
                      </ul>
                      <!-- Nav pills -->
                    </div>
                  </div>
                  <!-- log viewer tabs -->

                  <div class="row mt-4">
                    <div class="col-12">
                      <div class="tab-content">
                        <!-- error tab viewer -->
                        <div
                          class="tab-pane fade show active"
                          id="logviewer-Errors"
                        >
                          <div class="row">
                            <div class="col-xl-9 col-lg-9 col-md-12">
                              <canvas
                                id="logViewererrorChart"
                                v-bind:class="
                                  logConfig.logId
                                    ? 'custom-display-show'
                                    : 'custom-display-none'
                                "
                              ></canvas>
                            </div>
                            <div
                              class="col-xl-3 col-lg-3 col-md-12"
                              v-if="userAllLogs.length"
                            >
                              <div class="row mt-5">
                                <div
                                  class="col-lg-12 col-md-12 col-sm-12 text-center"
                                >
                                  <p class="text-danger">Total No. Errors</p>
                                  <h1
                                    class="text-danger"
                                    style="font-size: 78px; font-style: bold"
                                  >
                                    {{ logConfig.noOfError }}
                                  </h1>
                                  <ul class="list-unstyled">
                                    <li
                                      class="nav-item mr-2"
                                      v-on:click="logReport()"
                                      v-if="logConfig.logName"
                                    >
                                      <a
                                        class="nav-link btn-blue"
                                        data-toggle="pill"
                                        href="#logviewer-report"
                                      >
                                        <i
                                          class="fa fa-file clr-white mr-2"
                                          aria-hidden="true"
                                        ></i>
                                        Log Report
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="row" v-if="userAllLogs.length">
                            <div class="col-lg-12 pt-3">
                              <ul class="list-group">
                                <li
                                  class="list-group-item bg-danger text-white"
                                  aria-current="true"
                                >
                                  Error Description
                                </li>
                                <li
                                  v-for="(
                                    item, id
                                  ) in logConfig.prepareErrorWithCount"
                                  :key="id"
                                  class="list-group-item description-list"
                                  v-on:click="
                                    showTrend(
                                      logConfig.selectedErrorOption,
                                      item
                                    )
                                  "
                                >
                                  {{ item.errorDescription }}
                                  <span
                                    class="btn btn-danger text-white float-right"
                                  >
                                    {{ item.quantity }}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <!-- warning tab viewer -->
                        <div class="tab-pane fade" id="logviewer-Warnings">
                          <div class="row">
                            <div class="col-xl-9 col-lg-9 col-md-12">
                              <canvas
                                id="logViewerwarningChart"
                                v-bind:class="
                                  logConfig.logId
                                    ? 'custom-display-show'
                                    : 'custom-display-none'
                                "
                              ></canvas>
                            </div>
                            <div class="col-xl-3 col-lg-3 col-md-12">
                              <div class="row mt-5">
                                <div
                                  class="col-lg-12 col-md-12 col-sm-12 text-center"
                                >
                                  <p class="text-warning">Total No. Warnings</p>
                                  <h1
                                    class="text-warning"
                                    style="font-size: 78px; font-style: bold"
                                  >
                                    {{ logConfig.noOfWarning }}
                                  </h1>
                                  <ul class="list-unstyled">
                                    <li
                                      class="nav-item mr-2"
                                      v-on:click="logReport()"
                                      v-if="logConfig.logName"
                                    >
                                      <a
                                        class="nav-link btn-blue"
                                        data-toggle="pill"
                                        href="#logviewer-report"
                                      >
                                        <i
                                          class="fa fa-file clr-white mr-1"
                                          aria-hidden="true"
                                        ></i>
                                        Log Report
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-lg-12 pt-3">
                              <div>
                                <ul
                                  id="warningUniqueDescription"
                                  class="list-group"
                                >
                                  <li
                                    class="list-group-item bg-warning text-white"
                                    aria-current="true"
                                  >
                                    Warning Description
                                  </li>
                                  <li
                                    v-for="(
                                      item, id
                                    ) in logConfig.prepareWarningWithCount"
                                    :key="id"
                                    class="list-group-item description-list"
                                    v-on:click="
                                      showTrend(
                                        logConfig.selectedWarningOption,
                                        item
                                      )
                                    "
                                  >
                                    {{ item.warningDescription }}
                                    <span
                                      class="btn btn-warning text-white float-right"
                                      >{{ item.quantity }}</span
                                    >
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <!-- logviewer Screen B -->
              </div>

              <div
                class="modal fade"
                data-backdrop="static"
                id="exampleModal"
                tabindex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
              >
                <div
                  class="modal-dialog pl-3 pr-4"
                  style="width: 100vw; max-width: none; margin: 0 padding:'50px';font-size:12px"
                >
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">
                        Confirmation for Logs View
                      </h5>

                      <button
                        type="button"
                        class="close"
                        v-on:click="resetData()"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <loading
                        color="#09b8aa"
                        class="loading"
                        :active.sync="isLoading"
                        :can-cancel="true"
                        :is-full-page="fullPage"
                      ></loading>
                      <div class="row">
                        <!-- pattern input -->
                        <div class="col-md-2">
                          <label class="" for="pattern"
                            >Pattern
                            <i
                              class="fa fa-star star-icon"
                              v-bind:class="{
                                'text-danger': !logConfig.selectedPattern,
                                'text-primary': logConfig.selectedPattern,
                              }"
                              aria-hidden="true"
                            ></i>
                          </label>
                          <select
                            v-model="logConfig.selectedPattern"
                            class="form-control"
                            size="1"
                            style=""
                            default="Select"
                            @change="onPatternChange($event)"
                          >
                            <!-- <option v-for="(item,key) in tableHeader" :value="key">{{item}}</option>> -->
                            <option value="">Select Index</option>
                            <option
                              v-for="(item, id) in logConfig.tableHeader"
                              :key="id"
                            >
                              {{ item }}
                            </option>
                          </select>
                        </div>
                        <!-- Error input -->
                        <div
                          class="col-md-2 p-0"
                          v-if="logConfig.selectedPattern"
                        >
                          <label class="w-50" for="pattern"
                            >Select Error Event
                            <i
                              class="fa fa-star star-icon"
                              v-bind:class="{
                                'text-danger': !logConfig.selectedErrorOption,
                                'text-primary': logConfig.selectedErrorOption,
                              }"
                              aria-hidden="true"
                            ></i>
                          </label>

                          <select
                            v-model="logConfig.selectedErrorOption"
                            class="form-control"
                            size="1"
                            style=""
                            name="selectedErrorOption"
                            @change="onChange($event)"
                          >
                            <!-- <option v-for="(item,key) in tableHeader" :value="key">{{item}}</option>> -->
                            <option value="">Select Value</option>
                            <option
                              v-for="(item, id) in logConfig.errorWarningOption"
                              :key="id"
                            >
                              {{ item }}
                            </option>
                          </select>
                        </div>
                        <!-- warning input -->
                        <div class="col-md-2" v-if="logConfig.selectedPattern">
                          <label class="" for="pattern"
                            >Select Warning Event
                            <i
                              class="fa fa-star star-icon"
                              v-bind:class="{
                                'text-danger': !logConfig.selectedWarningOption,
                                'text-primary': logConfig.selectedWarningOption,
                              }"
                              aria-hidden="true"
                            ></i>
                          </label>

                          <select
                            v-model="logConfig.selectedWarningOption"
                            class="form-control"
                            size="1"
                            style=""
                            default="Select"
                            name="selectedWarningOption"
                            @change="onChange($event)"
                          >
                            <!-- <option v-for="(item,key) in tableHeader" :value="key">{{item}}</option>> -->
                            <option selected value="">Select Value</option>
                            <!-- v-for="item  in logConfig.errorWarningOption " -->
                            <option
                              v-for="(item, id) in logConfig.warningOptions"
                              :key="id"
                            >
                              {{ item }}
                            </option>
                          </select>
                        </div>
                        <!-- description input -->
                        <div class="col-md-3">
                          <label class="" for="pattern"
                            >Event Message
                            <i
                              class="fa fa-star star-icon"
                              v-bind:class="{
                                'text-danger': !logConfig.selectedDescription,
                                'text-primary': logConfig.selectedDescription,
                              }"
                              aria-hidden="true"
                            ></i>
                          </label>
                          <select
                            v-model="logConfig.selectedDescription"
                            class="form-control"
                            size="1"
                            style=""
                            name="selectedDescription"
                            @change="onChange($event)"
                          >
                            <option value="">Select Index</option>
                            <option
                              v-for="(item, id) in logConfig.tableHeader"
                              :key="id"
                            >
                              {{ item }}
                            </option>
                          </select>
                        </div>
                        <!-- start time input -->
                        <div class="col-md-3">
                          <label class="" for="pattern"
                            >Time Label
                            <i
                              class="fa fa-star star-icon"
                              v-bind:class="{
                                'text-danger': !logConfig.selectedStartTime,
                                'text-primary': logConfig.selectedStartTime,
                              }"
                              aria-hidden="true"
                            ></i>
                          </label>
                          <select
                            v-model="logConfig.selectedStartTime"
                            class="form-control"
                            size="1"
                            style=""
                            name="selectedStartTime"
                            @change="onChange($event)"
                          >
                            <option value="">Select Time Index</option>
                            <option
                              v-for="(item, id) in logConfig.tableHeader"
                              :key="id"
                            >
                              {{ item }}
                            </option>
                          </select>
                        </div>
                      </div>

                      <div class="table-responsive pt-3">
                        <table
                          id="logsTable"
                          class="table table-bordered table-hover table-striped text-no-wrap"
                        >
                          <thead>
                            <tr v-if="logConfig.tableData.length">
                              <th
                                v-for="(header, id) in logConfig.tableHeader"
                                :key="id"
                              >
                                {{ header }}
                              </th>
                            </tr>
                          </thead>
                          <tbody
                            v-if="
                              logConfig.tableData.length &&
                              logConfig.tableHeader.length
                            "
                          >
                            <tr
                              v-for="(tableRow, id) in logConfig.tableData"
                              :key="id"
                              style="white-space: nowrap"
                            >
                              <td
                                v-for="(header, id) in logConfig.tableHeader"
                                :key="id"
                              >
                                <span>{{ tableRow[header] }}</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div class="modal-footer">
                      <button
                        type="button"
                        class="log-close btn btn-secondary p-2"
                        data-dismiss="modal"
                        v-on:click="resetData"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        v-on:click="saveData('')"
                        class="log-continue btn btn-primary p-2 pl-3 pr-3"
                      >
                        Logs View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="modal fade"
                data-backdrop="static"
                id="confirmModal"
                tabindex="-1"
                aria-labelledby="confirmModalLabel"
                aria-hidden="true"
              >
                <div class="modal-dialog modal-dialog-centered modal-md">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Log Monitoring</h5>
                      <button
                        type="button"
                        class="close"
                        data-dismiss="modal"
                        v-on:click="
                          resetAutoAnalyzer();
                          getLogName();
                        "
                        aria-label="Close"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <p class="modal-para modal-title m-3">
                        Proceeding to schedule log monitoring For this log
                        <b class="pt-1">
                          "{{ logConfig.logName.split(".")[0] }}"</b
                        >
                        ?
                      </p>
                      <div class="m-2">
                        <div
                          class="first-modal wrap-input100 validate-input m-2"
                          data-validate="File Name Prefix is Required"
                        >
                          <span class="label-input100"
                            >Constant File Name Prefix
                            <sup>
                              <i
                                class="fa fa-star star-icon"
                                v-bind:class="{
                                  'text-danger': !logConfig.fileNamePrefix,
                                  'text-primary': logConfig.fileNamePrefix,
                                }"
                                aria-hidden="true"
                              ></i>
                            </sup>
                          </span>

                          <input
                            class="constant-modal form-control"
                            type="text"
                            name="fileNamePrefix"
                            placeholder="Enter Constant File Name Like sample"
                            v-model="logConfig.fileNamePrefix"
                          />
                        </div>
                        <div
                          class="second-modal wrap-input100 validate-input m-2"
                          data-validate="File Name Prefix is Required"
                        >
                          <span class="label-input100"
                            >Auto Analyzer File Name Pattern(optional)
                          </span>

                          <select
                            v-model="logConfig.fileNamepattern"
                            class="select-modal form-control"
                            size="1"
                            style=""
                            name="fileNamepattern"
                            @change="onChange($event)"
                          >
                            <option value="">Select Pattern</option>
                            <option value="FileName DD-MM-YYYY">
                              FileName DD-MM-YYYY(FileName 01-01-2000)
                            </option>
                            <option value="FileName-DD-MM-YYYY">
                              FileName-DD-MM-YYYY(FileName-01-01-2000)
                            </option>
                          </select>
                          <p
                            class="alert alert-warning text-left"
                            role="alert"
                            style="font-size: 10px"
                          >
                            If you will not select pattern then It will take as
                            like "Constant File Name Prefix" for Auto Analyzer.
                            no need to add extension with name prefix.
                          </p>
                        </div>

                        <div
                          class="third-modal wrap-input100 validate-input m-2"
                          data-validate="Log Location is Required"
                        >
                          <span class="label-input100"
                            >Log Location
                            <sup>
                              <i
                                class="fa fa-star star-icon"
                                v-bind:class="{
                                  'text-danger': !logConfig.logLocation,
                                  'text-primary': logConfig.logLocation,
                                }"
                                aria-hidden="true"
                              ></i>
                            </sup>
                          </span>
                          <input
                            class="log-modal form-control"
                            type="text"
                            name="logLocation"
                            placeholder="Log Location"
                            v-model="logConfig.logLocation"
                            v-on:input="checkLogLocation('')"
                          />
                          <p
                            class="alert alert-warning text-left"
                            role="alert"
                            v-if="logConfig.logLocation && !validLogLocation"
                          >
                            Log Location is Not Valid. Please enter Valid Remote
                            Location. It should not be Local system.
                          </p>
                          <span class="focus-input100"></span>
                        </div>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button
                        type="button"
                        class="modal-first-button btn btn-secondary p-2 pl-3 pr-3"
                        data-dismiss="modal"
                        v-on:click="
                          resetAutoAnalyzer();
                          getLogName();
                        "
                      >
                        Close
                      </button>
                      <button
                        :disabled="
                          !validLogLocation ||
                          !logConfig.fileNamePrefix ||
                          // !logConfig.fileNamepattern ||
                          !logConfig.logLocation
                        "
                        type="button"
                        v-on:click="saveLogContent"
                        class="modal-second-button btn btn-default p-2 pl-3 pr-3"
                      >
                        Add To Log Monitoring
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="modal fade"
                data-backdrop="static"
                id="trendModal"
                tabindex="-1"
                aria-labelledby="trendModalLabel"
                aria-hidden="true"
              >
                <div class="modal-dialog modal-dialog-centered modal-md">
                  <!-- style="width: 100vw; max-width: none; margin: 0 padding:'50px';font-size:12px" -->
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">
                        Trend Graph for Description
                      </h5>

                      <button
                        type="button"
                        class="close"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <h6>
                        {{
                          trendInfo.trendType === "errorDescription"
                            ? trendInfo.trendDetails.errorDescription
                            : trendInfo.trendDetails.warningDescription
                        }}
                        <span
                          class="badge text-white"
                          v-bind:class="{
                            'badge-danger':
                              trendInfo.trendType == 'errorDescription',
                            'badge-warning':
                              trendInfo.trendType !== 'errorDescription',
                          }"
                        >
                          {{ trendInfo.trendDetails.quantity }}</span
                        >
                      </h6>
                      <canvas id="trendDescriptionChart"></canvas>
                    </div>
                    <div class="modal-footer">
                      <button
                        type="button"
                        class="btn btn-secondary p-2"
                        data-dismiss="modal"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./home.js"></script>
<style>
#logsTable_paginate a {
  background-color: white !important;
}
</style>

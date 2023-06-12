<template>
  <div class="log-viewer">
    <div
      id="topHeader"
      class="log-report-header row bg-light m-0"
      v-if="currentUser && currentUser.firstName"
    >
      <div class="col-12 d-flex justify-content-between">
        <div class="logo">
          <h1>
            <a href="/#/home"
              ><img src="../../public/assets/log-mon-logo.png"
            /></a>
          </h1>
        </div>
        <div class="d-flex align-items-center label-div">
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
              <li class="pl-2 p-1 border-bottom">
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
              <li class="pl-2 p-1 border-bottom">
                <a href="/#/profile"
                  ><i class="fa fa-gear p-2"></i>Profile Setting</a
                >
              </li>
              <li class="pl-2 p-1 border-bottom" v-on:click="logout()">
                <a><i class="fa fa-sign-out p-2"></i> Logout</a>
              </li>
            </ul>
          </label>
        </div>
      </div>
    </div>
    <div class="logtabs pt-0">
      <div class="container p-1 log-viewer-container">
        <div class="row justify-content-end">
          <div class="col-md-12" style="font-size: 14px !important">
            <button
              class="download-pdf btn btn-primary ml-auto mx-w-190 p-1"
              v-on:click="generateReport"
            >
              <i class="fa fa-download pr-3" aria-hidden="true"></i>
              Download PDF
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="logtabs" style="margin-top: -6% !important"> -->
      <div class="container p-t-10 container-log">
        <div ref="logReportpdf" class="log-main-container">
          <div class="row log-heading-row">
            <div class="col-md-12 pt-1">
              <h5 for="selectdate pull-left">
                {{ logConfig.logName }}
              </h5>
              <hr />
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <canvas id="logReporterrorChart"></canvas>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 pt-1">
              <div class="row">
                <div
                  class="col-md-12 pt-4"
                  style="padding-top: 30px !important"
                >
                  <ul class="log-report-danger list-group">
                    <li
                      class="error-desc list-group-item bg-danger text-white mr-2 p-1"
                      aria-current="true"
                    >
                      Total No. Errors Description
                    </li>
                    <li
                      v-for="(item, id) in logConfig.prepareErrorWithCount"
                      :key="id"
                      v-on:click="
                        showTrend(logConfig.selectedErrorOption, item)
                      "
                      class="list-group-item description-list mr-2 pl-1 pt-1"
                    >
                      <span
                        class="btn btn-danger btn-sm text-white float-right badge"
                        style="
                          color: #842029 !important;
                          background-color: #f8d7da !important;
                          border-color: #f5c2c7 !important;
                        "
                      >
                        {{ item.quantity }}
                      </span>
                      {{ item.errorDescription }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="html2pdf__page-break"></div>
          <div class="row pt-5">
            <div class="col-md-12">
              <canvas id="logReportwarningChart"></canvas>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 pl-5 pt-1">
              <div class="row">
                <div
                  class="col-md-12 pt-4"
                  style="padding-top: 30px !important"
                >
                  <div>
                    <ul
                      id="warningUniqueDescription"
                      class="log-report-warn list-group"
                    >
                      <li
                        class="warning-desc list-group-item bg-warning text-white mr-2 p-1"
                        aria-current="true"
                      >
                        Total No. Warnings Description
                      </li>
                      <li
                        v-for="(item, id) in logConfig.prepareWarningWithCount"
                        :key="id"
                        v-on:click="
                          showTrend(logConfig.selectedWarningOption, item)
                        "
                        class="list-group-item description-list mr-2 pl-1 pt-1"
                      >
                        <span
                          style="
                            background-color: #fff3cd;
                            color: #664d03 !important;
                            border-color: #ffecb5 !important;
                          "
                          class="btn btn-warning btn-sm text-white float-right badge"
                          >{{ item.quantity }}</span
                        >
                        {{ item.warningDescription }}
                      </li>
                    </ul>
                  </div>
                </div>
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
          <div class="modal-dialog modal-md">
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
                      'badge-danger': trendInfo.trendType == 'errorDescription',
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
</template>
<script src="./log-report.js"></script>
<style>
canvas {
  width: 95% !important;
  height: 300px !important;
  margin: auto !important;
}
</style>

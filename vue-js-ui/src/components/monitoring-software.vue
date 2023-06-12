<template>
  <div class="limiter">
    <loading
      color="#09b8aa"
      class="loading"
      :active.sync="isLoading"
      :can-cancel="true"
      :is-full-page="fullPage"
    >
    </loading>
    <div class="software-container">
      <div
        id="topHeader"
        class="profile-header row bg-light m-0"
        v-if="currentUser && currentUser.firstName"
      >
        <div class="col-12">
          <div class="align-items-center label-div pull-right moinitoring-nav">
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
                <li
                  class="pl-2 p-1 border-bottom-profile"
                  v-if="currentUser.role === 'admin'"
                >
                  <a href="/#/user-list"
                    ><i class="fa fa-list p-2"></i>User list</a
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
      <div class="container-login100 software-inner-container">
        <div class="mx-width-800 p-l-55 p-r-55 p-t-54 p-b-54">
          <h2>Monitoring Softwares</h2>
          <p class="software-desc">Please select your software</p>
          <div class="all-softwares row">
            <div class="col-md-6" v-on:click="redirectToSoftware('logMon')">
              <div
                class="inner-software"
                v-bind:class="
                  currentUser.role === 'user' && !currentUser.accessList.logMon
                    ? 'disabled-software'
                    : ''
                "
              >
                <a>
                  <img src="../../public/assets/log-mon-logo.png" />
                  <h4>LogMon</h4>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s
                  </p>
                </a>
              </div>
            </div>
            <div class="col-md-6" v-on:click="redirectToSoftware('threadMon')">
              <div
                class="inner-software"
                v-bind:class="
                  currentUser.role === 'user' &&
                  !currentUser.accessList.threadMon
                    ? 'disabled-software'
                    : ''
                "
              >
                <a>
                  <img src="../../public/assets/log-mon-logo.png" />
                  <h4>ThreadMon</h4>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import Loading from "vue-loading-overlay";
export default {
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem("logViewer_currentUser")),
    };
  },

  components: {
    Loading,
  },
  methods: {
    redirectToSoftware(type) {
      if (this.currentUser.role === "user") {
        if (this.currentUser.accessList.logMon && type === "logMon") {
          window.location.href = "/#/home";
        } else if (
          this.currentUser.accessList.threadMon &&
          type === "threadMon"
        ) {
          window.open("https://theradMon.com", "_blank").focus();
        } else {
          Vue.$toast.open({
            message: "You don't have permission for " + type + ".",
            type: "error",
          });
        }
      } else {
        if (type === "logMon") {
          window.location.href = "/#/home";
        } else {
          window.open("https://theradMon.com", "_blank").focus();
        }
      }
    },
    logout() {
      this.axios
        .get(Vue.config.baseUrl + "users/logout", { withCredentials: true })
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
  },
};
</script>

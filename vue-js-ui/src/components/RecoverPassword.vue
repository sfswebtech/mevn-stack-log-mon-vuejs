<template>
  <div class="limiter">
    <loading
      color="#09b8aa"
      class="loading"
      :active.sync="isLoading"
      :can-cancel="true"
      :is-full-page="fullPage"
    ></loading>
    <div class="div1 container-login100">
      <div class="wrap-login100 p-l-40 p-r-40 p-t-30 p-b-30">
        <form class="login100-form validate-form">
          <span class="login100-form-title p-b-49 pt-4">
            Recover Your Password
          </span>

          <div class="p-1" v-if="expiredLinkErrorMsg">
            <p
              class="alert alert-danger text-left"
              role="alert"
              style="font-family: initial; line-height: 20px"
            >
              {{ expiredLinkErrorMsg }}
            </p>
            <button
              type="button"
              routerLink="/login"
              class="btn btn-default px-4 btn-gray btn-square w-100 pt-2 ml-2"
            >
              <router-link :to="{ name: 'Signin' }" class="nav-link text-white">
                Cancel
              </router-link>
            </button>
          </div>
          <div class="card-body text-left" v-if="!expiredLinkErrorMsg">
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text">
                  <i class="fa fa-lock"></i>
                </span>
              </div>
              <input
                v-on:input="checkStrongPassword"
                type="password"
                maxlength="15"
                id="newPass"
                v-model="userData.password"
                class="form-control"
                placeholder="Enter new password"
              />
              <div class="input-group-prepend custom-cursor-pointer"></div>
              <p
                class="alert alert-danger text-left"
                role="alert"
                v-if="userData.password && strongPassword == false"
              >
                Your password should be minimum 7 and maximum 10 characters with
                1 number and 1 special character.
              </p>
            </div>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text">
                  <i class="fa fa-lock"></i>
                </span>
              </div>
              <input
                type="password"
                maxlength="15"
                id="confPass"
                v-model="userData.confirmPassword"
                class="form-control"
                placeholder="Enter confirm password"
              />
              <div class="input-group-prepend custom-cursor-pointer"></div>
              <p
                class="alert alert-danger text-left"
                role="alert"
                v-if="
                  userData.password != '' &&
                  userData.confirmPassword != '' &&
                  userData.password != userData.confirmPassword
                    ? errorMessage
                    : ''
                "
              >
                {{ errorMessage }}
              </p>
            </div>
            <div class="row ml-0 mr-0 flex-nowrap gray-border pt-30 mt-30">
              <button
                type="button"
                routerLink="/login"
                class="recover-password btn btn-primary px-4 mr-2 w-50"
              >
                <router-link
                  :to="{ name: 'Signin' }"
                  class="nav-link text-white"
                >
                  Cancel
                </router-link>
              </button>

              <!-- <button
                type="button"
                v-on:click="recoverPassword()"
                class="btn btn-primary px-4 mr-2 btn-square w-50"
              >
                Save
              </button> -->
              <input
                type="button"
                v-on:click="recoverPassword()"
                class="recover-password btn btn-primary px-4 mr-2 w-50"
                :disabled="!strongPassword || !userData.confirmPassword"
                value="Save"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
// import VueRouter from "vue-router";
import Loading from "vue-loading-overlay";
// import "vue-loading-overlay/dist/vue-loading.css";

export default {
  data() {
    return {
      isLoading: false,
      userData: { password: "", confirmPassword: "" },
      successMessage: "",
      errorResponseMessage: "",
      recoverData: "",
      errorMessage: "New password and confirmation password do not match !",
      validPassword: true,
      userInfo: {},
      userId: "",
      link: "",
      strongPassword: false,
      expiredLinkErrorMsg: "",
      passwordEncrypt: {
        newPass: "password",
        confPass: "password",
      },
    };
  },
  mounted() {
    console.log(this.$route);
    this.userId = this.$route.params.userId;
    this.link = this.$route.params.token;
    if (this.userId && this.link) {
      this.getUsersData();
    }
  },
  components: {
    Loading,
  },
  methods: {
    getUsersData() {
      this.isLoading = true;
      this.expiredLinkErrorMsg = "";
      let uri = Vue.config.baseUrl + "users/getUserInfo";
      this.axios.post(uri, { _id: this.userId, link: this.link }).then(
        (response) => {
          this.isLoading = false;
          if (response.data.status === 200) {
            this.userInfo = response.data.data;
            if (!this.userInfo.forgotLink) {
              this.expiredLinkErrorMsg =
                "Forgot Password Link has been expired. Please check link or again you can request for forgot password!";
            }
          } else {
            this.expiredLinkErrorMsg =
              "Forgot Password Link has been expired. Please check link or again you can request for forgot password!";
          }
        },
        (error) => {
          console.log("error===", error);
          this.isLoading = false;
          Vue.$toast.open({
            message: "There are some server error. Please check connection.",
            type: "error",
          });
        }
      );
    },
    recoverPassword() {
      if (!this.userData.password) {
        this.toastr.error("Please enter your password.", "Error");
        return false;
      } else if (!this.userData.confirmPassword) {
        this.toastr.error("Please enter your confirm password.", "Error");
        return false;
      } else if (
        this.userData.password !== "" &&
        this.userData.confirmPassword !== "" &&
        this.userData.password !== this.userData.confirmPassword
      ) {
        return false;
      } else if (!this.validPassword) {
        return false;
      }
      const userNewInfo = {
        _id: this.userId,
        forgotLink: "",
        forgotStatus: 0,
        password: this.userData.password,
      };
      let uri = Vue.config.baseUrl + "users/saveUserInfo";

      this.isLoading = true;

      this.axios.post(uri, userNewInfo).then(
        (response) => {
          this.isLoading = false;
          if (response.data.status === 200) {
            Vue.$toast.open({
              message:
                "Your password has been changed successfully. Please login to continue.",
              type: "success",
            });
            this.$router.push("/signin");
          }
        },
        (error) => {
          this.isLoading = false;
          console.log("error=", error);
          Vue.$toast.open({
            message: "There are some server error. Please check connection.",
            type: "error",
          });
        }
      );
    },
    AvoidSpace(event) {
      const k = event ? event.which : event.keyCode;
      if (k === 32) {
        return false;
      }
    },
    checkStrongPassword() {
      let inputtxt = this.userData.password;
      var paswd = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,10}$/;

      if (inputtxt.match(paswd)) {
        this.strongPassword = true;
      } else {
        this.strongPassword = false;
      }
    },
  },
};
</script>

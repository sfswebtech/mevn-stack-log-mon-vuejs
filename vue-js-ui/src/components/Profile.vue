<template>
  <div>
    <div
      id="topHeader"
      class="profile-header row bg-light m-0"
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
    <div class="limiter">
      <loading
        color="#09b8aa"
        class="loading"
        :active.sync="isLoading"
        :can-cancel="true"
        :is-full-page="fullPage"
      ></loading>
      <div class="container-login100" style="background-color: #f5f5f5">
        <div class="wrap-login100 p-t-20 p-b-20 profile-form">
          <h4 class="login100-form-title">Profile Setting</h4>
          <hr class="m-b-30" />
          <form
            class="login100-form validate-form first-form"
            v-on:submit.prevent="createUser"
          >
            <div class="row">
              <div class="col-md-6">
                <div
                  class="wrap-input100 validate-input m-b-23"
                  data-validate="First Name is reauired"
                >
                  <span class="label-input100"
                    >First Name
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !currentUser.firstName,
                          'text-primary': currentUser.firstName,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </span>

                  <input
                    class="input100"
                    type="text"
                    name="firstName"
                    placeholder="Type Your First Name"
                    v-model="currentUser.firstName"
                  />
                  <span
                    class="focus-input100"
                    :data-symbol="'\uf206' | unescape"
                  ></span>
                </div>
              </div>

              <div class="col-md-6">
                <div
                  class="wrap-input100 validate-input m-b-23"
                  data-validate="Last Name is reauired"
                >
                  <span class="label-input100"
                    >Last Name
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !currentUser.lastName,
                          'text-primary': currentUser.lastName,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </span>

                  <input
                    class="input100"
                    type="text"
                    name="firstName"
                    placeholder="Type Your Last Name"
                    v-model="currentUser.lastName"
                  />
                  <span
                    class="focus-input100"
                    :data-symbol="'\uf206' | unescape"
                  ></span>
                </div>
              </div>

              <div class="col-md-6">
                <div
                  class="wrap-input100 validate-input m-b-23"
                  data-validate="Email is reauired"
                >
                  <span class="label-input100"
                    >Email
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !currentUser.email,
                          'text-primary': currentUser.email,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </span>
                  <input
                    class="input100"
                    type="text"
                    name="email"
                    placeholder="Type Your Email"
                    disabled
                    v-model="currentUser.email"
                  />
                  <span
                    class="focus-input100"
                    :data-symbol="'\uf15a' | unescape"
                  ></span>
                </div>
              </div>

              <div class="col-md-6">
                <div
                  class="wrap-input100 validate-input m-b-23"
                  data-validate="Mobile number is reauired"
                >
                  <span class="label-input100"
                    >Phone Number
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !currentUser.phoneNumber,
                          'text-primary': currentUser.phoneNumber,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </span>

                  <input
                    class="input100"
                    type="text"
                    maxlength="13"
                    name="phoneNumber"
                    placeholder="Type Your Phone Number"
                    v-model="currentUser.phoneNumber"
                  />
                  <span
                    class="focus-input100"
                    :data-symbol="'\uf2cc' | unescape"
                  ></span>
                </div>
              </div>
              <div class="text-left p-t-25 col-12">
                <input
                  type="button"
                  v-on:click="updateUserInfo('updateInfo')"
                  class="update-profile btn btn-primary w-auto"
                  value="Update"
                />
              </div>
            </div>
          </form>
          <h4 class="login100-form-title m-t-50 change-password">
            Change Password
          </h4>
          <hr class="m-b-30" />
          <form
            class="login100-form validate-form"
            v-on:submit.prevent="createUser"
          >
            <!-- old password  -->
            <div class="row">
              <div class="col-md-12">
                <div
                  class="wrap-input100 validate-input m-b-23"
                  data-validate="Email is reauired"
                >
                  <span class="label-input100"
                    >Old password
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !currentUser.oldPassword,
                          'text-primary': currentUser.oldPassword,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </span>

                  <!-- @change="onChange($event)" -->
                  <input
                    v-on:input="onChange"
                    class="input100"
                    type="password"
                    name="oldPassword"
                    placeholder="Type Your Old Password"
                    v-model="currentUser.oldPassword"
                  />
                  <span
                    class="focus-input100"
                    :data-symbol="'\uf190' | unescape"
                  ></span>
                </div>
                <p
                  class="alert alert-danger text-left"
                  role="alert"
                  v-if="currentUser.oldPassword && !oldPasswordValidation"
                >
                  Old Password Doesn't Match.
                </p>
              </div>
            </div>

            <!-- New Password -->
            <div class="row">
              <div class="col-md-12">
                <div
                  class="wrap-input100 validate-input m-b-23"
                  data-validate="Email is reauired"
                >
                  <span class="label-input100"
                    >New password
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !currentUser.newPassword,
                          'text-primary': currentUser.newPassword,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </span>

                  <input
                    v-on:input="CheckPassword"
                    class="input100"
                    type="password"
                    name="newPassword"
                    placeholder="Type Your New Password"
                    v-model="currentUser.newPassword"
                  />
                  <span
                    class="focus-input100"
                    :data-symbol="'\uf190' | unescape"
                  ></span>
                  <!-- <span class="focus-input100" :data-symbol="'\uf190' | unescape "></span> -->
                </div>
                <p
                  class="alert alert-danger text-left"
                  role="alert"
                  v-if="currentUser.newPassword && strongPassword == false"
                >
                  Your password should be minimum 7 and maximum 10 characters
                  with 1 number and 1 special character.
                </p>
              </div>
            </div>

            <!-- confirm Password -->
            <div class="row">
              <div class="col-md-12" style="padding-top: 10px">
                <div
                  class="wrap-input100 validate-input m-b-23"
                  data-validate="Mobile number is reauired"
                >
                  <span class="label-input100"
                    >Confirm password
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !currentUser.confirmPassword,
                          'text-primary': currentUser.confirmPassword,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </span>

                  <input
                    class="input100"
                    type="password"
                    name="confirmPassword"
                    placeholder="Type Your Confirm Password"
                    v-model="currentUser.confirmPassword"
                  />
                  <span
                    class="focus-input100"
                    :data-symbol="'\uf190' | unescape"
                  ></span>
                </div>
                <p
                  class="alert alert-danger text-left"
                  role="alert"
                  v-if="
                    currentUser.newPassword &&
                    currentUser.confirmPassword &&
                    currentUser.newPassword != currentUser.confirmPassword
                  "
                >
                  New password and confirmation password do not match !
                </p>
              </div>
            </div>

            <div class="text-left pt-4 p-b-31">
              <input
                type="submit"
                class="update-pass btn btn-default w-auto"
                :disabled="
                  !currentUser.confirmPassword ||
                  !currentUser.confirmPassword ||
                  !oldPasswordValidation ||
                  !strongPassword
                "
                v-on:click="updateUserInfo('changePassword')"
                value="Update Password"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Loading from "vue-loading-overlay";
// import "vue-loading-overlay/dist/vue-loading.css";
export default {
  /* components: {
      name: 'AddItem'
  }, */
  data() {
    return {
      item: {},
      isLoading: false,
      fullPage: true,
      oldPasswordValidation: true,
      currentUser: JSON.parse(localStorage.getItem("logViewer_currentUser")),
      requiredValidate: {
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
      },
      strongPassword: false,
    };
  },

  components: {
    Loading,
  },
  methods: {
    onChange() {
      // if(event.target.name){
      this.axios
        .post(Vue.config.baseUrl + "users/checkOldPassword", this.currentUser, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.status == 200) {
            this.oldPasswordValidation = true;
          } else {
            this.oldPasswordValidation = false;
          }
        })
        .catch((err) => {
          this.oldPasswordValidation = false;
          console.log(err);
          Vue.$toast.open({
            message: "Old Password Doesn't Match.",
            type: "error",
          });
        });

      // }
    },
    updateUserInfo(e) {
      let updateInfo = "updateInfo";
      let changePassword = "changePassword";

      console.log(e);
      console.log(updateInfo);
      console.log(changePassword);

      const objecKeys = Object.keys(this.requiredValidate);

      const self = this;
      const found = objecKeys.filter(function (obj) {
        return !self.currentUser[obj];
      });
      if (
        found.length ||
        (!this.currentUser.oldPassword &&
          this.currentUser.newPassword &&
          this.currentUser.confirmPassword)
      ) {
        Vue.$toast.open({
          message: "* Please fill all mandatory fields!.",
          type: "error",
        });
        return false;
      } else if (
        this.currentUser.newPassword &&
        this.currentUser.confirmPassword &&
        !this.oldPasswordValidation
      ) {
        Vue.$toast.open({
          message: "Old Password Doesn't Match.",
          type: "error",
        });
        return false;
      } else if (
        this.currentUser.newPassword !== this.currentUser.confirmPassword
      ) {
        Vue.$toast.open({
          message: "Password & confirm password doesn't match!",
          type: "error",
        });
        return false;
      }
      this.isLoading = true;
      let uri = Vue.config.baseUrl + "users/saveUserInfo";
      if (this.currentUser.newPassword) {
        this.currentUser.password = this.currentUser.newPassword;
      } else {
        delete this.currentUser.password;
      }
      this.axios
        .post(uri, this.currentUser, { withCredentials: true })
        .then((response) => {
          this.isLoading = false;
          if (response.data.status === 200) {
            if (
              this.currentUser.newPassword &&
              this.currentUser.confirmPassword
            ) {
              Vue.$toast.open({
                message: "Your password has been changed successfully.",
                type: "success",
              });
              setTimeout(() => {
                this.currentUser.newPassword = "";
                this.currentUser.confirmPassword = "";
                this.currentUser.oldPassword = "";
              }, 1000);
              localStorage.removeItem("logViewer_currentUser");
              location.reload();
            } else {
              localStorage.setItem(
                "logViewer_currentUser",
                JSON.stringify(response.data.data)
              );
              Vue.$toast.open({
                message: "Your profile has been updated successfully.",
                type: "success",
              });
            }
          } else {
            Vue.$toast.open({
              message: "There is some error, Please try again.",
              type: "error",
            });
          }
        });
    },
    CheckPassword() {
      let inputtxt = this.currentUser.newPassword;
      var paswd = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,10}$/;

      if (inputtxt.match(paswd)) {
        this.strongPassword = true;
      } else {
        this.strongPassword = false;
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

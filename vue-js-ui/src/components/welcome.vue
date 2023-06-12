<template>
  <div class="limiter welcome">
    <loading
      color="#09b8aa"
      class="loading"
      :active.sync="isLoading"
      :can-cancel="true"
      :is-full-page="fullPage"
    >
    </loading>
    <div class="welcome-section">
      <h2><span>Welcome to LogMon</span></h2>
      <div class="welcome-inner-section">
        <div class="container-login100">
          <form
            class="login100-form validate-form welcome-form"
            v-on:submit.prevent="createUser"
          >
            <h3 class="login100-form-title welcome-form-heading pt-0">
              Create Admin Credentials
            </h3>
            <div class="wrap-input100 validate-input m-b-23">
              <span class="label-input100"
                >Email
                <sup>
                  <i
                    class="fa fa-star star-icon"
                    aria-hidden="true"
                    v-bind:class="{
                      'text-danger': !item.email,
                      'text-primary': item.email,
                    }"
                  ></i>
                </sup>
              </span>
              <input
                class="input100"
                type="text"
                name="email"
                placeholder="Type your email"
                v-model="item.email"
                @input="checkValidEmail($event)"
              />
              <p
                class="alert alert-danger validation-font-size text-left"
                role="alert"
                v-if="item.email && !validEmail"
              >
                Your email address is invalid. Please enter a valid address.
              </p>
            </div>

            <div class="wrap-input100 validate-input">
              <span class="label-input100"
                >Password
                <sup>
                  <i
                    class="fa fa-star star-icon"
                    aria-hidden="true"
                    v-bind:class="{
                      'text-danger': !item.password,
                      'text-primary': item.password,
                    }"
                  ></i>
                </sup>
              </span>
              <input
                class="input100"
                v-bind:type="passwordType"
                name="password"
                placeholder="Type Your password"
                v-model="item.password"
              />
              <i
                v-on:click="changePasswordType('text')"
                class="fa fa-eye text-primary password-eye-slash p-eye"
                v-if="passwordType !== 'text'"
              ></i>
              <i
                v-on:click="changePasswordType('password')"
                v-if="passwordType === 'text'"
                class="fa fa-eye-slash password-eye-slash p-eye text-primary"
              ></i>
            </div>
            <div class="container-login100-form-btn">
              <div class="wrap-login100-form-btn">
                <div class="login100-form-bgbtn"></div>
                <input
                  type="submit"
                  value="Create"
                  class="btn btn-primary ml-auto mr-auto"
                />
              </div>
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
export default {
  /* components: {
      name: 'AddItem'
  }, */
  data() {
    return {
      ADMIN_USERS_LIMIT: "",
      passwordType: "password",
      item: {
        firstName: "Admin",
        lastName: "admin",
        role: "admin",
        phoneNumber: "",
        email: "admin@admin.com",
        password: "admin@123",
      },
      validEmail: true,
      requiredValidate: {
        email: "",
        password: "",
      },
    };
  },
  mounted() {
    setTimeout(() => {
      this.ADMIN_USERS_LIMIT = Vue.config.envConfig.ADMIN_USERS_LIMIT;
    }, 1000);
  },
  components() {
    Loading;
  },
  methods: {
    createUser() {
      this.isLoading = true;
      const objecKeys = Object.keys(this.requiredValidate);
      const self = this;
      const found = objecKeys.filter(function (obj) {
        return !self.item[obj];
      });
      if (found.length || !this.validEmail) {
        Vue.$toast.open({
          message: "* Please fill all mandatory fields!.",
          type: "error",
        });
        return false;
      }
      let uri = Vue.config.baseUrl + "users/create";
      this.axios
        .post(uri, this.item, { withCredentials: true })
        .then((response) => {
          this.isLoading = false;
          if (response.data.status == 200) {
            localStorage.setItem(
              "logViewer_currentUser",
              JSON.stringify(response.data.data)
            );
            Vue.$toast.open({
              message: "You have successfully logged in.",
              type: "success",
            });
            window.location.href = "/#/monitoring-software";
          } else {
            Vue.$toast.open({
              message: "Login failed: Invalid email or password.",
              type: "error",
            });
          }
        });
    },
    checkValidEmail() {
      const mailformat =
        "[a-zA-Z0-9_\\.\\+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-\\.]+";
      if (this.item.email.match(mailformat)) {
        this.validEmail = true;
      } else {
        this.validEmail = false;
      }
    },
    changePasswordType(pwdType) {
      this.passwordType = pwdType;
    },
  },
};
</script>

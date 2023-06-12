<template>
  <div class="limiter">
    <loading
      color="#09b8aa"
      class="loading"
      :active.sync="isLoading"
      :can-cancel="true"
      :is-full-page="fullPage"
    ></loading>
    <div class="container-login100">
      <div class="wrap-login100 p-l-50 p-r-40 p-t-40 p-b-54">
        <form class="login100-form validate-form">
          <span class="login100-form-title p-b-49 pt-4"> Forgot Password </span>

          <div class="text-center">
            <p class="text-muted p-1 text-left">
              Forgot your password? No problem. Just enter your email below and
              we'll send you a link to reset it.
            </p>
          </div>
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <span class="input-group-text">
                <i class="fa fa-envelope-o"></i>
              </span>
            </div>
            <input
              type="email"
              v-model="userData.email"
              class="form-control"
              placeholder="Email address"
              id="forgotEmail"
              @input="checkValidEmail($event)"
            />
            <p
              class="alert alert-danger text-left"
              style="font-size: 14px"
              role="alert"
              v-if="userData.email && !validEmail"
            >
              Your email address is invalid. Please enter a valid address.
            </p>
          </div>
          <h6 class="text-danger text-left">{{ errorMessage }}</h6>
          <h6 class="text-success text-left">{{ successMessage }}</h6>
          <div class="row ml-0 mr-0 flex-nowrap gray-border pt-30 mt-30">
            <!-- <button
              type="button"
              :to="{ name: 'Signin' }"
              class=""
            > -->
            <router-link
              :to="{ name: 'Signin' }"
              class="forgot-password nav-link text-white btn btn-default btn-sm w-50 mr-2"
            >
              Cancel
            </router-link>
            <!-- </button> -->
            <button
              type="button"
              :disabled="!userData.email"
              v-on:click="forgotPassword()"
              class="forgot-password nav-link text-white btn btn-default btn-sm w-50 mr-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
// import $router from 'vue-router';
import Loading from "vue-loading-overlay";
// Import stylesheet
// import "vue-loading-overlay/dist/vue-loading.css";
export default {
  data() {
    return {
      errorMessage: "",
      successMessage: "",
      userData: { email: "" },
      emailLink: "",
      validEmail: true,
      isLoading: false,
      fullPage: true,
    };
  },
  components: {
    Loading,
  },
  methods: {
    forgotPassword() {
      this.successMessage = "";
      this.errorMessage = "";
      if (this.userData.email && this.validEmail) {
        this.isLoading = true;
        this.userData.email = this.userData.email.toLocaleLowerCase();
        let uri = Vue.config.baseUrl + "users/forgotPassword";
        this.axios.post(uri, this.userData).then(
          (response) => {
            this.isLoading = false;
            if (response.data.status === 200) {
              Vue.$toast.open({
                message:
                  "Please check your email, Reset password link has been sent.",
                type: "success",
              });
              this.errorMessage = "";
              this.successMessage = response.data.message;
              this.userData = {
                email: "",
              };
            } else {
              this.successMessage = "";
              this.errorMessage = response.data.message;
              this.userData = {
                email: "",
              };
            }
          },
          (error) => {
            console.log("error=========", error);
            this.isLoading = false;
            Vue.$toast.open({
              message: "There are some server error. Please check connection.",
              type: "error",
            });
          }
        );
      } else {
        Vue.$toast.open({
          message: "Please enter your Valid email address for the send email.",
          type: "warning",
        });
      }
    },
    checkValidEmail() {
      this.errorMessage = "";
      const mailformat =
        "[a-zA-Z0-9_\\.\\+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-\\.]+";
      if (this.userData.email.match(mailformat)) {
        return (this.validEmail = true);
      } else {
        return (this.validEmail = false);
      }
    },
  },
};
</script>

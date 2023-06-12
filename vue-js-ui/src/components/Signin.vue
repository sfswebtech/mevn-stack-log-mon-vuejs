<template>
  <div class="limiter">
    <loading
      color="#09b8aa"
      class="loading"
      :active.sync="isLoading"
      :can-cancel="true"
      :is-full-page="fullPage"
    ></loading>
    <div class="container-login100" style="background-color: #f5f5f5">
      <div class="wrap-login100 p-l-55 p-r-55 p-t-54 p-b-54">
        <form class="login100-form validate-form" v-on:submit.prevent="doLogin">
          <span class="login100-form-title p-b-49"> Login </span>

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
                    'text-danger': !item.email,
                    'text-primary': item.email,
                  }"
                  aria-hidden="true"
                ></i>
              </sup>
            </span>
            <input
              class="input100"
              type="text"
              name="username"
              placeholder="Type your Email"
              v-model="item.email"
            />
            <span
              class="focus-input100"
              :data-symbol="'\uf206' | unescape"
            ></span>
          </div>

          <div
            class="wrap-input100 validate-input"
            data-validate="Password is required"
          >
            <span class="label-input100"
              >Password
              <sup>
                <i
                  class="fa fa-star star-icon"
                  v-bind:class="{
                    'text-danger': !item.password,
                    'text-primary': item.password,
                  }"
                  aria-hidden="true"
                ></i>
              </sup>
            </span>
            <input
              class="input100"
              type="password"
              name="pass"
              placeholder="Type your password"
              v-model="item.password"
            />
            <span
              class="focus-input100"
              :data-symbol="'\uf190' | unescape"
            ></span>
          </div>

          <div class="text-right p-t-8 p-b-31">
            <!--  <router-link :to="{ name: 'ForgotPassword' }" class="nav-link">
              Forgot password?
            </router-link> -->
          </div>

          <div class="container-login100-form-btn">
            <div class="wrap-login100-form-btn">
              <div class="login100-form-bgbtn"></div>
              <input
                type="submit"
                class="btn btn-primary ml-auto mr-auto"
                value="Login"
              />
            </div>
          </div>

          <!--   <div class="text-center signup">
            <router-link :to="{ name: 'Signup' }" class="nav-link">
              Sign Up
            </router-link>
          </div> -->
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
      item: {},
      isLoading: false,
      fullPage: true,
    };
  },
  components: { Loading },
  methods: {
    doLogin() {
      if (!this.item.email || !this.item.password) {
        Vue.$toast.open({
          message: "* Please fill all mandatory fields!.",
          type: "error",
        });
        return false;
      }
      this.isLoading = true;
      let uri = Vue.config.baseUrl + "users/doLogin";
      this.axios.post(uri, this.item, { withCredentials: true }).then(
        (response) => {
          this.isLoading = false;
          if (response.data.status == 200) {
            localStorage.setItem(
              "logViewer_currentUser",
              JSON.stringify(response.data.data)
            );
            // if (response.data.data.role === "admin") {
            //   window.location.href = "/#/home";
            // } else {
            window.location.href = "/#/monitoring-software";
            // }
            Vue.$toast.open({
              message: "You have successfully logged in.",
              type: "success",
            });
            // location.reload();
            // this.$router.push("home");
          } else {
            Vue.$toast.open({
              message: "Login failed: Invalid email or password.",
              type: "error",
            });
          }
        },
        (error) => {
          this.isLoading = false;
          console.log("doLogin", error);
        }
      );
    },
  },
};
</script>

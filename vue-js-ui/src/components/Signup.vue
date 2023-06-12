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
    <div class="container-login100" style="background-color: #f5f5f5">
      <div class="wrap-login100 mx-width-700 p-l-55 p-r-55 p-t-54 p-b-54">
        <form
          class="login100-form validate-form"
          v-on:submit.prevent="createUser"
        >
          <span class="login100-form-title p-b-49"> Register </span>

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
                        'text-danger': !item.firstName,
                        'text-primary': item.firstName,
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
                  v-model="item.firstName"
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
                        'text-danger': !item.lastName,
                        'text-primary': item.lastName,
                      }"
                      aria-hidden="true"
                    ></i>
                  </sup>
                </span>
                <input
                  class="input100"
                  type="text"
                  name="lastName"
                  placeholder="Type Your Last Name"
                  v-model="item.lastName"
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
                  name="email"
                  placeholder="Type your email"
                  v-model="item.email"
                  @input="checkEmailAlreadyExists($event)"
                />
                <span
                  class="focus-input100"
                  :data-symbol="'\uf15a' | unescape"
                ></span>
              </div>
              <p
                class="alert alert-danger validation-font-size text-left"
                role="alert"
                v-if="item.email && alreadyEmailValidation"
              >
                This Email Already Exists, please try another one.
              </p>
              <p
                class="alert alert-danger validation-font-size text-left"
                role="alert"
                v-if="item.email && !validEmail"
              >
                Your email address is invalid. Please enter a valid address.
              </p>
            </div>

            <div class="col-md-6">
              <div
                class="wrap-input100 validate-input m-b-23"
                data-validate="Mobile number is reauired"
              >
                <span class="label-input100"
                  >Mobile Number
                  <sup>
                    <i
                      class="fa fa-star star-icon"
                      v-bind:class="{
                        'text-danger': !item.phoneNumber,
                        'text-primary': item.phoneNumber,
                      }"
                      aria-hidden="true"
                    ></i>
                  </sup>
                </span>
                <input
                  class="input100"
                  maxlength="10"
                  type="text"
                  name="phoneNumber"
                  placeholder="Type your Mobile Number"
                  v-model="item.phoneNumber"
                />
                <span
                  class="focus-input100"
                  :data-symbol="'\uf2cc' | unescape"
                ></span>
              </div>
            </div>

            <div class="col-md-6">
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
                  v-on:input="CheckPassword"
                  class="input100"
                  type="password"
                  name="password"
                  placeholder="Type Your password"
                  v-model="item.password"
                />
                <span
                  class="focus-input100"
                  :data-symbol="'\uf190' | unescape"
                ></span>
              </div>
              <p
                class="alert alert-danger validation-font-size text-left"
                role="alert"
                v-if="item.password && strongPassword == false"
              >
                Your password should be minimum 7 and maximum 10 characters with
                1 number and 1 special character.
              </p>
            </div>

            <div class="col-md-6">
              <div
                class="wrap-input100 validate-input"
                data-validate="Password is required"
              >
                <span class="label-input100"
                  >Confirm Password
                  <sup>
                    <i
                      class="fa fa-star star-icon"
                      v-bind:class="{
                        'text-danger': !item.confPassword,
                        'text-primary': item.confPassword,
                      }"
                      aria-hidden="true"
                    ></i>
                  </sup>
                </span>
                <input
                  class="input100"
                  type="password"
                  name="confPassword"
                  placeholder="Type Your password"
                  v-model="item.confPassword"
                />
                <span
                  class="focus-input100"
                  :data-symbol="'\uf190' | unescape"
                ></span>
              </div>
            </div>
          </div>

          <div class="container-login100-form-btn text-right pt-5">
            <div class="wrap-login100-form-btn">
              <div class="login100-form-bgbtn"></div>
              <!-- <button class="login100-form-btn">
								Register
							</button> -->
              <input type="submit" class="btn btn-primary" value="Register" />
            </div>
          </div>

          <div class="text-center signup">
            <router-link :to="{ name: 'Signin' }" class="nav-link">
              Sign In
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Loading from "vue-loading-overlay";
// Import stylesheet
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
      alreadyEmailValidation: false,
      validEmail: true,
      requiredValidate: {
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
      },
      strongPassword: false,
    };
  },
  components() {
    Loading;
  },
  methods: {
    createUser() {
      this.isLoading = true;
      const objecKeys = Object.keys(this.requiredValidate);
      const self = this;
      const found = objecKeys.filter(function(obj) {
        return !self.item[obj];
      });

      if (
        found.length ||
        !this.validEmail ||
        this.alreadyEmailValidation ||
        !this.strongPassword
      ) {
        Vue.$toast.open({
          message: "* Please fill all mandatory fields!.",
          type: "error",
        });
        return false;
      } else if (this.item.password !== this.item.confPassword) {
        Vue.$toast.open({
          message: "Password & confirm password doesn't match!",
          type: "error",
        });
        return false;
      }
      let uri = Vue.config.baseUrl + "users/create";
      this.axios.post(uri, this.item, { withCredentials: true }).then(() => {
        this.isLoading = false;
        Vue.$toast.open({
          message: "*Signup Succeeded",
          type: "success",
        });
        // location.reload();
        // router.push({name: "signin"})
        // window.location.href = '/signin';
        this.$router.push("signin");
      });
    },
    checkEmailAlreadyExists() {
      const mailformat =
        "[a-zA-Z0-9_\\.\\+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-\\.]+";
      if (this.item.email.match(mailformat)) {
        this.alreadyEmailValidation = false;
        const postData = { email: this.item.email };
        let uri = Vue.config.baseUrl + "users/emailAlreadyExits";
        this.axios.post(uri, postData, { withCredentials: true }).then(
          (response) => {
            if (response.data.status === 200 && response.data.data.length) {
              this.alreadyEmailValidation = true;
              this.validEmail = true;
            } else {
              this.alreadyEmailValidation = false;
              this.validEmail = true;
            }
          },
          (error) => {
            console.log("checkEmailAlreadyExists", error);
            this.alreadyEmailValidation = false;
            this.validEmail = false;
          }
        );
      } else {
        this.alreadyEmailValidation = false;
        this.validEmail = false;
      }
    },
    CheckPassword() {
      let inputtxt = this.item.password;
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

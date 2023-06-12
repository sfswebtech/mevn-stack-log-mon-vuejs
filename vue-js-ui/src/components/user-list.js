import Vue from "vue";
import Loading from "vue-loading-overlay";
import jQuery from "jquery";
let $ = jQuery;
// import "vue-loading-overlay/dist/vue-loading.css";
export default {
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem("logViewer_currentUser")),
      currentDeleteUser: {},
      item: {
        adminUserId: '',
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        countrycode: "+91",
        accessList: {
          logMon: true,
          threadMon: true
        }
      },
      isLoading: false,
      fullPage: true,
      alreadyEmailValidation: false,
      validEmail: true,
      requiredValidate: {
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
      },
      strongPassword: false,
      userList: []
    };
  },
  mounted() {
    this.getAllUser();
  },
  components: {
    Loading,
  },
  methods: {
    showAddEditUserModal(user) {
      this.alreadyEmailValidation = false;
      this.validEmail = true;
      this.strongPassword = true;
      if (user) {
        user = JSON.parse(JSON.stringify(user))
        user.countrycode = user.phoneNumber.substring(0, 3)
        user.phoneNumber = user.phoneNumber.substring(3, 13)
        delete user.password;
        console.log("user====", user)
        this.item = user
        $("#addEditUserModal").modal({
          show: true,
        });
      } else {
        if (this.userList.length === this.currentUser.adminUsersLimit) {
          Vue.$toast.open({
            message: "Limit Exceeded while creating user. You can add just " + this.currentUser.adminUsersLimit + " users!",
            type: "error",
          });
        } else {
          this.item = {
            adminUserId: '',
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            countrycode: '+91',
            password: "",
            accessList: {
              logMon: true,
              threadMon: true
            }
          }
          $("#addEditUserModal").modal({
            show: true,
          });
        }
      }
    },
    showDeleteUserModal(user) {
      this.currentDeleteUser = user;
      $("#deleteUserModal").modal({
        show: true,
      });
    },
    getAllUser() {
      this.isLoading = true;
      let user = {
        user: this.currentUser,
      };
      this.axios
        .post(Vue.config.baseUrl + "users/getAllUsers", user, {
          withCredentials: true,
        })
        .then((res) => {
          this.isLoading = false;
          if (res.data.status === 200) {
            this.userList = res.data.data;
          } else {
            this.userList = [];
          }
        })
        .catch((err) => console.log(err));
    },
    createUser() {
      const objecKeys = Object.keys(this.requiredValidate);
      if (!this.item._id) {
        objecKeys.push('password');
      }
      const self = this;
      const found = objecKeys.filter(function (obj) {

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
      } else if ((self.item.confPassword &&
          !this.item.password &&
          self.item.password !== self.item.confPassword) ||
        (this.item.password &&
          self.item.password !== self.item.confPassword)) {
        Vue.$toast.open({
          message: "Password & confirm password doesn't match!",
          type: "error",
        });
        return false;
      } else if (!this.item._id && this.item.password !== this.item.confPassword) {
        Vue.$toast.open({
          message: "Password & confirm password doesn't match!",
          type: "error",
        });
        return false;
      }
      let uri = Vue.config.baseUrl + "users/create";
      this.item.adminUserId = this.currentUser._id;
      this.item.phoneNumber = this.item.countrycode + this.item.phoneNumber
      this.isLoading = true;
      this.axios.post(uri, this.item, {
        withCredentials: true
      }).then(
        (response) => {
          if (response.data.status === 200) {
            this.isLoading = false;
            if (this.item._id) {
              Vue.$toast.open({
                message: "User has been updated successfully.",
                type: "success",
              });
            } else {
              Vue.$toast.open({
                message: "User has been created successfully.",
                type: "success",
              });
            }
            $("#addEditUserModal").modal("hide");
            this.getAllUser();
          }
        },
        (error) => {
          console.log("error== creating user", error);
        }
      );
    },
    checkEmailAlreadyExists() {
      const mailformat =
        "[a-zA-Z0-9_\\.\\+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-\\.]+";
      if (this.item.email.match(mailformat)) {
        this.alreadyEmailValidation = false;
        const postData = {
          email: this.item.email,
          _id: this.item._id ? this.item._id : ''
        };
        let uri = Vue.config.baseUrl + "users/emailAlreadyExits";
        this.axios.post(uri, postData, {
          withCredentials: true
        }).then(
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
    deleteUserinDb() {
      this.isLoading = true;
      let uri = Vue.config.baseUrl + "users/deleteUser";
      this.axios.post(uri, this.currentDeleteUser, {
        withCredentials: true
      }).then(
        (response) => {
          if (response.data.status === 200) {
            this.isLoading = false;
            this.currentDeleteUser = {};
            Vue.$toast.open({
              message: "User has been deleted successfully.",
              type: "success",
            });
            $("#deleteUserModal").modal("hide");
            this.getAllUser();
          }
        },
        (error) => {
          console.log("error== creating user", error);
        }
      );
    },
    CheckPassword() {
      let inputtxt = this.item.password;
      if (inputtxt) {
        var paswd = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,10}$/;
        if (inputtxt.match(paswd)) {
          this.strongPassword = true;
        } else {
          this.strongPassword = false;
        }
      }
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
  },
};
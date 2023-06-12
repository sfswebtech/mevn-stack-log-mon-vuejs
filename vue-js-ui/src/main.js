import Vue from "vue";
import VueRouter from "vue-router";
import VueAxios from "vue-axios";
import axios from "axios";
import NProgress from "nprogress";
// import $ from 'jquery'

import App from "./App.vue";
// import Index from './components/Index.vue';
import Home from "./components/Home.vue";
import Signin from "./components/Signin.vue";
// import Signup from "./components/Signup.vue";
import Profile from "./components/Profile.vue";
// import RecoverPassword from "./components/RecoverPassword.vue";
// import ForgotPassword from "./components/forgotPassword.vue";
import logReport from "./components/log-report.vue";
import Welcome from "./components/welcome.vue";
import UserList from "./components/user-list.vue";
import MonitoringSoftware from "./components/monitoring-software.vue";

import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/nprogress/nprogress.css";

import "./../public/assets/fonts/iconic/css/material-design-iconic-font.min.css";
import "./../public/assets/css/util.css";
import "./../public/assets/css/main.css";
import "./../public/assets/css/responsive.css";

import "./../public/assets/js/jquery-2.2.4.min.js";
// import './../public/assets/js/popper.min.js';
import "./../public/assets/js/bootstrap.bundle.min.js";
import "./../public/assets/js/datatable.min.js";
import "./../public/assets/js/jquery-ui.js";
import VueToast from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

Vue.use(VueToast);
Vue.use(VueRouter);
Vue.use(VueAxios, axios);

// Vue.config.baseUrl = '/'; // This is production url
Vue.config.baseUrl = "http://localhost:3000/"; // this is development url

Vue.config.productionTip = false;

const routes = [{
    name: "Index",
    path: "/",
    component: Signin,
  },
  {
    name: "Home",
    path: "/home",
    component: Home,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: "log-report",
    path: "/log-report/:logId",
    component: logReport,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: "Signin",
    path: "/signin",
    component: Signin,
  },
  {
    name: "Welcome",
    path: "/welcome",
    component: Welcome,
    meta: {
      requiresAuth: false,
    },
  },
  {
    name: "UserList",
    path: "/user-list",
    component: UserList,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: "MonitoringSoftware",
    path: "/monitoring-software",
    component: MonitoringSoftware,
    meta: {
      requiresAuth: true,
    },
  },
  /*   {
      name: "Signup",
      path: "/signup",
      component: Signup,
    },
    {
      name: "ForgotPassword",
      path: "/ForgotPassword",
      component: ForgotPassword,
      meta: {
        requiresAuth: false,
      },
    }, */

  {
    name: "Profile",
    path: "/profile",
    component: Profile,
    meta: {
      requiresAuth: true,
    },
  },

  /*  {
     name: "RecoverPassword",
     path: "/recoverPassword/:userId/:token",
     component: RecoverPassword,
     meta: {
       requiresAuth: false,
      },
    }, */
];

const router = new VueRouter({
  // mode: 'history',
  routes: routes,
});
const checkingSessions = (componentUrl) => {
  axios
    .get(Vue.config.baseUrl + "users/authentication", {
      withCredentials: true
    })
    .then((res) => {
      let currentUser = JSON.parse(localStorage.getItem("logViewer_currentUser"));
      if (res.data.status != 200) {
        localStorage.removeItem("logViewer_currentUser");
        location.reload();
      } else {
        if (currentUser.role === 'user') {
          if (!currentUser.accessList.logMon || componentUrl === 'UserList') {
            window.location.href = "/#/monitoring-software";
            if (componentUrl !== 'MonitoringSoftware') {
              Vue.$toast.open({
                message: "You don't have permission for this page(" + componentUrl + ").",
                type: "error",
              });
            }
          }
        }
      }
    })
    .catch((err) => console.log(err));
};

const checkAdminUser = () => {
  axios
    .get(Vue.config.baseUrl + "users/checkAdminUser", {
      withCredentials: true
    })
    .then((res) => {
      Vue.config.envConfig = res.data.envConfig;
      if (res.data.status != 200) {
        window.location.href = "/#/welcome";
      } else {
        window.location.href = "/#/signin";
      }
    })
    .catch((err) => console.log(err));
};

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (localStorage.getItem("logViewer_currentUser")) {
      checkingSessions(to.name);
      next();
    } else {
      next("/signin");
    }
  } else {
    if (localStorage.getItem("logViewer_currentUser")) {
      checkingSessions(to.name);
      next("/home");
    } else {
      checkAdminUser();
      next();
    }
  }
});

router.beforeResolve((to, from, next) => {
  if (to.name) {
    NProgress.start();
  }
  next();
});

router.afterEach(() => {
  NProgress.done();
});

new Vue({
  render: (h) => h(App),
  router,
}).$mount("#app");
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
// 引入全局样式
import "./assets/css/global.css";
// 引入axios库
import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1:8080/api/private/v1/";
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
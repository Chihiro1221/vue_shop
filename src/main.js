import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式
import './assets/css/global.css'
// 引入axios库
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8080/api/private/v1/'
// 设置请求拦截器
// 除了登录api之后，其他的api需要授权，必须在请求头中使用authrization提供token令牌
axios.interceptors.request.use((config) => {
  // 在发送的请求头中添加authrization属性携带token令牌
  config.headers.Authorization = sessionStorage.getItem('token')
  // 通行
  return config
})

//将axios接口对象存入全局$http中
Vue.prototype.$http = axios

Vue.config.productionTip = false
new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')

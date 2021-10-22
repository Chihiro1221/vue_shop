import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式
import './assets/css/global.css'
// 引入axios库
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 引入富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'
// 引入富文本编辑器组件样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 引入nprogress进度条样式
import 'nprogress/nprogress.css'
// 引入nprogress进度条
import NProgress from 'nprogress'

axios.defaults.baseURL = 'http://127.0.0.1:8080/api/private/v1/'
// 设置请求拦截器
// 除了登录api之后，其他的api需要授权，必须在请求头中使用authrization提供token令牌
axios.interceptors.request.use((config) => {
  // 在发送的请求头中添加authrization属性携带token令牌
  config.headers.Authorization = sessionStorage.getItem('token')
  // 启动nprogress进度条
  NProgress.start();
  // 通行
  return config
})

// 设置相应拦截器
axios.interceptors.response.use(config => {
  // 结束nprogress进度条
  NProgress.done()
  return config
});


// 在全局注册树形表格组件
Vue.component('tree-table', TreeTable)
// 在全局注册富文本编辑器组件
Vue.use(VueQuillEditor)

// 将axios接口对象存入全局$http中
Vue.prototype.$http = axios
// 时间过滤器
Vue.filter('dataFormat', (originValue) => {
  const data = new Date(originValue)
  const year = data.getFullYear()
  const month = (data.getMonth() + 1 + '').padStart(2, '0')
  const date = (data.getDate() + '').padStart(2, '0')
  const hours = (data.getHours() + '').padStart(2, '0')
  const minutes = (data.getMinutes() + '').padStart(2, '0')
  const second = (data.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${date} ${hours}:${minutes}:${second}`
})

Vue.config.productionTip = false
new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')

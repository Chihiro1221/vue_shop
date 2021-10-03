import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";

Vue.use(VueRouter);
const router = new VueRouter({
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: Login },
    { path: "/home", component: Home },
  ],
});
// 配置全局前置路由守卫，判断是否是前往的login页，是的话就直接放行，如果不是的话需要进行token的校验
router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next();
  const token = sessionStorage.getItem("token");
  if (!token) return next("/login");
  next();
});
export default router;

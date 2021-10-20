import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../pages/Login'
import Home from '../pages/Home'
import Welcome from '../pages/Welcome'
import Users from '../pages/user/Users'
import Rights from '../pages/power/Rights'
import Roles from '../pages/power/Roles'
import Category from '../pages/goods/Category'
import Params from '../pages/goods/Params'
import List from '../pages/goods/List'
import Add from '../pages/goods/Add'

Vue.use(VueRouter)
const router = new VueRouter({
  routes: [
    // redirect重定向
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    // 路由中显示另一个路由，在home组件中显示welcome组件,并且将路径定向到welcome
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      // 因为我们是在home路由中显示其他的路由所以路径要加 /
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Category },
        { path: '/params', component: Params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: Add },
      ],
    },
  ],
})
// 配置全局前置路由守卫，判断是否是前往的login页，是的话就直接放行，如果不是的话需要进行token的校验
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const token = sessionStorage.getItem('token')
  // 如果并不携带token令牌那么将强制转到login组件
  if (!token) return next('/login')
  // 当有令牌时放行
  next()
})
export default router

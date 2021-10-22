import Vue from 'vue'
import VueRouter from 'vue-router'

// 路由懒加载
const Login = () => import(/* webpackChunkName: "login-home-welcome" */ '../pages/Login')
const Home = () => import(/* webpackChunkName: "login-home-welcome" */ '../pages/Home')
const Welcome = () => import(/* webpackChunkName: "login-home-welcome" */ '../pages/Welcome')
const Users = () => import(/* webpackChunkName: "users-rights-roles" */ '../pages/user/Users')
const Rights = () => import(/* webpackChunkName: "users-rights-roles" */ '../pages/power/Rights')
const Roles = () => import(/* webpackChunkName: "users-rights-roles" */ '../pages/power/Roles')
const Category = () => import(/* webpackChunkName: "category-params" */ '../pages/goods/Category')
const Params = () => import(/* webpackChunkName: "category-params" */ '../pages/goods/Params')
const List = () => import(/* webpackChunkName: "list-add" */ '../pages/goods/List')
const Add = () => import(/* webpackChunkName: "list-add" */ '../pages/goods/Add')
const Order = () => import(/* webpackChunkName: "order-report" */ '../pages/order/Order')
const Report = () => import(/* webpackChunkName: "order-report" */ '../pages/report/Report')

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
        { path: '/orders', component: Order },
        { path: '/reports', component: Report },
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

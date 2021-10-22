<template>
  <el-container class="home-container">
    <!-- 头部模块 -->
    <el-header>
      <div class="logo_box">
        <img src="../assets/logo.png" alt="" width="50px" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体内容模块 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="collapseWidth">
        <!-- 侧边栏菜单项 -->
        <div class="collapseBtn" @click="isCollapse = !isCollapse">|||</div>
        <el-menu
          background-color="#34495e"
          text-color="#fff"
          active-text-color="#ffd04b"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="navActive"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 模板解析 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="icons[item.id]"></i>
              <!-- 文本内容 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <!-- 模板解析 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧展示内容模块 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  name: 'Home',
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // icon图标
      icons: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-promotion',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data',
      },
      // 是否折叠菜单
      isCollapse: false,
      // 导航激活状态
      navActive: null,
    }
  },
  computed: {
    // 根据是否是折叠状态修改aside的宽度
    collapseWidth() {
      return this.isCollapse ? '64px' : '200px'
    },
  },

  created() {
    // 当组件创建完成还未挂载时就请求后台获取到左侧菜单的数据
    this.getMenuList()
    // 将session中的导航激活状态赋值给data中的数据
    this.navActive = sessionStorage.getItem('activePath')
  },

  methods: {
    // 退出登录
    logout() {
      // 清除session中的token令牌
      sessionStorage.clear()
      // 重新退回到登录界面
      this.$router.push('/login')
      this.$message.success({ message: '已退出', showClose: true })
    },
    // 获得所有的菜单
    async getMenuList() {
      const { data: result } = await this.$http.get('menus')
      // 如果没有请求到就提示错误信息
      if (result.meta.status !== 200)
        return this.$message.error({
          message: result.meta.message,
          showClose: true,
        })
      // 请求回来数据之后存储到data中
      this.menulist = result.data
      console.log(result)
    },
    // 保存导航激活状态到session中
    saveNavState(activePath) {
      sessionStorage.setItem('activePath', activePath)
      // 将data中存储的状态修改为我们点击的路径
      this.navActive = activePath
    },
  },
}
</script>
<style scoped>
.el-header {
  background: #2c3e50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  color: white;
}

.logo_box {
  display: flex;
  align-items: center;
}

.logo_box > span {
  margin-left: 15px;
}

.el-aside {
  background: #34495e;
}

.el-main {
  background: #ecf0f1;
}

.home-container {
  height: 100%;
}

.el-menu {
  border: none;
}

.collapseBtn {
  font-size: 10px;
  color: white;
  line-height: 24px;
  text-align: center;
  background: #273c50;
  cursor: pointer;
  padding: 5px 0;
}
</style>

<template>
  <div id="Rights">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column align="center" label="#" type="index"></el-table-column>
        <el-table-column align="center" label="权限名称" prop="authName"></el-table-column>
        <el-table-column align="center" label="路径" prop="path"></el-table-column>
        <el-table-column align="center" label="权限等级" prop="level">
          <template slot-scope="{ row: { level } }">
            <el-tag v-if="level === '0'">一级</el-tag>
            <el-tag v-else-if="level === '1'" type="success">二级</el-tag>
            <el-tag v-else-if="level === '2'" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  data() {
    return {
      rightsList: [],
    }
  },
  created() {
    // 获取权限列表
    this.getRightsList()
  },
  methods: {
    // 获取权限
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '权限列表获取失败',
          showClose: true,
        })
      }
      // 将获取回来的权限列表存储到data
      this.rightsList = res.data
    },
  },
}
</script>

<style scoped></style>

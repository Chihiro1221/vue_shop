<template>
  <div id="list">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索和添加区域 -->
      <el-row :gutter="20">
        <!-- 搜索区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="searchGoods" clearable @change="searchGoodsContent">
            <el-button slot="append" icon="el-icon-search" @click="searchGoodsContent"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <!-- 索引行 -->
        <el-table-column align="center" type="index" label="#"></el-table-column>
        <el-table-column align="left" label="商品名称" prop="goods_name" width="600px"></el-table-column>
        <el-table-column align="center" label="商品价格（元）" prop="goods_price" width="90px"></el-table-column>
        <el-table-column align="center" label="商品重量" prop="goods_weight" width="90px"></el-table-column>
        <el-table-column align="center" label="创建时期" prop="add_time">
          <template slot-scope="{ row }"> {{ row.add_time | dataFormat }} </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="150px">
          <template slot-scope="{ row }">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoods(row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="requestGoodsParams.pagenum"
      :page-sizes="[2, 5, 10, 20]"
      :page-size="requestGoodsParams.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>
<script>
export default {
  name: 'List',
  data() {
    return {
      // 搜索商品内容
      searchGoods: '',
      // 表格数据
      goodsList: [],
      // 请求商品参数配置
      requestGoodsParams: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      // 总页数
      total: 0,
    }
  },
  created() {
    // 获取商品列表
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.requestGoodsParams })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '请求商品列表失败',
          showClose: true,
        })
      }
      console.log(res)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 当显示页数发生变化的时候
    handleSizeChange(newSize) {
      // 将改变之后的值重新复制给请求参数配置
      this.requestGoodsParams.pagesize = newSize
      // 重新请求商品列表
      this.getGoodsList()
    },
    // 修改当前显示的页数
    handleCurrentChange(newCurrentSize) {
      this.requestGoodsParams.pagenum = newCurrentSize
      this.getGoodsList()
    },
    // 搜索按钮
    searchGoodsContent() {
      // 将我们要查询的值存储到将要发送的请求中
      this.requestGoodsParams.query = this.searchGoods
      this.getGoodsList()
    },
    // 删除商品
    async removeGoods(row) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((error) => error)
      if (confirmResult != 'confirm') {
        return this.$message.info({
          message: '已取消删除',
          showClose: true,
        })
      }
      const { data: res } = await this.$http.delete(`goods/${row.goods_id}`)
      console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '删除商品失败',
          showClose: true,
        })
      }

      this.getGoodsList()
      this.$message.success({
        message: '删除商品成功',
        showClose: true,
      })
    },
    // 跳转到添加商品页面
    goAddPage() {
      this.$router.push('/goods/add')
    },
  },
}
</script>
<style scoped></style>

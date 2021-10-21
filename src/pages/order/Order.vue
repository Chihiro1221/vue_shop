<template>
  <div id="order">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入订单编号" v-model="searchOrder" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="searchOrderInfo"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderListData" border stripe>
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" align="center" width="300px"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" align="center"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款" align="center">
          <template slot-scope="{ row }">
            <el-tag effect="dark" v-if="row.pay_status == 1" size="mini">已付款</el-tag>
            <el-tag effect="dark" v-else size="mini" type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" align="center"></el-table-column>
        <el-table-column label="下单时间" align="center" width="200px">
          <template slot-scope="{ row }">
            {{ row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{ row }">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAddress"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="orderInfo.pagenum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="orderInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
      >
      </el-pagination>
      <!-- 修改地址对话框 -->
      <el-dialog :visible.sync="editAddressDialogVisible" title="修改地址" widht="50%" @close="editAddressdDialogClosed">
        <el-form :model="editAddressForm" :rules="editAddressRules" ref="editAddressRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader v-model="editAddressForm.address1" :options="staticCityData"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="editAddressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框底部 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editAddressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditAddressVisible">确 定</el-button>
        </span>
      </el-dialog>
      <!--物流信息对话框-->
      <el-dialog
          title="物流信息"
          :visible.sync="showProgressBox"
          width="50%">
        <!--timeline时间线-->
        <el-timeline :reverse="false">
          <el-timeline-item
              v-for="(progress  , index) in progressInfo"
              :key="index"
              :timestamp="progress.ftime">
            {{progress.context}}
          </el-timeline-item>
        </el-timeline>
        <!--对话框底部-->
        <span slot="footer" class="dialog-footer">
          <el-button @click="showProgressBox = false">取 消</el-button>
          <el-button type="primary" @click="showProgressBox = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
// 引入静态地址文件
import staticCityData from '../../assets/citydata'
export default {
  name: 'Order',
  data() {
    return {
      // 搜索框数据
      searchOrder: '',
      // 订单列表数据
      orderListData: [],
      // 订单列表默认参数
      orderInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      // 总页数
      total: 0,
      // 控制修改地址对话框的显示与隐藏
      editAddressDialogVisible: false,
      // 修改地址表单
      editAddressForm: {
        address1: [],
        address2: '',
      },
      // 修改地址表单验证规则
      editAddressRules: {
        address1: [{required: true, message: '请选择省市区县', trigger: 'blur'}],
        address2: [{required: true, message: '请填写详细地址', trigger: 'blur'}],
      },
      // 省市区数据
      cityData: [],
      // 控制显示物流信息对话框显示隐藏
      showProgressBox: false,
      // 存储物流信息数据
      progressInfo: [],
      // 静态地址信息
      staticCityData
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表数据
    async getOrderList() {
      const {data: res} = await this.$http.get('orders', {params: this.orderInfo})
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取订单列表失败',
          showClose: true,
        })
      }
      this.orderListData = res.data.goods
      this.total = res.data.total
      console.log(res)
    },
    // 显示页数发生改变时
    handleSizeChange(newPageSize) {
      this.orderInfo.pagesize = newPageSize
      this.getOrderList()
    },
    // 当前页数发生改变时
    handleCurrentChange(newCurrentNum) {
      this.orderInfo.pagenum = newCurrentNum
      this.getOrderList()
    },
    // 搜索商品
    searchOrderInfo() {
      this.orderInfo.query = this.searchOrder
      this.getOrderList()
    },
    // 显示修改地址对话框
    editAddress() {
      this.editAddressDialogVisible = true
    },
    // 修改地址对话框关闭指定的回调
    editAddressdDialogClosed() {
      this.$refs.editAddressRef.resetFields()
    },
    // 提交修改地址表单
    submitEditAddressVisible() {
      this.$refs.editAddressRef.validate(valid => {
        if (!valid) return
        this.editAddressDialogVisible = false
      })
    },
    // 显示物流信息对话框
    async showProgress() {
      const {data: res} = await this.$http.get(`kuaidi/1106975712662`)
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取物流信息失败',
          showClose: true
        })
      }
      this.progressInfo = res.data
      this.showProgressBox = true
      console.log(this.progressInfo)
    }
  },

}
</script>
<style scoped>
.el-cascader {
  width: 100%;
}
</style>

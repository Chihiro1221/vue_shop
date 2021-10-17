<template>
  <div id="params">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告框区域 -->
      <el-row>
        <el-col>
          <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon effect="dark" :closable="false"></el-alert>
        </el-col>
      </el-row>
      <!-- 级联选择器区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="cascaderValue" :options="goodsCategoryList" :props="cascaderProp" @change="GoodsHandleChange" clearable></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签页 -->
      <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加按钮 -->
          <el-button type="primary" size="mini" :disabled="isDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 表格区域 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="{ row }">
                <el-row class="table-tags">
                  <!-- 因为数据是一个字符串,所以我们需要转换为数组 -->
                  <el-tag v-for="(tag, i) in row.attr_vals" :key="i" closable @close="handlerTabClosed(row, i)">
                    {{ tag }}
                  </el-tag>
                  <!-- 添加按钮输入框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="row.inputVisible"
                    v-model="row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @blur="handleInputConfirm(row)"
                    @keyup.enter.native="$event.target.blur()"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ New Tag</el-button>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="{ row }">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(row)">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeEditDialog(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加按钮 -->
          <el-button type="primary" size="mini" :disabled="isDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 表格区域 -->
          <el-table :data="onlyTableData" border stripe v-show="!isDisabled">
            <el-table-column type="expand">
              <template slot-scope="{ row }">
                <el-row class="table-tags">
                  <!-- 标签 -->
                  <el-tag v-for="(tag, i) in row.attr_vals" :key="i" closable @close="handlerTabClosed(row, i)">
                    {{ tag }}
                  </el-tag>
                  <!-- 添加按钮输入框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="row.inputVisible"
                    v-model="row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="$event.target.blur()"
                    @blur="handleInputConfirm(row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ New Tag</el-button>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="{ row }">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(row)">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeEditDialog(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :visible.sync="addDialogVisible" :title="'添加' + addDialogTitle" @close="addDialogVisibleClosed">
      <!-- 表单区域 -->
      <el-form :model="addDialogForm" :rules="addDialogRules" ref="addDialogRef" label-width="100px">
        <el-form-item :label="addDialogTitle" prop="attr_name">
          <el-input v-model="addDialogForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮 -->
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddData">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :visible.sync="editDialogVisible" :title="'修改' + addDialogTitle" @close="editDialogVisibleClosed">
      <!-- 表单区域 -->
      <el-form :model="editDialogForm" :rules="editDialogRules" ref="editDialogRef" label-width="100px">
        <el-form-item :label="addDialogTitle" prop="attr_name">
          <el-input v-model="editDialogForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮 -->
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'Params',
  data() {
    return {
      // 商品分类列表
      goodsCategoryList: [],
      // 级联选择框收集到的值
      cascaderValue: [],
      // 级联选择框配置信息
      cascaderProp: { value: 'cat_id', label: 'cat_name', children: 'children' },
      // tabs绑定值，选项卡的name值
      activeName: 'many',
      // 动态表格数据
      manyTableData: [],
      // 静态表格数据
      onlyTableData: [],
      // 添加参数对话框的显示与隐藏
      addDialogVisible: false,
      // 添加对话框表格存储信息
      addDialogForm: {
        attr_name: '',
      },
      // 添加对话框表单验证规则
      addDialogRules: {
        attr_name: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
      },
      // 修改参数对话框的显示与隐藏
      editDialogVisible: false,
      // 修改对话框表单存储信息
      editDialogForm: {
        attr_name: '',
      },
      // 修改对话框表单验证规则
      editDialogRules: {
        attr_name: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
      },
      // 当前编辑的参数信息
      currentEditParams: {},
    }
  },
  computed: {
    // 判断是否选择三级菜单
    isDisabled() {
      // 如果选择器收集到的值长度不等于3就不是三级菜单，那么就返回true禁用掉按钮
      if (this.cascaderValue.length !== 3) return true
      return false
    },
    // 获得选择的三级菜单的id
    categoryId() {
      if (this.cascaderValue.length === 3) return this.cascaderValue[this.cascaderValue.length - 1]
      return null
    },
    // 动态指定添加参数标题
    addDialogTitle() {
      return this.activeName == 'many' ? '动态参数' : '静态属性'
    },
  },
  created() {
    this.getGoodsCategoryList()
  },
  methods: {
    // 获取商品分类列表
    async getGoodsCategoryList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取商品分类列表失败',
          showClose: true,
        })
      }
      this.goodsCategoryList = res.data
    },
    // 当级联选择框发生变化的时候
    GoodsHandleChange() {
      this.getParamsData()
    },
    // 当标签页切换之后触发的事件
    handleTabsClick() {
      // 重新获取数据
      this.getParamsData()
    },
    // 获取参数请求
    async getParamsData() {
      // 如果修改之后的菜单不是选中的三级菜单那么就重置为空
      if (this.cascaderValue.length != 3) {
        this.cascaderValue = []
        // 之前三级菜单的参数也需要清空
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 代表选择了三级菜单
      const { data: res } = await this.$http.get(`categories/${this.categoryId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取参数列表失败',
          showClose: true,
        })
      }

      res.data.map((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      // 因为我们是两个表格但是只有一个数据所以需要进行判断
      if (this.activeName === 'many') this.manyTableData = res.data
      if (this.activeName === 'only') this.onlyTableData = res.data
    },
    // 提交添加参数预验证
    submitAddData() {
      this.$refs.addDialogRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.categoryId}/attributes`, {
          attr_name: this.addDialogForm.attr_name,
          attr_sel: this.activeName,
        })
        if (res.meta.status !== 201) {
          return this.$message.error({
            message: '创建参数失败',
            showClose: true,
          })
        }
        // 关闭对话框
        this.addDialogVisible = false
        // 提示成功信息
        this.$message.success({
          message: '创建参数成功',
          showClose: true,
        })
        // 重新获取参数列表
        this.getParamsData()
      })
    },
    // 当添加参数对话框关闭指定的回调
    addDialogVisibleClosed() {
      this.$refs.addDialogRef.resetFields()
    },
    // 编辑参数对话框显示
    showEditDialog(row) {
      // 将当前这一行的数据存储到data中
      this.currentEditParams = row
      this.editDialogForm.attr_name = row.attr_name
      this.editDialogVisible = true
    },
    // 编辑参数对话框关闭
    editDialogVisibleClosed() {
      this.$refs.editDialogRef.resetFields()
    },
    // 提交修改参数数据
    submitEditData() {
      this.$refs.editDialogRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.currentEditParams.cat_id}/attributes/${this.currentEditParams.attr_id}`, {
          attr_name: this.editDialogForm.attr_name,
          attr_sel: this.activeName,
        })
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '修改参数失败',
            showClose: true,
          })
        }
        this.getParamsData()
        this.$message.success({
          message: '修改参数成功',
          showClose: true,
        })
        this.editDialogVisible = false
      })
    },

    // 删除参数
    async removeEditDialog(row) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((error) => error)

      if (confirmResult !== 'confirm') {
        return this.$message.info({
          message: '已取消删除操作',
          showClose: true,
        })
      }
      const { data: res } = await this.$http.delete(`categories/${row.cat_id}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '删除参数失败',
          showClose: true,
        })
      }
      this.getParamsData()
      this.$message.success({
        message: '已删除该参数',
        showClose: true,
      })
    },
    // 提交编辑标签内容
    async handleInputConfirm(row) {
      // 如果添加的新标签是空的,那么就重置为空不进行添加
      if (!row.inputValue.trim()) {
        this.$nextTick((_) => (row.inputValue = ''))
        row.inputVisible = false
        return
      }
      // 每一行都对应一个控制显示隐藏和存储数据(因为我们有多行不能使用同一个)
      row.attr_vals.push(row.inputValue.trim())
      const { data: res } = await this.$http.put(`categories/${this.categoryId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(','),
      })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '修改参数项失败',
          showClose: true,
        })
      }
      this.$message.success({
        message: '修改参数项成功',
        showClose: true,
      })
      // 隐藏按钮
      row.inputVisible = false
      // 将input输入框重置为空
      this.$nextTick((_) => (row.inputValue = ''))
    },
    // 编辑标签按钮点击事件
    showInput(row) {
      row.inputVisible = true
      // 当切换到input输入框之后我们需要在下一次dom更新的时候去自动的获取input的焦点
      this.$nextTick((_) => this.$refs.saveTagInput.$refs.input.focus())
    },
    // 移除标签
    async handlerTabClosed(row, i) {
      // 删除本地对应一行其中的数据
      row.attr_vals.splice(i, 1)
      // 更新远程数据库的数据
      const { data: res } = await this.$http.put(`categories/${this.categoryId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(','),
      })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '删除参数项失败',
          showClose: true,
        })
      }
      return this.$message.success({
        message: '删除参数项成功',
        showClose: true,
      })
    },
  },
}
</script>
<style scoped>
.el-alert {
  margin-bottom: 15px;
}
.el-tabs {
  margin-top: 15px;
}
.table-tags {
  margin: 15px 20px;
}
.input-new-tag {
  width: 120px;
}
</style>

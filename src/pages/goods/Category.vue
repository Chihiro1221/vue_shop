<template>
  <div id="category">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCategory">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类列表表格 -->
      <tree-table
        :data="goodsCategoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
        class="tree-table"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="{ row }">
          <i class="el-icon-success" style="color: #2ecc71" v-if="!row.cat_deleted"></i>
          <i class="el-icon-error" style="color: #e74c3c" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="{ row }">
          <el-tag effect="dark" size="mini" v-if="row.cat_level == 0">一级</el-tag>
          <el-tag effect="dark" type="success" size="mini" v-else-if="row.cat_level === 1">二级</el-tag>
          <el-tag effect="dark" type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operator" slot-scope="{ row }">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCategory(row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCategory(row.cat_id)">删除</el-button>
        </template>
      </tree-table>
    </el-card>
    <!-- 编辑分类名称对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCategoryDialogVisible" width="50%" @close="editCategoryDialogClosed">
      <el-form :model="editCategoryForm" :rules="editCategoryRules" ref="editCategoryRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCategoryForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!--对话框底部按钮-->
      <span slot="footer">
        <el-button @click="editCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditCategory">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加商品分类对话框 -->
    <el-dialog title="添加商品分类" :visible.sync="addGoodsCategory" width="50%" @close="addCategoryDialogClosed">
      <el-form :model="addCategoryForm" :rules="addCategoryRules" ref="addCategoryRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCategoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="cascaderValue"
            :options="selectCascader"
            ref="cascaderRef"
            clearable
            :props="cascaderProps"
            @change="cascaderChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 对话框底部按钮 -->
      <span slot="footer">
        <el-button @click="addGoodsCategory = false">取 消</el-button>
        <el-button type="primary" @click="submitCategory">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="categoryInfo.pagenum"
      :page-sizes="[2, 5, 10, 20]"
      :page-size="categoryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="goodsCategoryTotal"
    >
    </el-pagination>
  </div>
</template>
<script>
export default {
  name: 'Category',
  data() {
    return {
      // 商品分类列表请求参数
      categoryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 存储商品分类
      goodsCategoryList: [],
      // 商品分类总条数
      goodsCategoryTotal: 0,
      // 表格列的参数
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        // type表示当前定义为模板列
        { label: '是否有效', type: 'template', template: 'isOk' },
        // template表示这一列使用的模板名称
        { label: '排序', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'operator' },
      ],
      // 控制编辑分类对话框显示隐藏
      editCategoryDialogVisible: false,
      // 编辑分类信息表单
      editCategoryForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0,
      },
      // 编辑分类表单规则
      editCategoryRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
      },
      // 编辑分类对应的分类id
      editCategoryId: 0,
      // 控制添加分类对话框显示隐藏
      addGoodsCategory: false,
      // 添加分类对话框
      addCategoryForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0,
      },
      // 添加分类表单验证规则
      addCategoryRules: {
        cat_name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
      },
      // 级联选择器绑定值
      cascaderValue: [],
      // 存储props配置项
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        checkStrictly: true,
      },
      // 获得select选择框数据
      selectCascader: [],
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    // 获取商品分类列表
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories', { params: this.categoryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取商品分类列表失败',
          showClose: true,
        })
      }
      // 将商品分类列表存储到data中
      this.goodsCategoryList = res.data.result
      // 将商品分类总条数存储到total中
      this.goodsCategoryTotal = res.data.total
    },
    // 编辑角色
    editCategory(row) {
      // 将点击对应的那一行的信息传递过来,cat_name复制给表单默认的数据
      this.editCategoryForm.cat_name = row.cat_name
      this.editCategoryId = row.cat_id
      // 显示对话框
      this.editCategoryDialogVisible = true
    },
    // 编辑分类信息之后提交事件
    submitEditCategory() {
      // 提交表单预验证
      this.$refs.editCategoryRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editCategoryId}`, { cat_name: this.editCategoryForm.cat_name })
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '修改分类失败',
            showClose: true,
          })
        }
        // 重新获取分类列表
        this.getCategoryList()
        // 提示成功信息
        this.$message.success({
          message: '更新商品分类成功',
          showClose: true,
        })
        // 关闭对话框
        this.editCategoryDialogVisible = false
      })
    },
    // 当对话框关闭
    editCategoryDialogClosed() {
      // 重置表单数据
      this.$refs.editCategoryRef.resetFields()
    },
    // 删除分类
    async removeCategory(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((error) => error)

      if (confirmResult != 'confirm') {
        return this.$message.info({
          message: '您已取消操作',
          showClose: true,
        })
      }

      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '删除该分类失败',
          showClose: true,
        })
      }
      this.getCategoryList()
      this.$message.success({
        message: '已删除该分类',
        showClose: true,
      })
    },
    // 添加用户对话框
    async showAddCategory() {
      const { data: res } = await this.$http.get(`categories`, { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取父级分类列表失败',
          showClose: true,
        })
      }
      console.log(res.data)
      this.selectCascader = res.data
      this.addGoodsCategory = true
    },
    // 改变显示页数
    handleSizeChange(newSize) {
      this.categoryInfo.pagesize = newSize
      // 重新获取分类列表
      this.getCategoryList()
    },
    // 改变当前页数
    handleCurrentChange(newCurrentNum) {
      this.categoryInfo.pagenum = newCurrentNum
      // 重新获取分类列表
      this.getCategoryList()
    },
    // 关闭添加用户对话框重置表单验证
    addCategoryDialogClosed() {
      this.$refs.addCategoryRef.resetFields()
      this.cascaderValue = []
      this.addCategoryForm.cat_pid = 0
      this.addCategoryForm.cat_level = 0
    },
    // 当级联选择框改变的时候
    cascaderChange(value) {
      //若改变之后的值合集长度大于0那么就代表选择了父级
      if (value.length > 0) {
        // 将父级id存储到要发送的请求数据中
        this.addCategoryForm.cat_pid = value[value.length - 1]
        this.addCategoryForm.cat_level = value.length
        return
      }
      this.addCategoryForm.cat_pid = 0
      this.addCategoryForm.cat_level = 0
    },
    // 添加分类提交按钮
    submitCategory() {
      this.$refs.addCategoryRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCategoryForm)
        if (res.meta.status !== 201) {
          return this.$message.error({
            message: '添加分类失败',
            showClose: true,
          })
        }
        this.$message.success({
          message: '添加分类成功',
          showClose: true,
        })
        this.getCategoryList()
        this.addGoodsCategory = false
      })
    },
  },
}
</script>
<style scoped>
.el-cascader {
  width: 100%;
}
</style>

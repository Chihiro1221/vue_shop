<template>
  <div id="Add">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加商品警告框 -->
      <el-row>
        <el-alert title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>
      </el-row>
      <!-- 进度条模块 -->
      <el-row>
        <el-steps :active="activeStep * 1" finish-status="success" align-center :space="200">
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
      </el-row>
      <!-- 选项卡模块 -->
      <el-row>
        <el-form :model="addGoodsInfoForm" :rules="addGoodsInfoRules" ref="addGoodsInfoRef" :label-position="labelPosition" label-width="100px">
          <el-tabs :tab-position="tabPosition" v-model="activeStep" :before-leave="beforeTabLeave" @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="addGoodsInfoForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addGoodsInfoForm.goods_price"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addGoodsInfoForm.goods_weight"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addGoodsInfoForm.goods_number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_category">
                <el-cascader
                  v-model="addGoodsInfoForm.goods_cat"
                  :options="goodsCategoryList"
                  :props="cascaderProps"
                  @change="handleChange"
                ></el-cascader>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox :label="item2" v-for="item2 in item.attr_vals" border></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <!-- action表示要上传的后台api接口 -->
              <el-upload
                :action="uploadURL"
                list-type="picture"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                :headers="headersObj"
                :on-success="handlerSuccess"
              >
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
              <!-- 预览图片对话框 -->
              <el-dialog :visible.sync="previweImgDialogVisible">
                <img width="100%" :src="dialogImageUrl" alt="" />
              </el-dialog>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <!-- 富文本编辑器组件 -->
              <quill-editor v-model="addGoodsInfoForm.goods_introduce"></quill-editor>
              <!-- 添加商品按钮 -->
              <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-row>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'Add',
  data() {
    // 自定义校验规则
    let checkPrice = (rule, value, callback) => (/^[0-9]+(\.[0-9]{1,3})?$/.test(value) ? callback() : callback(new Error()))
    let checkNumber = (rule, value, callback) => (/^[0-9]*$/.test(value) ? callback() : callback(new Error()))
    let checkCascader = (rule, value, callback) => {
      if (this.addGoodsInfoForm.goods_cat.length !== 3) {
        this.addGoodsInfoForm.goods_cat = []
        this.$message.warning({
          message: '只能选择三级商品分类',
          showClose: true,
        })
        return callback()
      }
      callback()
    }
    return {
      // 控制进度条的index
      activeStep: '0',
      // 控制标签页的位置
      tabPosition: 'left',
      // 存储要添加的商品参数表单
      addGoodsInfoForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 上传图片存储的临时路径
        pics: [],
        // 富文本编辑器内容
        goods_introduce: '',
        // 商品的所有参数
        attrs: [],
      },
      // 存储要添加商品表单的验证规则
      addGoodsInfoRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 20, message: '商品名称在2~20位之间', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: checkPrice, message: '商品价格必须是大于0的整数或小数', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { validator: checkPrice, message: '商品重量必须是大于0的整数或小数', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { validator: checkNumber, message: '商品数量必须是大于0的整数', trigger: 'blur' },
        ],
        goods_category: [{ validator: checkCascader, trigger: 'change' }],
      },
      // 控制表单label文字的位置
      labelPosition: 'top',
      // 商品分类列表
      goodsCategoryList: [],
      // 级联选择器配置信息
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 存储动态参数数据
      manyTableData: [],
      // 存储静态属性数据
      onlyTableData: [],
      // 上传图片请求的后台地址
      uploadURL: 'http://127.0.0.1:8080/api/private/v1/upload',
      // 预览图片对话框显示隐藏
      previweImgDialogVisible: false,
      // 预览图片url地址
      dialogImageUrl: '',
      // 上传图片的请求头对象
      headersObj: {
        Authorization: sessionStorage.getItem('token'),
      },
    }
  },
  computed: {
    cateId() {
      return this.addGoodsInfoForm.goods_cat[2]
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
    // tabs切换时进行拦截
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addGoodsInfoForm.goods_cat.length != 3) {
        this.$message.error({
          message: '请先选择商品分类',
          showClose: true,
        })
        return false
      }
    },
    // 级联选择器改变时触发
    handleChange(newValue) {},
    // 当tabs切换完成之后执行的回调
    async tabClicked() {
      if (this.activeStep === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '获取动态参数失败',
            showClose: true,
          })
        }
        res.data.forEach((item) => (item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : null))
        this.manyTableData = res.data
      } else if (this.activeStep === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '获取静态属性失败',
            showClose: true,
          })
        }
        // res.data.forEach((item) => (item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : null))
        this.onlyTableData = res.data
      }
    },
    // 上传图片预览效果
    handlePictureCardPreview(file) {
      console.log(file)

      this.dialogImageUrl = file.url
      this.previweImgDialogVisible = true
    },
    // 移除图片事件
    handleRemove(file) {
      // 将删除文件的信息从数组中删除掉
      this.addGoodsInfoForm.pics = this.addGoodsInfoForm.pics.filter((item) => item.pic != file.response.data.tmp_path)
    },
    // 上传图片成功之后的回调
    handlerSuccess(response) {
      // 将临时路径修改为对象存储起来
      const picInfo = { pic: response.data.tmp_path }
      this.addGoodsInfoForm.pics.push(picInfo)
    },
    // 提交添加商品
    add() {
      this.$refs.addGoodsInfoRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error({
            message: '请填写必要的表单项',
            showClose: true,
          })
        }
        const query = { ...this.addGoodsInfoForm }
        // 商品分类需要以字符串的形式逗号隔开请求，所以我们要进行转换
        query.goods_cat = query.goods_cat.join(',')
        //处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(','),
          }
          query.attrs.push(newInfo)
        })
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          query.attrs.push(newInfo)
        })
        const { data: res } = await this.$http.post('goods', query)
        console.log(res)

        if (res.meta.status !== 201) {
          return this.$message.error({
            message: res.meta.msg,
            showClose: true,
          })
        }
        this.$message.success({
          message: '添加商品成功',
          showClose: true,
        })
        this.$router.push('/goods')
      })
    },
  },
}
</script>
<style scoped>
.addBtn {
  margin-top: 15px;
}
</style>

<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 搜索和添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="userParams.query" @change="getUserList" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column align="center" label="#" type="index"></el-table-column>
        <el-table-column align="center" label="姓名" prop="username"></el-table-column>
        <el-table-column align="center" label="邮箱" prop="email"></el-table-column>
        <el-table-column align="center" label="电话" prop="mobile"></el-table-column>
        <el-table-column align="center" label="角色" prop="role_name"></el-table-column>
        <el-table-column align="center" label="状态">
          <!-- switch状态按钮(使用作用域插槽接收到子组件中传递过来的这一行的数据) -->
          <template slot-scope="{ row }">
            <el-switch v-model="row.mg_state" @change="userStateChanged(row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <!-- 操作按钮配置 -->
          <template slot-scope="{ row }">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserById(row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click='setRole(row)'></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="userParams.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="userParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 添加用户的对话框 -->
      <el-dialog title="添加用户" :visible.sync="showAddDialogVisible" width="40%" @close="dialogClose">

        <!-- 对话框内容区 -->
        <el-form :model="addForm" :rules="addFormRules" ref="FormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" type="passowrd" prop="password">
            <el-input type="password" v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <!-- 对话框底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="showAddDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户的对话框 -->
      <el-dialog title="修改用户信息" :visible.sync="showEditDialogVisible" width="40%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="showEditDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配角色对话框 -->
      <el-dialog title="分配角色" :visible.sync="showSetRoleDialogVisible" width="40%" @close="setRoleDialogClosed">
        <h3>当前的用户：{{ roleInfo.username }}</h3>
        <h3>当前的角色：{{ roleInfo.role_name }}</h3>
        <el-select v-model="roleSelected" clearable placeholder="请选择">
          <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
          </el-option>
        </el-select>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showSetRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitSetRole">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
  export default {
    name: 'Users',
    data() {
      // 定义自定义校验规则
      const checkEmail = (rule, value, callback) => {
        // 定义验证邮箱的正则
        const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        if (regEmail.test(value)) {
          return callback()
        }

        callback(new Error('邮箱格式不正确'))
      }
      // 定义自定义校验规则
      const checkMobile = (rule, value, callback) => {
        // 定义验证手机号的正则
        const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
        if (regMobile.test(value)) {
          return callback()
        }

        callback(new Error('手机号格式不正确'))
      }

      return {
        // 获取用户列表参数
        userParams: {
          query: '',
          pagenum: 1,
          pagesize: 10,
        },
        // 存储获取的用户列表
        userlist: [],
        // 存储一共有几个用户数据
        total: 0,
        // 控制添加用户对话框显示隐藏
        showAddDialogVisible: false,
        // 添加用户参数
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: '',
        },
        // 添加用户表单验证规则
        addFormRules: {
          // 用户名验证规则
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            {
              min: 3,
              max: 10,
              message: '用户名长度在3~10位字符之间',
              trigger: 'blur',
            },
          ],
          // 密码验证规则
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            {
              min: 6,
              max: 12,
              message: '密码长度在6~12位字符之间',
              trigger: 'blur',
            },
          ],
          // 邮箱验证规则
          email: [
            { required: true, message: '请输入邮箱' },
            {
              validator: checkEmail,
              trigger: 'blur'
            }
          ],
          // 电话号验证规则
          mobile: [
            { required: true, message: '请输入电话号', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur', },
          ],
        },
        // 控制编辑用户对话框显示隐藏
        showEditDialogVisible: false,
        // 查询到的用户信息对象
        editForm: {},
        // 编辑用户表单验证规则
        editFormRules: {
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, message: '邮箱不符合规则', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入电话', trigger: 'blur' },
            { validator: checkMobile, message: '电话不符合规则', trigger: 'blur' }
          ],
        },
        // 控制分配角色对话框显示隐藏
        showSetRoleDialogVisible: false,
        // 要分配角色的信息
        roleInfo: {},
        //存储修改的角色id
        roleSelected: '',
        // 角色列表
        roleList: []
      }
    },
    methods: {
      // 获取用户列表
      async getUserList() {
        // 将await接手过来的数据结果赋值给res
        const { data: res } = await this.$http.get('users', { params: this.userParams })
        // 当数据获取失败的时候提示错误信息
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '用户列表请求失败',
            showClose: true,
          })
        }

        // 将获取过来的用户数据存储到data静态数据中
        this.userlist = res.data.users
        this.total = res.data.total
      },

      // 当pagesize改变的时候触发的事件
      handleSizeChange(newSize) {
        // 获取到改变的数据然后将我们存储在data中将要发送给后台的数据修改
        this.userParams.pagesize = newSize
        // 重新请求一次后台将新的参数传递过去
        this.getUserList()
      },

      // 当page页数发生变化的时候触发的事件
      handleCurrentChange(newPage) {
        // 当页数修改之后的值赋值给data中将要传递给后台的参数
        this.userParams.pagenum = newPage
        // 当数据修改之后重新请求后台渲染页面
        this.getUserList()
      },

      // switch改变时触发的事件
      async userStateChanged(userinfo) {
        // 发送修改状态的请求
        const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        // 根据请求返回的状态码进行拦截
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '用户状态更新失败',
            showClose: true,
          })
        }
        // 如果修改成功的话就提示信息
        this.$message.success({
          message: '用户状态更新成功',
          showClose: true,
        })
      },
      // 当添加用户对话框关闭的时候触发的事件
      dialogClose() {
        // 找到表单组件的vc然后调用其身上的resetFields方法重置表单
        this.$refs.FormRef.resetFields()
      },
      // 添加用户
      addUser() {
        this.$refs.FormRef.validate(async valid => {
          // 初验证
          if (!valid) return
          const { data: res } = await this.$http.post('users', this.addForm)

          if (res.meta.status === 400) {
            return this.$message.error({
              message: '用户名已存在',
              showClose: true
            })
          }

          if (res.meta.status !== 201) {
            return this.$message.error({
              message: '添加用户失败',
              showClose: true
            })
          }

          this.$message.success({
            message: '添加用户成功',
            showClose: true
          })
          // 将对话框隐藏掉
          this.showAddDialogVisible = false;
          // 重新获取一下用户数据
          this.getUserList()
        })
      },
      // 点击编辑按钮触发的事件
      async showEditDialog(id) {
        const { data: res } = await this.$http.get(`users/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '查询用户失败',
            showClose: true
          })
        }
        this.editForm = res.data
        this.showEditDialogVisible = true
      },
      // 当edit对话框管理之后触发的事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 修改用户信息并提交
      async editUserInfo() {
        // 提交之前预验证
        this.$refs.editFormRef.validate(valid => {
          if (!valid) return
        })
        // 发送put请求，携带需要我们提供的信息
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
          id: this.editForm.id,
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: "更新用户信息失败",
            showClose: true
          })
        }
        // 关闭用户信息修改对话框
        this.showEditDialogVisible = false
        // 重新获取一下用户列表然后自动渲染
        this.getUserList()
        this.$message.success({
          message: '更新用户信息成功',
          showClose: true
        })
      },
      // 根据id删除用户
      async deleteUserById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          distinguishCancelAndClose: true
        }).catch(error => error)
        // 如果返回值不是confirm就提示取消信息
        if (confirmResult !== 'confirm') {
          return this.$message.info({
            message: '已取消删除',
            showClose: true
          })
        }

        // 发送删除用户请求
        const { data: res } = await this.$http.delete(`users/${id}`)
        // 不允许删除admin账户
        if (res.meta.status === 400) {
          return this.$message.error({
            message: res.meta.msg,
            showClose: true
          })
        }
        // 提示删除成功信息
        this.$message.success({
          message: '已删除用户',
          showClose: true
        })
        // 重新获取一下用户列表然后自动渲染
        this.getUserList()
      },
      // 设置用户的角色
      async setRole(roleInfo) {
        this.showSetRoleDialogVisible = true
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: "获取角色列表失败",
            showClose: trueS
          })
        }

        this.roleList = res.data
        // 将要分配角色的角色数据存储到data中
        this.roleInfo = roleInfo
      },
      // 提交给用户设置的角色
      async submitSetRole() {
        const { data: res } = await this.$http.put(`users/${this.roleInfo.id}/role`, {
          rid: this.roleSelected
        })
        if (res.meta.status === 400) {
          return this.$message.error({
            message: res.meta.msg,
            showClose: true
          })
        }
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '修改角色失败',
            showClose: true
          })
        }
        this.getUserList()
        this.showSetRoleDialogVisible = false
        this.$message.success({
          message: "修改角色成功",
          showClose: true
        })
      },
      // 当分配角色对话框关闭时执行的函数
      setRoleDialogClosed() {
        this.roleSelected = ''
        this.roleList = []
      }

    },

    created() {
      // 当页面数据创建好之后调用请求后台数据的方法
      this.getUserList()
    },
  }
</script>
<style scoped></style>
<template>
  <div id="roles">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!--角色列表区域-->
      <el-table :data="rolesList" border stripe>
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="{ row }">
            <!--遍历出每个一级权限对应的所有行-->
            <el-row v-for="(item1, i1) in row.children" :key="item1.id" :class="['tb-row', i1 == 0 ? 'td-row' : '', 'verticalCenter', 'tagBox']">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag closable type="primary" @close="removeRightById(row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级权限-->
              <el-col :span="19">
                <!--通过for循环嵌套渲染二级权限-->
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'td-row', 'verticalCenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!--单独的一行-->
                    <el-row>
                      <!--通过for循环嵌套渲染三级权限-->
                      <el-tag
                        closable
                        v-for="(item3, i3) in item2.children"
                        type="warning"
                        :key="item3.id"
                        :span="3"
                        @close="removeRightById(row, item3.id)"
                      >
                        {{ item3.authName }}
                      </el-tag>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引行-->
        <el-table-column type="index" align="center" label="#"></el-table-column>
        <el-table-column label="角色名称" align="center" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" align="center" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="{ row }">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRoleInfo(row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRole(row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-s-tools" size="mini" @click="setRights(row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--修改角色对话框-->
      <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="40%" @close="editDialogClosed">
        <!--修改角色表单区域-->
        <el-form :model="roleInfo" :rules="roleInfoRules" ref="roleInfoRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="roleInfo.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="roleInfo.roleDesc"></el-input>
          </el-form-item>
        </el-form>

        <!--对话框底部按钮-->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!--添加角色对话框-->
      <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="40%" @close="addRoleDialogClosed">
        <el-form :model="addRoleInfo" :rules="addRoleInfoRules" ref="addRoleInfoRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleInfo.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleInfo.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!--对话框底部按钮-->
        <span slot="footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAddRoleForm">确 定</el-button>
        </span>
      </el-dialog>
      <!--分配角色对话框-->
      <el-dialog title="分配权限" :visible.sync="setRightsDialogVisible" width="40%" @close="setRightsDialogClosed">
        <!--树形控件-->
        <el-tree
          :data="treeRightsList"
          :props="rightsProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defaultChecked"
          ref="treeRightsRef"
        ></el-tree>
        <!--对话框底部按钮-->
        <span slot="footer">
          <el-button @click="setRightsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRigthsSubmit">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 控制修改角色对话框显示隐藏
      editRoleDialogVisible: false,
      // 修改用户的信息
      roleInfo: {},
      // 修改用户信息表单验证规则
      roleInfoRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '角色名称在2~8位之间', trigger: 'blur' },
        ],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
      },
      // 控制添加用户对话框显示隐藏
      addRoleDialogVisible: false,
      // 存储添加角色信息
      addRoleInfo: {
        roleName: '',
        roleDesc: '',
      },
      // 添加用户信息表单验证规则
      addRoleInfoRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '用户名在2~8个字符之间', trigger: 'blur' },
        ],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
      },
      // 控制分配权限对话框
      setRightsDialogVisible: false,
      // 存储树形权限列表
      treeRightsList: [],
      //属性控件的属性绑定对象
      rightsProps: {
        children: 'children',
        label: 'authName',
      },
      // 树形控件默认选中
      defaultChecked: [],
      // 存储要修改的角色id
      setRoleId: '',
    }
  },
  created() {
    // 获取用户列表
    this.getRolesList()
  },
  methods: {
    // 请求用户列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取用户列表失败',
          showClose: true,
        })
      }

      this.rolesList = res.data
    },
    // 编辑用户信息
    async editRoleInfo(row) {
      // 将要修改的这一行的数据存储到data中
      this.roleInfo = row
      // 显示修改用户对话框
      this.editRoleDialogVisible = true
    },
    // 提交编辑用户请求
    submitEditRoleInfo() {
      // 调用预验证
      this.$refs.roleInfoRef.validate(async (valid) => {
        // 预验证失败则拦截
        if (!valid) return
        // 发送修改用户请求
        const { data: res } = await this.$http.put(`roles/${this.roleInfo.id}`, {
          roleName: this.roleInfo.roleName,
          roleDesc: this.roleInfo.roleDesc,
        })
        if (res.meta.status !== 200) {
          return this.$message.error({
            message: '获取用户信息失败',
            showClose: true,
          })
        }
        // 隐藏修改用户对话框
        this.editRoleDialogVisible = false
        // 重新获取数据
        this.getRolesList()
        // 提示修改成功信息
        this.$message.success({
          message: '修改用户信息成功',
          showClose: true,
        })
      })
    },
    // 对话框关闭之后重置表单
    editDialogClosed() {
      this.$refs.roleInfoRef.resetFields()
    },
    // 删除角色
    async removeRole(id) {
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '删除角色失败',
          showClose: true,
        })
      }
      // 删除角色之后重新获取角色列表
      this.getRolesList()
      // 提示成功信息
      this.$message.success({
        message: '删除角色成功',
        showClose: true,
      })
    },
    // 对话框关闭之后重置表单
    addRoleDialogClosed() {
      this.$refs.addRoleInfoRef.resetFields()
    },
    // 预处理与添加用户
    submitAddRoleForm() {
      this.$refs.addRoleInfoRef.validate(async (valid) => {
        // 拦截验证
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleInfo)
        // 错误拦截
        if (res.meta.status !== 201) {
          return this.$message.error({
            message: '添加用户失败',
            showClose: true,
          })
        }
        // 将添加角色对话框隐藏
        this.addRoleDialogVisible = false
        // 重新获取角色列表
        this.getRolesList()
        // 提示成功信息
        this.$message.success({
          message: '添加用户成功',
          showClose: true,
        })
      })
    },
    // 根据id删除权限
    async removeRightById(roleId, rightId) {
      const confirmResult = await this.$confirm('此操作将删除选择权限, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete(`roles/${roleId.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '删除角色权限失败',
          showClose: true,
        })
      }

      this.$message.success({
        message: '取消权限成功',
        showClose: true,
      })
      // 不能直接调用getRolesList，会重新渲染整个角色列表
      // 请求会返回一个新的children权限，我们将新的权限列表赋值给这个角色即可
      roleId.children = res.data
    },
    // 分配权限
    async setRights(role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '获取权限列表失败',
          showClose: true,
        })
      }
      // 将要修改的角色id存储到data中
      this.setRoleId = role.id
      // 将获取回来的树形结构列表赋值给data
      this.treeRightsList = res.data
      // 调用递归函数
      this.recurstionID(role, this.defaultChecked)
      // 显示对话框
      this.setRightsDialogVisible = true
    },
    // 通过递归的方式将角色所有三级权限的id保存到defaultChecked数值中
    recurstionID(role, arr) {
      // 如果role中没有children属性表示是三级菜单,将这个菜单的id存储到数组中
      if (!role.children) return arr.push(role.id)
      // 不是三级菜单就遍历children属性
      role.children.forEach((item) => this.recurstionID(item, arr))
    },
    // 当分配权限对话框关闭的时候清空选中数据
    setRightsDialogClosed() {
      // 将默认选中的复选框清除
      this.defaultChecked = []
    },
    // 分配权限点击提交事件
    async setRigthsSubmit() {
      const Checked = this.$refs.treeRightsRef.getCheckedKeys()
      const halfChecked = this.$refs.treeRightsRef.getHalfCheckedKeys()
      const allChecked = [...Checked, ...halfChecked].join(',')
      const { data: res } = await this.$http.post(`roles/${this.setRoleId}/rights`, { rids: allChecked })
      if (res.meta.status !== 200) {
        return this.$message.error({
          message: '更新权限失败',
          showClose: true,
        })
      }
      this.getRolesList()
      this.$message.success({
        message: '更新权限成功',
        showClose: true,
      })
      this.setRightsDialogVisible = false
    },
  },
}
</script>

<style scoped>
.el-tag {
  margin: 8px;
}

.tb-row {
  border-bottom: 1px solid #efefef;
}

.td-row {
  border-top: 1px solid #efefef;
}

.verticalCenter {
  display: flex;
  align-items: center;
}

.tagBox {
  padding: 0px 30px;
}
</style>

<template>
  <div id="login">
    <div class="login_box">
      <!-- 头像模块 -->
      <div class="avatar">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 欢迎语 -->
      <h1 class="title">电商后台管理系统</h1>
      <!-- 表单模块 -->
      <el-form label-width="80px" :model="loginForm" :rules="rules" ref="loginFormRef" status-icon hide-required-asterisk class="form_box">
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <!-- 密码  -->
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <!-- 按钮模块 -->
        <el-form-item class="btns" label-width="0px">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  name: "Login",
  data() {
    return {
      // 登录表单的数据数据绑定
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 表单验证规则对象
      rules: {
        // 验证用户名
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 5,
            max: 10,
            message: "用户名长度在5~10位之间",
            trigger: "blur",
          },
        ],
        // 验证密码
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 16, message: "密码长度在6~16位之间", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 重置按钮方法
    resetForm() {
      // 找到el-form组件的实例对象中的resetFields方法调用之后可以将所有内容初始化
      this.$refs.loginFormRef.resetFields();
    },
    // 提交表单预验证
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid)
          return this.$message.error({
            message: "用户名或密码格式不正确",
            showClose: true,
          });

        const { data: result } = await this.$http.post("login", this.loginForm);
        if (result.meta.status !== 200)
          return this.$message.error({
            message: "用户名或密码错误!",
            showClose: true,
          });
        this.$message.success({
          message: "登陆成功!",
          showClose: true,
        });
        // 当登录成功的时候将后台返回的token存储到sessionStorage中;
        // 之后进入其他组件需要判断是否是携带token才可以进入;
        sessionStorage.setItem("token", result.data.token);
        // 编程式导航
        this.$router.push("/home");
      });
    },
  },
};
</script>
<style lang="less" type="text/less" scoped>
#login {
  background: #2ecc71;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login_box {
  width: 600px;
  height: 400px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.24);
  position: relative;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  padding: 10px;
  background: white;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10px #ccc;
}
.avatar > img {
  width: 80%;
  height: 80%;
}
.title {
  text-align: center;
  margin-top: 80px;
}
.btns {
  display: flex;
  justify-content: center;
}
.form_box {
  width: 100%;
  position: absolute;
  bottom: 10%;
  padding: 0 30px 0 10px;
  box-sizing: border-box;
}
</style>

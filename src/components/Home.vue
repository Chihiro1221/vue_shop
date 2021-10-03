<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>
<script>
export default {
  name: "Home",
  methods: {
    logout() {
      // 清除session中的token令牌
      sessionStorage.clear();
      // 重新退回到登录界面
      this.$router.push("/login");
      this.$message.success({
        message: "已退出",
        showClose: true,
      });
    },
  },
};
</script>
<style lang=""></style>

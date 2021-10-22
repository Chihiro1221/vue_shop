module.exports = {
  chainWebpack: (config) => {
    // 当前环境为开发环境时，就使用main-dex入口文件
    config.when(process.env.NODE_ENV === 'production', (config) => {
      config.entry('app').clear().add('./src/main-prod.js')

      // external cdn优化依赖包
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor',
      })

      // 判断是否引入cdn资源
      config.plugin('html').tap((args) => {
        args[0].isProd = true
        return args
      })
    })
    // 当前环境为开发环境时，就使用main-dex入口文件
    config.when(process.env.NODE_ENV === 'development', (config) => {
      config.entry('app').clear().add('./src/main-dev.js')

      // 判断是否引入cdn资源
      config.plugin('html').tap((args) => {
        args[0].isProd = false
        return args
      })
    })
  },
  lintOnSave: false, //关闭自动语法检查
}

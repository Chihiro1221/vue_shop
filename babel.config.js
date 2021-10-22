// 判断如果当前属于生产环境下那么将禁用掉所有的console
const proPlugin = []
if (process.env.NODE_ENV === 'production') proPlugin.push('transform-remove-console')

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk',
      },
    ],
    // 移除console语句
    ...proPlugin,
    // 实现路由懒加载
    '@babel/plugin-syntax-dynamic-import',
  ],
}

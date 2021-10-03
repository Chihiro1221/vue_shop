import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 我们需要全局挂在消息组件实例对象，这样的话我们所有的vc才可以访问得到这个对象，然后调用其中的方法
Vue.prototype.$message = Message

import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
  // 此时构造函数执行时，this已经只想内存中的{},已经能访问到原型上的属性和方法
  // 调用原型上的_init 方法, 讲选项对象options 传入 _init 方法
  // _init方法来自initMixin,去看initMixin中对options 做了什么操作
}
// new 一个构造函数的时候发生了啥？
// 1. 在内存中创建一个空对象 {}
// 2. 为步骤1新创建的对象添加属性__proto__，将该属性链接至构造函数的原型对象
// 3. 将步骤1新创建的对象作为this的上下文
// 4. 如果该函数没有返回对象，则返回this

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue

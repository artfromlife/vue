/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)
  /**
   * 1.静态属性 config 只读, config 中比较重要的是 mergeStrategies 属性
   */



  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  /**
   * 2.定义静态工具方法，但是不建议使用
   */
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  /**
   * 3.定义三个静态方法 set delete nextTick
   */
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick
  /**
   *
   * 4.开放观察对象的方法
   */
  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }
  /**
   * 5.静态的options 属性 属于构造函数自身
   */
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue
  /**
   * 到这里 Vue.options = {
   *   components:{},
   *   filter:{},
   *   directives:{},
   *   _base:Vue  为什么这里还要拿到构造函数自身？？
   * }
   * 此时Vue 也只是添加了6个 属性
   */
  console.log(Vue.options)
  /**
   * 扩展 options.components,简单的数组合并 Object.assign()
   * 只有一个 keep-alive 组件的选项
   */
  extend(Vue.options.components, builtInComponents)
  /**
   * 添加Vue.use 方法，插件要用这个
   */
  initUse(Vue)
  /**
   * Vue.mixin 方法，臭名昭著的全局混入 ，其实就是(根据合并策略)合并选项到 Vue.options
   * mergeOptions 方法用到了很多次！！！！
   */
  initMixin(Vue)
  /**
   * 加入Vue.extend 方法
   * 而extend函数就是 Object.assign
   */
  initExtend(Vue)
  /**
   * 每个实例构造函数，包括 Vue，都有一个唯一的 cid。这使我们能够为原型继承创建包装的“子构造函数”并缓存它们。
   */
  initAssetRegisters(Vue)
  /**
   * Vue.filter Vue.component Vue.directive
   */
}

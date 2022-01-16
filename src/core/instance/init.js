/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  // 此方法就做了一件事情, 把_init 方法挂载到Vue构造函数的原型上去
  Vue.prototype._init = function (options?: Object) {
    // 再new Vue 时 ， this已经指向内存中的 {}  在此函数中 ,用内部变量 vm 承接 this 引用
    const vm: Component = this
    // a uid
    // 全局的uid , 每一个new 的 Vue 对象 , 最后都会有一个 _uid 属性，且是全局唯一的， 第一个实例的 _uid === 0
    vm._uid = uid++


    //
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // 表明自己是一个Vue实例
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // _isComponnet 来进行判断进入哪个处理流程
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      console.log(vm.constructor === Vue) // -> true
      // 这里初始化 实例 $options 属性 , vm.constructor 其实就是 Vue构造函数本身
      // 调用 mergeOptions 方法，传入3个参数, 第一个参数就是一个options,就是把所有的 options 根据混入策略混在一起
      // 包括 extend mixin , 这应该是一个浅拷贝吧
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      // 循环引用 实例
      vm._renderProxy = vm
    }
    // expose real self
      // 循环引用自己
    vm._self = vm
    // 第一步就是根据mergerStrategies合并所有的options 挂载到 vm.$options //
    // 第二部就是初始化关系引用 ， $parent ,$children,$root
    initLifecycle(vm)
    // 第三步初始化事件
    initEvents(vm)
    // 第四步 , 挂载 $slots , $scopedSlots ,$createElement  到实例上去
    initRender(vm)
    // 第五步
    callHook(vm, 'beforeCreate')
    // 第六步
    initInjections(vm) // resolve injections before data/props
    // 第七步 初始化响应式数据 . 这时候实例已经有了$options 属性, 可以基于$options 进行相应式数据的初始化
    initState(vm)
    // 第八步
    initProvide(vm) // resolve provide after data/props
    // 第九步
    callHook(vm, 'created')
    // 实例初始化完毕
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    // 初始化完毕开始挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

/**
 * 返回构造函数的options 属性,如果此构造函数还有父类，用super拿到父类的构造函数
 *
 * @param Ctor
 * @returns {*}
 */
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  // console.log(Ctor.options,'构造函数自己的静态属性 options')
  // console.log(Ctor,'构造函数')
  // console.log(Ctor.super,'构造函数的静态属性 super')
  if (Ctor.super) { // 对象实例的super属性是啥
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}

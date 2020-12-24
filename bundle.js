(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.tools = factory());
}(this, (function () { 'use strict';

  /**
   * 检测数据类型
   * @param data  需要检测的数据
   * @param type  数据类型 支持类名(函数名):Number 和字符串: 'number'/'Number'
   * @throws Error 当type类型不对时抛出异常
   * @returns {boolean}
   */
  function checkType(data, type) {
    if (!type) {
      return false
    }
    if (
      Object.prototype.toString.call(type).indexOf("String") < 0 &&
      Object.prototype.toString.call(type).indexOf("Function") < 0
    ) {
      throw new Error(`argument type:${type} is not correctly`)
    }
    if (Object.prototype.toString.call(type).indexOf("Function") > 0) {  // 如果是类
      return Object.prototype.toString.call(data) === Object.prototype.toString.call(new type())
    } else {  // 如果是字符串
      type = capitalize(type);
      return Object.prototype.toString.call(data).indexOf(type) > 0
    }
  }




  /**
   * 正则检测
   * @param data
   * @param regex
   * @returns {boolean|*}
   */
  function checkRegex(data, regex) {
    if (!checkType(data, "string")) {
      throw new Error(`argument data: ${data} is not a correctly String type`)
    }
    if (!regex) {
      return false
    }
    if (!checkType(regex, RegExp)) {
      throw new Error(`argument regex: ${regex} is not a correctly RegExp type`)
    }
    return regex.test(data)
  }


  /**
   * 字符串/数组/对象 长度检测
   * @param obj
   * @param min
   * @param max
   * @returns {boolean}
   */
  function checkLength(obj, min, max) {
    if (arguments.length < 2) {
      throw Error
    }
    let length;
    if (checkType(obj, "string") || checkType(obj, "array")) {
      length = obj.length;
    } else if (checkType(obj, "object")) {
      length = Object.keys(obj).length;
    } else if (checkType(obj, "number")) {
      length = obj;
    }else {
      return false
    }
    return max ? length <= max && length >= min : length === min
  }

  function createConsole(title="LazyTools") {

    function warn(str) {
      console.log(` %c${title} warn: %c${str}`, "background-color:orange;padding: 1px 0 1px 10px;margin-right: 3px; color:white; border-radius:3px", "");
    }

    function error(str) {
      console.log(` %c${title} error: %c${str}`, "background-color:red;padding: 1px 0 1px 10px;margin-right: 3px; color:white; border-radius:3px", "");
    }

    return {
      warn, error
    }
  }

  const {error, warn} = createConsole();

  function capitalize(str) {
    if (!checkType(str, String)){
      warn(`[${str.toString()}] is not a string type`);
      return
    }
    return str.slice(0, 1).toUpperCase() + str.slice(1)
  }

  var methods = /*#__PURE__*/Object.freeze({
    __proto__: null,
    capitalize: capitalize
  });

  const strings = Object.create(null);


  Object.keys(methods).forEach(key=>{
    strings[key] = methods[key];
  });

  const rules = Object.create(null);


  rules.require = function (errMsg) {
    return {
      type: "require",
      errMsg
    }
  };

  rules.length = function (min, max, errMsg) {
    if (!checkLength(arguments.length, 1, 3)) {
      throw new Error()
    }
    if (arguments.length === 1) {
      return {
        type: "length",
        min
      }
    }
    if (arguments.length === 2 && checkType(max, 'number')) {
      return {
        type: "length",
        min,
        max
      }
    } else {
      return {
        type: "length",
        min: min,
        errMsg: max
      }
    }
  };


  rules.regex = function (regex, errMsg) {
    if (!checkType(regex, RegExp)) {
      throw new Error(`argument 1(regex) is not a RegExp obj, got type ${Object.prototype.toString.call(regex)}`)
    }
    return {
      type: "regex",
      regex,
      errMsg
    }
  };

  const {error: error$1} = createConsole();


  function checkRule(value, rule, keyName, strict) {
    let errorQueue = [];
    if (!checkType(rule, 'array')) {
      throw Error(`argument rule: ${rule} is not a correctly Array object`)
    }
    try {
      rule.forEach(ruleDetail => {
        checkRuleDetail(value, ruleDetail);
        if (strict && errorQueue.length) {
          throw Error("stop caused by strict mode")
        }
      });
    }catch (e) {
      return errorQueue[0]
    }


    // 具体验证逻辑
    function checkRuleDetail(val, /*Rules*/ruleInstance) {
      switch (ruleInstance.type) {
        case "require":
          internalCheckRequire(val, ruleInstance);
          break
        case "regex":
          internalCheckRegex(val, ruleInstance);
          break
        case "length":
          internalCheckLength(val, ruleInstance);
          break
      }
    }

    function internalCheckRequire(val, ruleInstance) { // 验证存在
      if (!!val) ; else {
        errorQueue.push({
          field: keyName,
          errMsg: ruleInstance.errMsg ? ruleInstance.errMsg : `field ${keyName} is required`
        });
      }
    }

    function internalCheckRegex(val, ruleInstance) {  // 验证正则
      let ret = checkRegex(val, ruleInstance.regex);
      if (ret) ; else {
        errorQueue.push({
          field: keyName,
          errMsg: ruleInstance.errMsg ? ruleInstance.errMsg : `field ${keyName} use regex test "${ruleInstance.regex.toString()}" fail`
        });
      }
    }

    function internalCheckLength(val, ruleInstance) {  // 验证长度
      let ret = checkLength(val, ruleInstance.min, ruleInstance.max);
      if (ret) ; else {
        if (ruleInstance.max) {
          errorQueue.push({
            field: keyName,
            errMsg: ruleInstance.errMsg ? ruleInstance.errMsg : `field:${keyName} length check failed [${ruleInstance.min}, ${ruleInstance.max}]`
          });
        } else {
          errorQueue.push({
            field: keyName,
            errMsg: ruleInstance.errMsg ? ruleInstance.errMsg : `field:${keyName} length check failed`
          });
        }
      }
    }

    return errorQueue
  }

  /**
   * 提取对应的rule
   * @param obj 数据对象
   * @param rule  规则对象
   * @param key  key
   * @returns {null|*}
   */
  function findRule(obj, rule, key) {
    if (checkType(obj[key], 'object')) {
      if (rule[key] && rule[key]['rule']) {
        return rule[key]['rule']
      } else {
        return null
      }
    } else {
      if (rule[key]) {
        return rule[key]
      } else {
        return null
      }
    }
  }

  /**
   * 参数校验
   */
  function checkObject(data, rule, strict = false, parent = "root") {
    let ruleQueue = [];
    let errorQueue = [];
    if (!checkType(data, "object")) {
      error$1("argument rule must be a Object type");
      return
    }
    try{
      Object.keys(rule).forEach(key => {
        let keyRule = findRule(data, rule, key);  // 提取rule
        debugger
        if (keyRule && keyRule.length) {
          let result = checkRule(data[key], keyRule, `${parent}.${key}`, strict);  // 验证rule
          if(checkType(result, 'object')){
            errorQueue = result;
            throw Error()
          }
          if (result.length) {
            errorQueue = errorQueue.concat(result);
          }
        }
        if (checkType(data[key], 'object')) {  // 如果是对象加入验证队列
          if (rule[key] && checkType(rule[key], 'object')) {
            let other = {};
            Object.keys(rule[key]).forEach(inner_key => {
              if (inner_key !== 'rule') {
                other[inner_key] = rule[key][inner_key];
              }
            });
            ruleQueue.push({
              data: data[key],
              rule: other,
              parent: `${parent}.${key}`
            });
          }
        }
      });
    }catch (e) {  // 严格模式
      console.dir(e);
      return errorQueue
    }
    ruleQueue.forEach(({data, rule, parent}) => {
      let result = checkObject(data, rule, strict, parent);
      if (result.length) {
        errorQueue = errorQueue.concat(result);
      }
    });
    return errorQueue.length ? errorQueue : null
  }

  const tools = Object.create(null);

  tools.strings = strings;
  tools.rules = rules;
  tools.checkObject = checkObject;


  if(window){
    window.strings = strings;
    window.rules = rules;
    window.checkObject = checkObject;
  }

  return tools;

})));

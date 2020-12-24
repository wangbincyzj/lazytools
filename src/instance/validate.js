import {checkType, checkLength, checkRegex} from "../core/validate/index"
import {pass} from "../foo/pass"
import rules from "../core/validate/rules"
import {createConsole} from "../foo/console"

const {error} = createConsole()


function checkRule(value, rule, keyName, strict) {
  let errorQueue = []
  if (!checkType(rule, 'array')) {
    throw Error(`argument rule: ${rule} is not a correctly Array object`)
  }
  try {
    rule.forEach(ruleDetail => {
      checkRuleDetail(value, ruleDetail)
      if (strict && errorQueue.length) {
        throw Error("stop caused by strict mode")
      }
    })
  } catch (e) {
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
    if (!!val) {
      pass()
    } else {
      errorQueue.push({
        field: keyName,
        errMsg: ruleInstance.errMsg ? ruleInstance.errMsg : `field ${keyName} is required`
      })
    }
  }

  function internalCheckRegex(val, ruleInstance) {  // 验证正则
    let ret = checkRegex(val, ruleInstance.regex)
    if (ret) {
      pass()
    } else {
      errorQueue.push({
        field: keyName,
        errMsg: ruleInstance.errMsg ? ruleInstance.errMsg : `field ${keyName} use regex test "${ruleInstance.regex.toString()}" fail`
      })
    }
  }

  function internalCheckLength(val, ruleInstance) {  // 验证长度
    let ret = checkLength(val, ruleInstance.min, ruleInstance.max)
    if (ret) {
      pass()
    } else {
      if (ruleInstance.max) {
        errorQueue.push({
          field: keyName,
          errMsg: ruleInstance.errMsg ? ruleInstance.errMsg : `field:${keyName} length check failed [${ruleInstance.min}, ${ruleInstance.max}]`
        })
      } else {
        errorQueue.push({
          field: keyName,
          errMsg: ruleInstance.errMsg ? ruleInstance.errMsg : `field:${keyName} length check failed`
        })
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

function findAllRuleRecursive(obj, fieldName, strict) {
  let errQueue = []
  Object.keys(obj).forEach(key=>{
    if(checkType(obj[key], 'object')){
      // 递归起点
      errQueue = errQueue.concat(findAllRuleRecursive(obj[key], `${fieldName}.${key}`))
    }else{
      // 递归终点
      errQueue = errQueue.concat(checkRule(undefined, obj[key], fieldName, strict))
    }
  })
  return errQueue
}

/**
 * 参数校验
 */
function checkObject(data, rule, strict = false, parent = "root") {
  let ruleQueue = []
  let errorQueue = []
  if (!checkType(data, "object")) {
    error("argument rule must be a Object type")
    return
  }
  try {
    Object.keys(rule).forEach(key => {
      let keyRule = findRule(data, rule, key)  // 提取rule
      if (keyRule && keyRule.length) {
        let result = checkRule(data[key], keyRule, `${parent}.${key}`, strict)  // 验证rule
        if (checkType(result, 'object')) {
          errorQueue = result
          throw Error()
        }
        if (result.length) {
          errorQueue = errorQueue.concat(result)
        }
      }
      // todo bug 如果data[key] 没有值, 那么要找出后面所有的有rule的key
      if (checkType(data[key], 'object')) {  // 如果是对象加入验证队列
        if (rule[key] && checkType(rule[key], 'object')) {
          let other = {}
          Object.keys(rule[key]).forEach(inner_key => {
            if (inner_key !== 'rule') {
              other[inner_key] = rule[key][inner_key]
            }
          })
          ruleQueue.push({
            data: data[key],
            rule: other,
            parent: `${parent}.${key}`
          })
        }
      }
    })
  } catch (e) {  // 严格模式
    console.dir(e)
    return errorQueue
  }
  ruleQueue.forEach(({data, rule, parent}) => {
    let result = checkObject(data, rule, strict, parent)
    if (result.length) {
      errorQueue = errorQueue.concat(result)
    }
  })
  return errorQueue.length ? errorQueue : null
}

export {rules, checkObject}

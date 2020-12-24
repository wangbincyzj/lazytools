import {capitalize} from "../strings/index"

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
    type = capitalize(type)
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
  let length
  if (checkType(obj, "string") || checkType(obj, "array")) {
    length = obj.length
  } else if (checkType(obj, "object")) {
    length = Object.keys(obj).length
  } else if (checkType(obj, "number")) {
    length = obj
  }else{
    return false
  }
  return max ? length <= max && length >= min : length === min
}


export {
  checkType,
  capitalize,
  checkRegex,
  checkLength
}

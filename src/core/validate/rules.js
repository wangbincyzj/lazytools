import {checkLength, checkType} from "./index"

const rules = Object.create(null)


rules.require = function (errMsg) {
  return {
    type: "require",
    errMsg
  }
}

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
}


rules.regex = function (regex, errMsg) {
  if (!checkType(regex, RegExp)) {
    throw new Error(`argument 1(regex) is not a RegExp obj, got type ${Object.prototype.toString.call(regex)}`)
  }
  return {
    type: "regex",
    regex,
    errMsg
  }
}


export default rules

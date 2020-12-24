import {checkType} from "../validate/index"
import {createConsole} from "../../foo/console"

const {error, warn} = createConsole()

function capitalize(str) {
  if (!checkType(str, String)){
    warn(`[${str.toString()}] is not a string type`)
    return
  }
  return str.slice(0, 1).toUpperCase() + str.slice(1)
}


export {
  capitalize
}

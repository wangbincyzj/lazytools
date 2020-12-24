import strings from "./instance/strings"
import {rules, checkObject} from "./instance/validate"

const tools = Object.create(null)

tools.strings = strings
tools.rules = rules
tools.checkObject = checkObject


if(window){
  window.strings = strings
  window.rules = rules
  window.checkObject = checkObject
}


export default tools

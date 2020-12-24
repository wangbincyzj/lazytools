import * as methods from "../core/strings/index"


const strings = Object.create(null)


Object.keys(methods).forEach(key=>{
  strings[key] = methods[key]
})


export default strings

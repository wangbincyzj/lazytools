import json from "rollup-plugin-json"

export default {
  input: "src/main.js",
  output: {
    file: "bundle.js",
    name: "tools",
    format: "umd"
  },
  plugins: [json()]
}

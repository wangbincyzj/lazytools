export function createConsole(title="LazyTools") {

  function warn(str) {
    console.log(` %c${title} warn: %c${str}`, "background-color:orange;padding: 1px 0 1px 10px;margin-right: 3px; color:white; border-radius:3px", "")
  }

  function error(str) {
    console.log(` %c${title} error: %c${str}`, "background-color:red;padding: 1px 0 1px 10px;margin-right: 3px; color:white; border-radius:3px", "")
  }

  return {
    warn, error
  }
}

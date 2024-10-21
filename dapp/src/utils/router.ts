import { To } from "react-router-dom"
import { isString } from "./type-check"

const getURLPath = (to: To) => (isString(to) ? to : to.pathname)

const getURLParam = (paramName: string) => {
  const params = new URLSearchParams(window.location.search)
  return params.get(paramName)
}

export default { getURLPath, getURLParam }

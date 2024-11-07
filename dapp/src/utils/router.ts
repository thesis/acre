import { To } from "react-router-dom"
import { isString } from "./type-check"

const getURLPath = (to: To) => (isString(to) ? to : to.pathname)

const getURLParamFromHref = (href: string, paramName: string) => {
  const { searchParams } = new URL(href)

  return searchParams.get(paramName)
}

const getURLParam = (paramName: string) =>
  getURLParamFromHref(window.location.href, paramName)

export default { getURLPath, getURLParam, getURLParamFromHref }

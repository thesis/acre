import { To, redirect } from "react-router-dom"
import { isString } from "./type-check"

const getURLPath = (to: To) => (isString(to) ? to : to.pathname)

const getURLParamFromHref = (href: string, paramName: string) => {
  const { searchParams } = new URL(href)

  return searchParams.get(paramName)
}

const getURLParam = (paramName: string) =>
  getURLParamFromHref(window.location.href, paramName)

const redirectWithSearchParams = (url: string, to: string) => {
  const requestUrl = new URL(url)

  return redirect(`${to}${requestUrl.search}`)
}

export default {
  getURLPath,
  getURLParam,
  getURLParamFromHref,
  redirectWithSearchParams,
}

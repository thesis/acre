import { redirect } from "react-router-dom"

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
  getURLParam,
  getURLParamFromHref,
  redirectWithSearchParams,
}

import { redirect } from "react-router-dom"

const redirectWithSearchParams = (url: string, to: string) => {
  const requestUrl = new URL(url)

  return redirect(`${to}${requestUrl.search}`)
}

export default redirectWithSearchParams

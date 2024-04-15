import { routerPath } from "#/router/path"
import { useLocation } from "react-router-dom"

export const useIsRoute = (route: string) => {
  const location = useLocation()

  return location.pathname === route
}

export const useIsHomeRoute = () => useIsRoute(routerPath.home)

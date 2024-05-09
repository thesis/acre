import { routerPath } from "#/router/path"
import { useLocation } from "react-router-dom"

export const useIsActiveRoute = (route: string) => {
  const location = useLocation()

  return location.pathname === route
}

export const useIsHomeRouteActive = () => useIsActiveRoute(routerPath.home)

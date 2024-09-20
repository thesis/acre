import { To } from "react-router-dom"
import { isString } from "./type-check"

const getURLPath = (to: To) => (isString(to) ? to : to.pathname)

export default { getURLPath }

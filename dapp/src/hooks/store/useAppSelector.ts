import { useSelector } from "react-redux"
import { RootState } from "#/store"

export default useSelector.withTypes<RootState>()

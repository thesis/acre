import { useSelector } from "react-redux"
import { RootState } from "#/types"

export const useAppSelector = useSelector.withTypes<RootState>()

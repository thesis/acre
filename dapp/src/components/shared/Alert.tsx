import React from "react"
import {
  Alert as ChakraAlert,
  Icon,
  type AlertProps,
  AlertTitle,
  AlertDescription,
  AlertStatus,
  useAlertStyles,
} from "@chakra-ui/react"
import {
  IconCircleCheck,
  IconExclamationCircle,
  IconInfoCircle,
} from "@tabler/icons-react"
import Spinner from "./Spinner"

// It's impossible to customize AlertIcon in Chakra UI, this component serves
// as a workaround
// Ref: https://github.com/chakra-ui/chakra-ui/discussions/5997#discussioncomment-4098525

// TODO: Replace all uses of `components/shared/alerts/...` with this component
// and remove the old ones

const STATUSES = {
  info: {
    icon: IconInfoCircle,
    colorScheme: "grey",
  },
  warning: {
    icon: IconExclamationCircle,
    colorScheme: "orange",
  },
  success: {
    icon: IconCircleCheck,
    colorScheme: "green",
  },
  error: {
    icon: IconInfoCircle,
    colorScheme: "red",
  },
  loading: {
    icon: Spinner,
    colorScheme: "grey",
  },
}

const getStatusColorScheme = (status: AlertStatus) =>
  STATUSES[status].colorScheme

const getStatusIcon = (status: AlertStatus) => STATUSES[status].icon

function AlertIcon(props: AlertProps) {
  const { status = "info", as } = props
  const icon = as ?? getStatusIcon(status)
  const styles = useAlertStyles()
  const css =
    status === "loading"
      ? {
          ...styles.spinner,
          ...styles.icon,
        }
      : styles.icon

  return (
    <Icon
      as={icon}
      __css={css}
      variant={status === "loading" ? "filled" : undefined}
    />
  )
}

export default function Alert(props: AlertProps) {
  const { status = "info", children, ...restProps } = props
  const colorScheme = getStatusColorScheme(status)

  return (
    <ChakraAlert colorScheme={colorScheme} {...restProps}>
      {children}
    </ChakraAlert>
  )
}

export { Alert, AlertIcon, AlertTitle, AlertDescription, type AlertProps }
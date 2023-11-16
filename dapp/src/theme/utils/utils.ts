// For the ledger live app, we should detect the theme set for the user.
export function getThemeConfig(theme: string | null) {
    return {
      initialColorMode: theme,
      useSystemColorMode: false,
    }
  }
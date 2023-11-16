// For the ledger live app, we should detect the theme set for the user.
// Otherwise, let's set the mode to light by default.
// eslint-disable-next-line import/prefer-default-export
export function getThemeConfig(theme: string | null) {
    return {
      initialColorMode: theme ?? "light",
      useSystemColorMode: false,
    }
  }
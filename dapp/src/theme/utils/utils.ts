// For the ledger live app, we should detect the theme set for the user.
export function getThemeConfig(theme: string | null) {
    return {
      initialColorMode: import.meta.env.VITE_SUPPORT_THEME_MODE === "true" ? theme : "light",
      useSystemColorMode: false,
    }
  }
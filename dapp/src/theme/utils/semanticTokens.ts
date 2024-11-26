const headerHeight = 28
const headerHeightXl = 36

const modalShiftToHeaderHeight = {
  [headerHeight]: 28,
  [headerHeightXl]: "9.25rem",
}

export const semanticTokens = {
  space: {
    header_height: headerHeight,
    header_height_xl: headerHeightXl,
    modal_shift: modalShiftToHeaderHeight[headerHeight],
    modal_shift_xl: modalShiftToHeaderHeight[headerHeightXl],
    dashboard_card_padding: 5,
  },
  sizes: {
    sidebar_width: 80,
  },
}

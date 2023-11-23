export const ONE_SEC_IN_MILLISECONDS = 1000

// The function displays the date in the format: 21/11/2023, 16:02
export const formatBlockTImestamp = (blockTimestamp: number) =>
  new Date(blockTimestamp * ONE_SEC_IN_MILLISECONDS).toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  })

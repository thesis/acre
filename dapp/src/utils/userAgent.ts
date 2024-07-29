const getDeviceDetect = (userAgent: string) => {
  const isAndroid = (): boolean => Boolean(userAgent.match(/Android/i))
  const isIos = (): boolean => Boolean(userAgent.match(/iPhone|iPad|iPod/i))
  const isOpera = (): boolean => Boolean(userAgent.match(/Opera Mini/i))
  const isWindows = (): boolean => Boolean(userAgent.match(/IEMobile/i))

  const isMobile = (): boolean =>
    Boolean(isAndroid() || isIos() || isOpera() || isWindows())
  const isDesktop = (): boolean => Boolean(!isMobile())
  return {
    isMobile,
    isDesktop,
    isAndroid,
    isIos,
  }
}

export default {
  getDeviceDetect,
}

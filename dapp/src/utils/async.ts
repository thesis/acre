// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asyncWrapper(func: Promise<any>) {
  return () => {
    func.catch((error) => {
      throw error
    })
  }
}

export const createPromise = () => {
  let promiseWrapper = {}
  promiseWrapper.promise = new Promise((resolve, reject) => {
    promiseWrapper.resolve = resolve
    promiseWrapper.reject = reject
  })
  return promiseWrapper
}

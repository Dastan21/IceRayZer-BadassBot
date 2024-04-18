export function info (...data) {
  console.info(...data)
}

export function log (...data) {
  if (process.env.NODE_ENV !== 'development') return
  console.log(...data)
}

export function error (...data) {
  if (process.env.NODE_ENV !== 'development') return
  console.error(...data)
}

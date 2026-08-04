let items = []
const listeners = new Set()

const notify = () => listeners.forEach((listener) => listener(items))

export const subscribeToasts = (listener) => {
  listeners.add(listener)
  listener(items)
  return () => listeners.delete(listener)
}

export const pushToast = (toast) => {
  items = [...items, toast]
  notify()
}

export const removeToast = (id) => {
  items = items.filter((item) => item.id !== id)
  notify()
}

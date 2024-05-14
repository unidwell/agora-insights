function replacer(key, value) {
  if (value instanceof Set) {
    const arr = [...value]
    return `Set(${arr.join(',')})`
  } else if (value instanceof Map) {
    return Object.fromEntries(value.entries())
  } else {
    return value
  }
}

export function stringify(obj) {
  return JSON.stringify(obj, replacer)
}

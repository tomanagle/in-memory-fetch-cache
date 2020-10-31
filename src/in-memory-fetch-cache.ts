const bytes = (s: string) => {
  return ~-encodeURI(s).split(/%..|./).length
}
const jsonSize = (s: any) => {
  return bytes(JSON.stringify(s))
}

export class Cache<T, K> {
  cache: { [key: string]: T & { fetchDate: Date } }
  millisecondsToLive: number
  fetchFunction: Function
  fetchDate: Date
  hashKey: string

  constructor({
    fetchFunction,
    minutesToLive = 10,
    hashKey
  }: {
    fetchFunction: Function
    minutesToLive?: number
    hashKey: string
  }) {
    this.millisecondsToLive = minutesToLive * 60 * 1000
    this.fetchFunction = fetchFunction
    this.cache = {}
    this.getData = this.getData.bind(this)
    this.isCacheExpired = this.isCacheExpired.bind(this)
    this.fetchDate = new Date(0)
    this.hashKey = hashKey
  }

  isCacheExpired(props: K) {
    // @ts-ignore
    const item = this.cache[props[this.hashKey]]

    return item ? item.fetchDate.getTime() + this.millisecondsToLive < new Date().getTime() : true
  }
  getData(props: K) {
    // @ts-ignore
    const item = this.cache[props[this.hashKey]]

    if (!item || !Object.keys(this.cache).length || this.isCacheExpired(props)) {
      // Use the fetch function and return it's result
      return this.fetchFunction(props).then((data: any) => {
        if (data) {
          // @ts-ignore
          this.cache[props[this.hashKey]] = { ...data, fetchDate: new Date(), lastUsed: new Date() }
          return data
        }
        return data
      })
    }

    // Return the item from the cache
    // @ts-ignore
    // @ts-ignore
    this.cache[props[this.hashKey]] = { ...item, lastUsed: new Date() }
    // @ts-ignore
    return Promise.resolve(this.cache[props[this.hashKey]])
  }

  deleteByKey(key: string) {
    delete this.cache[key]
    return this.cache
  }

  flush() {
    const cacheLength = Object.keys(this.cache).length

    this.cache = {}

    return cacheLength
  }

  dump() {
    return this.cache
  }

  size() {
    // Returns the size of the cache object in bytes
    return jsonSize(this.cache)
  }
}

export default Cache

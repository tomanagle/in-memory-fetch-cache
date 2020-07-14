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
    if (item) {
      const fetchDate = item.fetchDate
      return fetchDate.getTime() + this.millisecondsToLive < new Date().getTime()
    }
    return true
  }
  getData(props: K) {
    // @ts-ignore
    const item = this.cache[props[this.hashKey]]

    // Fetch a fresh copy and add it to the cache
    if (!item || !Object.keys(this.cache).length || this.isCacheExpired(props)) {
      return this.fetchFunction(props).then((data: any) => {
        if (data) {
          // @ts-ignore
          this.cache[props[this.hashKey]] = { ...data, fetchDate: new Date() }

          return data
        }
        return data
      })
    }

    // Return the item from the cache
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

  async dump() {
    return this.cache
  }
}

export default Cache

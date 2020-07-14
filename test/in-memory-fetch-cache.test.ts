import * as fs from 'fs'
import path from 'path'
import Cache from '../src/in-memory-fetch-cache'

import { User } from './user.dto'

const dataSource = {
  fetchFunction: async ({ id }: { id: number }) => {
    const data = fs.readFileSync(path.join(__dirname, `/data.json`), 'utf8')

    const item = JSON.parse(data).filter((item: User) => item.id === id)

    return item[0]
  }
}

describe('in memory fetch cache', () => {
  afterEach(() => jest.clearAllMocks())

  it('it should cache and return the data', async () => {
    const fetchFunctionSpy = jest.spyOn(dataSource, 'fetchFunction')

    const cache = new Cache<User, { id: number }>({
      fetchFunction: dataSource.fetchFunction,
      hashKey: 'id'
    })

    const getDataSpy = jest.spyOn(cache, 'getData')

    const firstFetch = await cache.getData({ id: 1 })
    expect(firstFetch.id).toBe(1)
    expect(firstFetch.name).toBe('Leanne Graham')
    const secondFetch = await cache.getData({ id: 1 })

    expect(secondFetch.id).toBe(1)
    expect(secondFetch.name).toBe('Leanne Graham')

    expect(getDataSpy).toHaveBeenCalledTimes(2)
    expect(fetchFunctionSpy).toHaveBeenCalledTimes(1)
  })

  it('it should add all items to the cache', async () => {
    const fetchFunctionSpy = jest.spyOn(dataSource, 'fetchFunction')

    const cache = new Cache<User, { id: number }>({
      fetchFunction: dataSource.fetchFunction,
      hashKey: 'id'
    })

    const getDataSpy = jest.spyOn(cache, 'getData')

    const firstFetch = await cache.getData({ id: 1 })
    expect(firstFetch.id).toBe(1)
    expect(firstFetch.name).toBe('Leanne Graham')

    const secondFetch = await cache.getData({ id: 2 })
    expect(secondFetch.id).toBe(2)
    expect(secondFetch.name).toBe('Ervin Howell')

    expect(getDataSpy).toHaveBeenCalledTimes(2)
    expect(fetchFunctionSpy).toHaveBeenCalledTimes(2)
  })

  it('it should not cache null values', async () => {
    const fetchFunctionSpy = jest.spyOn(dataSource, 'fetchFunction')

    const cache = new Cache<User, { id: number }>({
      fetchFunction: dataSource.fetchFunction,
      hashKey: 'id'
    })

    const getDataSpy = jest.spyOn(cache, 'getData')

    const firstFetch = await cache.getData({ id: 10000 })
    expect(firstFetch).toBeUndefined()
  })

  it('it should delete item by key', async () => {
    const fetchFunctionSpy = jest.spyOn(dataSource, 'fetchFunction')

    const cache = new Cache<User, { id: number }>({
      fetchFunction: dataSource.fetchFunction,
      hashKey: 'id'
    })

    const getDataSpy = jest.spyOn(cache, 'getData')

    const firstFetch = await cache.getData({ id: 1 })
    expect(firstFetch.id).toBe(1)
    expect(firstFetch.name).toBe('Leanne Graham')

    cache.deleteByKey('1')

    const secondFetch = await cache.getData({ id: 1 })

    expect(secondFetch.id).toBe(1)
    expect(secondFetch.name).toBe('Leanne Graham')

    expect(getDataSpy).toHaveBeenCalledTimes(2)
    expect(fetchFunctionSpy).toHaveBeenCalledTimes(2)
  })

  it('it should flush the cache', async () => {
    const fetchFunctionSpy = jest.spyOn(dataSource, 'fetchFunction')

    const cache = new Cache<User, { id: number }>({
      fetchFunction: dataSource.fetchFunction,
      hashKey: 'id'
    })

    const getDataSpy = jest.spyOn(cache, 'getData')

    const firstFetch = await cache.getData({ id: 1 })
    expect(firstFetch.id).toBe(1)
    expect(firstFetch.name).toBe('Leanne Graham')

    cache.flush()

    const secondFetch = await cache.getData({ id: 1 })

    expect(secondFetch.id).toBe(1)
    expect(secondFetch.name).toBe('Leanne Graham')

    expect(getDataSpy).toHaveBeenCalledTimes(2)
    expect(fetchFunctionSpy).toHaveBeenCalledTimes(2)
  })
})

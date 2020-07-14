# in-memory-fetch-cache 

[![Build Status](https://travis-ci.org/tomanagle/in-memory-fetch-cache.svg?branch=master)](https://travis-ci.org/tomanagle/in-memory-fetch-cache)

## Usage
```js
/* 
* Define a fetch function
* Could be a network request, a database call or a call to the file system
*/
function fetchFunction(){
  return aFetchCall()
}

// Define your cache - TypeScript
 const cache = new Cache<User, { id: number }>({
      fetchFunction: fetchFunction,
      hashKey: 'id' // What should be used to get the data from the cache?
    })

// Define your cache - JavaScript
 const cache = new Cache({
      fetchFunction: fetchFunction,
      hashKey: 'id' // What should be used to get the data from the cache?
    })

// Fetch the data from the fetch function, or the cache
const data = await cache.getData({ id: 1 })

// Returns the contents of the cache
const dump = await cache.dump()
```
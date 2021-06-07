import redis from 'redis'
import { promisify } from 'util'

export const sub = redis.createClient({ url: process.env.REDIS_URL })
export const pub = sub.duplicate()
export const cache = sub.duplicate()
export const [getCachedValue, setCachedValue] = [promisify(cache.get).bind(cache), promisify(cache.set).bind(cache)]
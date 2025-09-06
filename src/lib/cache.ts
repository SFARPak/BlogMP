import { LRUCache } from 'lru-cache'
import { Redis } from 'ioredis'

interface CacheOptions {
  max?: number
  ttl?: number
}

// Redis client for distributed caching (optional)
let redis: Redis | null = null
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL)
}

class CacheManager {
  private cache: LRUCache<string, any>

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache({
      max: options.max || 500, // Maximum number of items
      ttl: options.ttl || 1000 * 60 * 5, // 5 minutes default TTL
      allowStale: false,
      updateAgeOnGet: true,
    })
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key)
  }

  set<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value, { ttl })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
      itemCount: this.cache.size, // Use size instead of itemCount for LRU cache
    }
  }
}

// Create cache instances for different types of data
export const userCache = new CacheManager({ max: 1000, ttl: 1000 * 60 * 10 }) // 10 minutes
export const postCache = new CacheManager({ max: 500, ttl: 1000 * 60 * 5 }) // 5 minutes
export const searchCache = new CacheManager({ max: 200, ttl: 1000 * 60 * 2 }) // 2 minutes

// Utility functions for cache keys
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userPosts: (userId: string, page: number) => `user:${userId}:posts:${page}`,
  post: (id: string) => `post:${id}`,
  posts: (page: number, limit: number) => `posts:${page}:${limit}`,
  search: (query: string, type: string) => `search:${query}:${type}`,
  trendingTags: () => 'trending:tags',
  userStats: (userId: string) => `user:${userId}:stats`,
}

// Cache middleware for API routes
export function withCache<T>(
  cache: CacheManager,
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key)
  if (cached !== undefined) {
    return Promise.resolve(cached)
  }

  // Fetch fresh data
  return fetcher().then((data) => {
    // Cache the result
    cache.set(key, data, ttl)
    return data
  })
}

// Invalidate cache patterns
export function invalidateUserCache(userId: string) {
  userCache.delete(cacheKeys.user(userId))
  userCache.delete(cacheKeys.userStats(userId))
  // Invalidate user's posts cache (this is a simplified approach)
  for (let i = 1; i <= 10; i++) {
    userCache.delete(cacheKeys.userPosts(userId, i))
  }
}

export function invalidatePostCache(postId: string) {
  postCache.delete(cacheKeys.post(postId))
  // Invalidate posts list cache
  for (let i = 1; i <= 5; i++) {
    postCache.delete(cacheKeys.posts(i, 10))
  }
}

export default CacheManager

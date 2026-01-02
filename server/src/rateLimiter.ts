import { RateLimiterMemory } from 'rate-limiter-flexible';

export const uploadLimiter = new RateLimiterMemory({
    points: 5,
    duration: 10,
});
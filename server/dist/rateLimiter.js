"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
exports.uploadLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 5,
    duration: 10,
});

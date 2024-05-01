const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_HOST_PORT,
};

const redis = new Redis(redisConfig);

redis.on("connect", () => console.log("Connected to Redis!"));
redis.on("error", (err) => console.error("Redis error", err));

module.exports = redis;

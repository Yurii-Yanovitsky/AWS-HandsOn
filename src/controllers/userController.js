const db = require("../config/db");
const redis = require("../config/redis");

const userController = {
  // async getCurrentUser() {},
  // async getUserById() {},

  async getUser(req, res) {
    const userId = req.params.id ?? req.user.sub;
    const cacheKey = `user:${userId}`;

    try {
      // Try to fetch the user data from Redis cache
      const cachedUser = await redis.get(cacheKey);

      if (cachedUser) {
        return res
          .status(200)
          .json({ user: JSON.parse(cachedUser), source: "cache" });
      }

      const user = await db.getUserById(userId);
      if (user) {
        // Store the user data in Redis cache, set to expire in 1 minute
        await redis.set(cacheKey, JSON.stringify(user), "EX", 60);
        res.json({ user: user, source: "database" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      res.status(500).send({ error: "Internal server error" });
    }
  },
};

module.exports = userController;

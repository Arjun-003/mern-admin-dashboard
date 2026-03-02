import { createClient } from "redis";
const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});
redisClient.on("error", (err) => console.error("❌ Server On Kar Redis ka:", err));
await redisClient.connect();
console.log("Connected to Redis");
export default redisClient;

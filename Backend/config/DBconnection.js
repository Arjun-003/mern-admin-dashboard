import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const sequelize = new Sequelize( // Database connection configuration
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, {  // Database connection parameters
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false
    });
export default sequelize;
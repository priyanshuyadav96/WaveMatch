
const mongoose = require("mongoose");
const { DB_NAME } = require("../constants");

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            process.env.MONGO_URI,
            {
                dbName: DB_NAME
            }
        );

        console.log(
            `MongoDB connected: ${connectionInstance.connection.host}`
        );

        return connectionInstance;

    } catch (error) {
        console.error("MONGODB CONNECTION ERROR:", error.message);
        throw error;
    }
};

module.exports = connectDB;

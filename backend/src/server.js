
const express = require("express");
const cors = require("cors");
require("dotenv").config();


// DB connection
const connectDB = require("./db/connectDB");

const app = express();

//CORS middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "WaveMatch API is running!"
    });
});

const audioRoutes = require("./routes/audio.routes.js");

app.use("/api/audio", audioRoutes);


const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to database:", error.message);
        process.exit(1);
    });


const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: true, 
            trim: true 
        },
        artist: { 
            type: String, 
            required: true, 
            trim: true 
        },
        album: { 
            type: String, 
            default: null 
        },
        duration: { 
            type: Number, 
            required: true 
        },
        fingerprintCount: { 
            type: Number, 
            default: 0 
        },
        coverImage: { 
            type: String, 
            default: null 
        },
        audioUrl: { 
            type: String, 
            default: null 
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);
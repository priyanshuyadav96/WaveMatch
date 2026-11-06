
const mongoose = require("mongoose");

const fingerprintSchema = new mongoose.Schema(
    {
        hash: { 
            type: Number, 
            required: true 
        },
        anchorFrame: { 
            type: Number, 
            required: true 
        },
        songId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Song", 
            required: true 
        }
    },
    {
        timestamps: false
    }
);

fingerprintSchema.index({ hash: 1, songId: 1, anchorFrame: 1 });

fingerprintSchema.index({ songId: 1 });

module.exports = mongoose.model("Fingerprint", fingerprintSchema);
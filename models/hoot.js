const mongoose = require("mongoose");

const hootSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['News', 'Sports', 'Games', 'Movies', 'Music', 'Television'],
    },
    content: {
        type: String,    
        required: [true, 'Content is required'],  
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [
        {
            text: String,
            author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    ]
}, { timestamps: true });


module.exports = mongoose.model("Hoot", hootSchema);

const mongoose = require("mongoose")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");



const videoSchema = mongoose.Schema({
    videoFile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        deafult: 0 
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{
    timestamps: true
})


module.exports = mongoose.model("Video", videoSchema)
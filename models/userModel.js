import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
        unique: true,
        maxLength: 10
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minLenght:10,
        required: true,
    },
    profilePic: {
        type: String,
        default: "",
    },
    contacts: {
        type: [String],
        default: [],
    },
    pendingRequests: {
        type: [String],
        default: [],
    },
    bio:{
        type:String,
        default: "",
    }
},{timestamps: true,})

const User = mongoose.model('User', userSchema);

export default User;
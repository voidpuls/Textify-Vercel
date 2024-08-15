import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    followRequestBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followRequestTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isAccepted: {
        type: Boolean,
        default: false
    }
},{timestamps:true});

const Notification =mongoose.model("Notification",notificationSchema);

export default Notification;
import mongoose from "mongoose";


const notificationAlertSchema = new mongoose.Schema({
    userId: {type:mongoose.Schema.Types.ObjectId, ref: 'User'},
    seen: {
        type: Boolean,
        default: true,
    },
    
},{timestamps: true});

const NotificationAlert = mongoose.model("NotificationAlert", notificationAlertSchema);

export default NotificationAlert;
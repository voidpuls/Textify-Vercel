import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import bcrypt from 'bcryptjs'
import mongoose, { Mongoose } from "mongoose";
import generateTokenAndSetCookies from "../utils/helpers/generateTokenAndSetCookies.js";
import { v2 as cloudinary } from 'cloudinary'
import { getRecipientSocketId,io } from "../socket/socket.js";
import NotificationAlert from "../models/notificationAlert.js";



//===================================================== send otp =================================================

// const sendOTP = async(req,res) => {
//     const {email,message} = req.body;

//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         host:'smpt.gmail.com',
//         port: 587,
//         secure: false, // Use `true` for port 465, `false` for all other ports
//         auth: {
//           user: process.env.OTP_EMAIL,
//           pass: process.env.OTP_EMAIL_APP_PASSWORD,
//         },
//       });
//     try {
//         const info = await transporter.sendMail({
//             from: process.env.OTP_EMAIL, // sender address
//             to: email, // list of receivers
//             subject: "OTP verification", // Subject line
//             text: "Verify yourself", // plain text body
//             html: `<b>${message}</b>`, // html body
//           });
//           res.json(info)
//     } catch (error) {
//         res.status(500).json({error: error.message})
//         console.error(`Error in sendOTP: ${error.message}`)
//     }

// }

//==================================================== signupUser =================================================

const signupUser = async (req, res) => {
    try {
        const { name, email, number, password } = req.body;
        const user = await User.findOne({ $or: [{ number }, { email }] })
        if (user) {
            return res.status(400).json({ error: 'User already exists' })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            number,
            email,
            password: hashedPassword
        });
        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookies(newUser._id, res);
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                number: newUser.number,
                email: newUser.email,
                bio: newUser.bio,
                profilePic: newUser.profilePic,
            })
        } else {
            res.status(400).json({ error: "Invalid User Data" })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.error(`Error in signupUser: ${error.message}`)
    }
}

//========================================================= LOG IN USER ==================================================

const loginUser = async (req, res) => {
    try {
        const { number, password } = req.body;
        const user = await User.findOne({ number });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) return res.status(400).json({ error: "invalid number or password" })
        generateTokenAndSetCookies(user._id, res);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            number: user.number,
            email: user.email,
            bio: user.bio,
            profilePic: user.profilePic,
            pendingRequests: user.pendingRequests
        });

    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log(`Error in loginUser: ${error.message}`)
    }
}

//======================================================== LogOut user ================================================================//

const logoutUser = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log(`Error in logOutUser: ${error.message}`)
    }
}

//================================================== UPDATE USER PROFILE ===================================================

const updateUserProfile = async (req, res) => {
    const { name, email, number, password, bio } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;
    try {
        let user = await User.findById(userId);
        if (!user) return res.status(400).json({ error: "User not found" });
        if (req.params.id !== userId.toString()) return res.status(400).json({ error: "Cannot Update profile of other user" });

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.number = number || user.number;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();
        user.password = null; //password should be null in response
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log(`Error in updateUser: ${error.message}`)
    }
}

//=============================================== FOLLOW/UNFOLLOW USER ===============================

const followUnfollowUser = async (req, res) => {

    try {

        const { id } = req.params;
        const currentUser = await User.findById(req.user._id);
        if (id === req.user._id.toString()) return res.status(400).json({ error: "You cannot follow/unfollow yourself" })

        const isFollowing = currentUser.contacts.includes(id);
        const isOnPendingList = currentUser.pendingRequests.includes(id);
        if (isFollowing) {
            //unfollow user
            await User.findByIdAndUpdate(req.user._id, { $pull: { contacts: id } })
            await User.findByIdAndUpdate(id, { $pull: { contacts: req.user._id } })
            // await Notification.deleteMany({
            //     followRequestBy: id,
            //     followRequestTo: req.user._id
            // })
            await Notification.deleteMany({
                $or: [
                    { followRequestBy: id, followRequestTo: req.user._id },
                    { followRequestBy: req.user._id, followRequestTo: id }
                ]
            });
            
            res.status(200).json({ message: "Removed from contacts" })
        }
        else if (isOnPendingList) {
            await User.findByIdAndUpdate(req.user._id, { $pull: { pendingRequests: id } })
            await Notification.deleteMany({
                followRequestBy: req.user._id,
                followRequestTo: id
            })
            res.status(200).json({ message: "Rejected connection request" })
        }
        else {
            // Send follow request
            await User.findByIdAndUpdate(req.user._id, { $push: { pendingRequests: id } })
            const sendFollowReq = new Notification({
                followRequestBy: req.user._id,
                followRequestTo: id,
            })
            await sendFollowReq.save();
            
            // const newNotification = new NotificationAlert({
            //     userId: req.user._id,
            //     seen: false,
            // });
            // await newNotification.save();
            await NotificationAlert.findOneAndUpdate(
                { userId: id },
                { seen: false },
                { upsert: true, new: true }
            );

            //sending to socket in case user online

            const recipientSocketId = getRecipientSocketId(id);

            if(recipientSocketId){
               // console.log(recipientSocketId)
                io.to(recipientSocketId).emit("newNotification", id)
            }
            res.status(200).json({ message: "Connection request send" })
        }

    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log(`Error in followUnfollowUser: ${error.message}`)
    }
}

//===================================================== GET NOTIFICATION ================================================


const getNotification = async (req, res) => {
    try {
        const user = req.user._id;
        const follwReq = await Notification.find({ followRequestTo: user, isAccepted: false }).sort({ createdAt: -1 });
        const reqAccepted = await Notification.find({ followRequestBy: user, isAccepted: true }).sort({ createdAt: -1 });
        let notificationsWithUserData = [];

        // Process follow requests
        for (const notification of follwReq) {
            let requestedBy = await User.findById(notification.followRequestBy)
                .select("-password -updatedAt")
                .lean();
            requestedBy.isAccepted = false;
            requestedBy.createdAt = notification.createdAt; // Add createdAt to use for sorting
            notificationsWithUserData.push(requestedBy);
        }

        // Process accepted requests
        for (const notification of reqAccepted) {
            let requestedBy = await User.findById(notification.followRequestTo)
                .select("-password -updatedAt")
                .lean();
            requestedBy.isAccepted = true;
            requestedBy.createdAt = notification.createdAt; // Add createdAt to use for sorting
            notificationsWithUserData.push(requestedBy);
        }

        // Sort notifications by createdAt in descending order
        notificationsWithUserData.sort((a, b) => b.createdAt - a.createdAt);

        if (notificationsWithUserData.length > 0) {
            res.status(200).json(notificationsWithUserData);
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in getNotification: ${error.message}`);
    }
};

const getNotificationAlert = async (req,res) => {
    try {
        const user = req.user._id;
        const notificationAlert = await NotificationAlert.find({
            userId: user
        });
        if(!notificationAlert){
            return res.status(404).json([])
        }
        return res.status(200).json(notificationAlert);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in getNotificationAlert: ${error.message}`);
    }
}

const markNotificationAsSeen = async (req, res) => {
    try {
        const user = req.user._id;
        await NotificationAlert.findOneAndUpdate(
            { userId: req.user._id },
            { seen: true },
        )
        res.status(200).json('success');

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in markNotificationAsSeen: ${error.message}`);
    }
}
//================================================= ACCEPT FOLLOW REQUEST ==================================================



const AcceptFollowReq = async (req, res) => {
    try {
        const user = req.user._id;
        const { OtherUserId } = req.params;

        // console.log('User ID:', user);
        //console.log('Other User ID:', OtherUserId);

        // Add OtherUserId to the user's contacts
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { contacts: OtherUserId } },
            { new: true } // Return the updated document
        );

        // Add User to the OtherUser's contacts
        await User.findByIdAndUpdate(
            OtherUserId,
            { $push: { contacts: user } },
            { new: true } // Return the updated document
        );
        await User.findByIdAndUpdate(OtherUserId, { $pull: { pendingRequests: user } })
        //console.log('User update result:', userUpdateResult);

        // Update the isAccepted field in the Notification model
        await Notification.updateMany(
            {
                followRequestBy: OtherUserId,
                followRequestTo: user
            },
            {
                $set: { isAccepted: true }
            }
        );
        
        //console.log('Update isAccepted result:', updateIsAcceptedResult);
        await NotificationAlert.findOneAndUpdate(
            { userId: OtherUserId },
            { seen: false },
            { upsert: true, new: true }
        );
        const newNotification = OtherUserId;
        const recipientSocketId = getRecipientSocketId(OtherUserId);
        if(recipientSocketId){
            console.log(recipientSocketId)
            io.to(recipientSocketId).emit("newNotification", newNotification)
        }
        res.status(201).json({ message: 'User Added to contacts' });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in AcceptFollowReq: ${error.message}`);
    }
};


//========================================================= GET CONTACTS =======================================================

const getContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        const contacts = await User.find({ _id: { $in: user.contacts } }).select('-password');
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in AcceptFollowReq: ${error.message}`);
    }
}

//===================================== SUGGESTED USERS =========================================

const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        // Retrieve the user's contacts and pending requests
        const user = await User.findById(userId).select('contacts pendingRequests');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Combine contacts and pendingRequests into one array and include the userId
        const excludedIds = user.contacts.concat(user.pendingRequests, [userId]).map(id => new mongoose.Types.ObjectId(id));

        // Use aggregation to find 10 random users excluding the ones in excludedIds
        const suggestedUsers = await User.aggregate([
            { $match: { _id: { $nin: excludedIds } } }, // Exclude contacts, pendingRequests, and the user themselves
            { $sample: { size: 10 } } // Get 10 random users
        ]);

        res.status(200).json(suggestedUsers);

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in getSuggestedUsers: ${error.message}`);
    }
}

//=================================== SEARCH USERS =======================================

const getSearchedUser = async (req, res) => {
    const query = req.query.q;
    try {
        const isNumericQuery = !isNaN(query);
        const queryNumber = isNumericQuery ? parseInt(query, 10) : null;

        const queryConditions = [];

        if (isNumericQuery) {
            queryConditions.push({ number: queryNumber });
        }
        if (query) {
            queryConditions.push({ name: new RegExp(`^${query}`, 'i') });
        }
        const users = await User.find({
            $or: queryConditions
        }).select("-password").limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(`Error in getSearchedUser: ${error.message}`);
    }
};



export {
    signupUser, loginUser, logoutUser, updateUserProfile,
    followUnfollowUser, getNotification, AcceptFollowReq, getContacts,
    getSuggestedUsers, getSearchedUser, getNotificationAlert,
    markNotificationAsSeen
}
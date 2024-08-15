import Conversation from "../models/conversationModel.js";
import { v2 as cloudinary } from "cloudinary";
import Message from "../models/messageModel.js";
import { getRecipientSocketId,io } from "../socket/socket.js";

async function sendMessage(req,res){
    try {
        const {recepientId, message} = req.body;
        const senderId = req.user._id;
        let {img} = req.body;
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recepientId]}
        });
        if(!conversation){
            conversation = new Conversation({
                participants: [senderId,recepientId],
                lastMessage: {
                    text: message,
                    sender: senderId
                }
            })
            await conversation.save();
        }
        
        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }
        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            text: message,
            img: img || "",
        })

        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage: {
                    text: message,
                    sender: senderId,
                }
            })
        ])

        const recipientSocketId = getRecipientSocketId(recepientId);
        if(recepientId){
            console.log(recepientId)
            console.log(recipientSocketId)
            io.to(recipientSocketId).emit("newMessage", newMessage)
        }
        res.status(201).json(newMessage)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

async function getMessage(req,res) {
    const {otherUserId} = req.params;
    const userId = req.user._id;
    try {
        const conversation = await Conversation.findOne({
            participants: {$all: [userId, otherUserId]}
        })
        if(!conversation){
            return res.status(404).json([])
        }
        const messages = await Message.find({
            conversationId: conversation._id
        }).sort({createdAt: 1})
       
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

async function getConversation(req,res){
    const userId = req.user._id
    try {
        const conversations = await Conversation.find({participants: userId}).populate({
            path: "participants",
            select:"name profilePic",
        });
        //remove the current user from participants array
        conversations.forEach(conversation => {
            conversation.participants = conversation.participants.filter(
                participant => participant._id.toString() !== userId.toString()
            );
        })
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}
function dummyApi(req,res){
    res.status(500).json({message: "This is dummyApi"})
}

export {sendMessage, getMessage, getConversation,dummyApi}
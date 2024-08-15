import express from 'express'
import Authorize from '../middlewares/Authorize.js'
import { loginUser, signupUser, logoutUser,updateUserProfile,
    followUnfollowUser,getNotification, AcceptFollowReq, getContacts,
    getSuggestedUsers, getSearchedUser,getNotificationAlert,markNotificationAsSeen } from '../controller/userController.js';
const router = express.Router();

router.get("/SearchUser",getSearchedUser)
router.get("/getnotification",Authorize,getNotification)
router.get("/getcontacts",Authorize,getContacts)
router.get("/suggestedusers",Authorize,getSuggestedUsers)
router.get("/notificationAlert",Authorize,getNotificationAlert)
router.get("/marknotificationseen",Authorize,markNotificationAsSeen)
router.post('/signup',signupUser);
router.post('/login',loginUser)
router.post("/logout",logoutUser);
router.post("/follow/:id", Authorize ,followUnfollowUser);
router.put("/profileupdate/:id",Authorize,updateUserProfile)
router.put("/acceptfollowreq/:OtherUserId",Authorize,AcceptFollowReq)

export default router;

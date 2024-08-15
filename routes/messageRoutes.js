import express from 'express'
import { dummyApi, getConversation, getMessage, sendMessage } from "../controller/messageController.js";
import Authorize from "../middlewares/Authorize.js";


const router = express.Router();
console.log(router)
router.get("/conversations",Authorize,getConversation)
router.get("/dummy",dummyApi)
router.get("/:otherUserId",Authorize,getMessage);
router.post("/",Authorize,sendMessage);

export default router;
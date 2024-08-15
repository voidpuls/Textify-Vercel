import {
    Flex, WrapItem, Avatar, Text, Menu, MenuButton, MenuList, MenuItem, Button, useColorModeValue,
    Input, InputGroup, InputRightElement, SkeletonCircle, Skeleton, Image, Spinner, useDisclosure,
    useColorMode, ModalHeader, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay,
} from '@chakra-ui/react'
import { React, useState, useRef, useEffect } from 'react'
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiArrowGoBackFill } from "react-icons/ri";
import { BsFillImageFill } from "react-icons/bs";
import { IoSendSharp } from "react-icons/io5";
import usePreviewImg from '../CostomHooks/usePreviewImg.js';
import Message from '../components/Message.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import useShowToast from '../CostomHooks/useShowToast.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atom/userAtom.js';
import { useSocket } from '../context/SocketContext.jsx';
import { conversationsAtom, selectedConversationAtom } from '../atom/messageAtom.js';
import SendAlert from '../assets/sound/NewSendMessage.mp3';
import ReceiveAlert from '../assets/sound/NewReceiveMessage.mp3';


const ChatPage = () => {

    const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg()
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true)
    const imageRef = useRef(null);
    const userId = useParams();
    const showToast = useShowToast();
    const currentUser = useRecoilValue(userAtom)
    const [isSending, setIsSending] = useState(false)
    const { socket } = useSocket();
    const selectedConversation = useRecoilValue(selectedConversationAtom)
    const [selectedConversationState, setSelectedConversation] = useRecoilState(selectedConversationAtom)
    const messageEndRef = useRef(null)
    const colorMode = useColorModeValue();
    const { onlineUsers } = useSocket();
    const { onClose } = useDisclosure()
    const navigate = useNavigate()


    useEffect(() => {
        const handleMessage = async (message) => {

            if (selectedConversation._id === message.conversationId) {
                setMessages((prevMessages) => [...prevMessages, message]);
                const ReceiveNewMsg = new Audio(ReceiveAlert);
                ReceiveNewMsg.play();
            }
            else {
                try {
                    const res = await fetch(`${window.location.origin}/api/message/conversations`);
                    const data = await res.json();

                    if (data.error) {
                        showToast("Error", data.error, "error");
                        return;
                    }
                    // setSelectedConversation(data);
                    let result = data.find(conv => conv.participants[0]._id === selectedConversation.userId);
                    console.log(result);
                    if (result) {

                        const updatedConversation = {
                            ...selectedConversationState,
                            _id: data.find(conv => conv.participants[0]._id === selectedConversation.userId)._id,
                        };

                        setSelectedConversation(updatedConversation);


                        if (updatedConversation._id === message.conversationId) {
                            console.log('inside setMsg');
                            setMessages((prevMessages) => [...prevMessages, message]);
                        }
                    }

                } catch (error) {
                    showToast("Error", error.message, "error");
                }
            }
        };

        // socket.on("newMessage", handleMessage);
        if (socket) {
            socket.on("newMessage", handleMessage);
        }

        return () => {
            if (socket) {
                socket.off("newMessage", handleMessage);
            }
        };

        // return () => socket.off("newMessage", handleMessage);
    }, [socket, setMessages, selectedConversation._id, setSelectedConversation]);

    useEffect(() => {
        const getMessages = async () => {
            setLoadingMessages(true)
            setMessages([])
            try {
                const res = await fetch(`${window.location.origin}/api/message/${userId.username}`)
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }

                setMessages(data)
            } catch (error) {
                showToast("Error", error.message, "error")
                console.log(error.message)
            }
            finally {
                setLoadingMessages(false)
            }
        }
        getMessages();

    }, [showToast, userId])

    useEffect(() => {
        const lastMessageIsFromOtherUser = messages.length && messages[messages.length - 1].sender !== currentUser._id
        if (lastMessageIsFromOtherUser) {
            socket.emit("markMessagesAsSeen", {
                conversationId: selectedConversation._id,
                userId: selectedConversation.userId
            });
        }
        const handleSockets = ({ conversationId }) => {
            //  socket.on("messagesSeen", ({conversationId}) => {
            if (selectedConversation._id === conversationId) {
                setMessages(prev => {
                    const updatedMessages = prev.map(message => {
                        if (!message.seen) {
                            return {
                                ...message,
                                seen: true
                            }
                        }
                        return message
                    })
                    return updatedMessages
                })
            }
            // })
        }

        if (socket) {
            socket.on("messagesSeen", handleSockets);
        }
    }, [socket, currentUser?._id, messages, selectedConversation])

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behaviour: "smooth" });
    }, [messages])

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText && !imgUrl) return;
        if (isSending) return;

        setIsSending(true)
        try {
            const res = await fetch(`${window.location.origin}/api/message`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: messageText,
                    recepientId: userId.username,
                    img: imgUrl
                }),
            })
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            if (!messages.length) {
                console.log(data)
                setSelectedConversation({
                    ...selectedConversationState,
                    _id: data.conversationId,
                })
            }
            setMessages((messages) => [...messages, data]);
            setMessageText("");
            setImgUrl("")
            const SendAlertSound = new Audio(SendAlert);
            SendAlertSound.play();
        } catch (error) {
            showToast("Error", error.message, "error")
        } finally {
            setIsSending(false)
        }
        //console.log(messages)
    }
    const handleRemoveContact = async () => {
        try {
            const res = await fetch(`${window.location.origin}/api/users/follow/${selectedConversation.userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            navigate('/')
        } catch (error) {
            showToast("Error", error.message, "error");
            return;
        }
    }


    return <>
        <Flex justifyContent={'space-between'} mt={5}>
            <Flex alignItems={'center'} gap={2}>
                <RiArrowGoBackFill onClick={() => navigate('/')} />
                <WrapItem>
                    <Avatar size={{
                        base: "sm",
                        sm: "md",
                        md: "md"
                    }}
                        src={selectedConversation?.userProfilePic} >
                    </Avatar>
                </WrapItem>
                <Flex alignItems={'flex-start'} flexDirection={'column'}>
                    <Text>{selectedConversation?.name}</Text>
                    <Text fontSize={'xx-small'}>{onlineUsers.includes(userId?.username) ? 'online' : 'offline'}</Text>
                </Flex>
            </Flex>
            <Flex>
                <Menu>
                    <MenuButton as={Button} bg={useColorModeValue('dark', '#101010')}>
                        <BsThreeDotsVertical fontSize="20px" fontWeight="bold" />
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={handleRemoveContact}>Remove User</MenuItem>
                    </MenuList>
                </Menu>
            </Flex>
        </Flex>
        <Flex flexDir={"column"} gap={4} my={4}
            height={"80vh"}
            overflowY={"auto"}
            p={2}
        >
            {loadingMessages && (
                [...Array(10)].map((_, i) => (
                    <Flex key={i}
                        gap={2}
                        alignItems={"center"}
                        p={1}
                        borderRadius={"md"}
                        alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
                    >
                        {i % 2 === 0 && <SkeletonCircle size={7} />}
                        <Flex flexDir={"column"} gap={2}>
                            <Skeleton h={"8px"} w={"250px"} />
                            <Skeleton h={"8px"} w={"250px"} />
                            <Skeleton h={"8px"} w={"250px"} />
                        </Flex>
                        {i % 2 !== 0 && <SkeletonCircle size={7} />}
                    </Flex>
                ))
            )}
            {!loadingMessages && (
                messages.map((message) => (
                    <Flex key={message._id} direction={"column"} gap={4} ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null}>
                        <Message ownMessage={currentUser._id === message.sender}
                            message={message}
                            otherUserPic={selectedConversation.userProfilePic}
                        />
                    </Flex>
                ))
            )}
            {/* <Flex direction={"column"} gap={4}>
                <Message ownMessage={true} message='Hii there' seen={true} />
                <Message ownMessage={true} message='How are you' seen={true} />
                <Message ownMessage={false} message='i am doing great thanks for asking. just had dinner' seen={true} />
                <Message ownMessage={true} message='glad to hear' seen={true} />
                <Message ownMessage={false} message='when you are coming back' seen={true} />
                <Message ownMessage={false} message='preety soon' seen={true} />
                <Message ownMessage={true} message='Hii there' seen={true} />
                <Message ownMessage={true} message='How are you' seen={true} />
                <Message ownMessage={false} message='i am doing great thanks for asking. just had dinner' seen={true} />
                <Message ownMessage={true} message='glad to hear' seen={true} />
                <Message ownMessage={false} message='when you are coming back' seen={true} />
                <Message ownMessage={false} message='preety soon' seen={true} />
                <Message ownMessage={false} message='i am doing great thanks for asking. just had dinner' seen={true} />
                <Message ownMessage={true} message='glad to hear' seen={true} />
                <Message ownMessage={false} message='when you are coming back' seen={true} />
                <Message ownMessage={false} message='preety soon' seen={true} />
            </Flex> */}
            {/* message input */}

        </Flex>
        <Flex gap={2} alignItems={"center"}>
            <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
                <InputGroup>
                    <Input
                        w={"full"}
                        placeholder='Type a message'
                        onChange={(e) => setMessageText(e.target.value)}
                        value={messageText}
                        borderColor={useColorModeValue('black', 'white')}
                    />
                    <InputRightElement>
                        <Button type="submit" variant="unstyled" cursor="pointer">
                            <IoSendSharp />
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </form>
            <Flex flex={5} cursor={"pointer"}>
                <BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
                <Input type={"file"} hidden ref={imageRef} onChange={handleImageChange} />
            </Flex>
            <Modal
                isOpen={imgUrl}
                onClose={() => {
                    onClose();
                    setImgUrl("");
                }}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex mt={5} w={"full"}>
                            <Image src={imgUrl} />
                        </Flex>
                        <Flex justifyContent={"flex-end"} my={2}>
                            {!isSending ? (
                                <IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage} />
                            ) : (
                                <Spinner size={"md"} />
                            )}
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    </>
}

export default ChatPage

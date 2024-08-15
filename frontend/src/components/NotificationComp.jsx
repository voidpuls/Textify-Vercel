import React, { useEffect } from 'react'
import { Flex, Avatar, Box, Text, Button, useColorModeValue } from '@chakra-ui/react'
import { FaRegCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { IoIosArrowRoundForward } from "react-icons/io";
import useShowToast from '../CostomHooks/useShowToast';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { conversationsAtom, selectedConversationAtom } from '../atom/messageAtom.js';
import { contactAtom } from '../atom/contactAtom';

const NotificationComp = ({ notification, removeNotification }) => {

    const showToast = useShowToast();
    const navigate = useNavigate();
    const conversations = useRecoilValue(conversationsAtom)
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
    const contacts= useRecoilValue(contactAtom)

    const handleSelectConv = async (e) => {
        e.preventDefault();
        // Execute your function here
        if (conversations.find(conversation => conversation.participants[0]._id === notification._id)) {
          setSelectedConversation({
            _id: conversations.find(conversation => conversation.participants[0]._id === notification._id)._id,
            userId: notification._id,
            name: conversations.find(conversation => conversation.participants[0]._id === notification._id).participants[0].name,
            userProfilePic: conversations.find(conversation => conversation.participants[0]._id === notification._id).participants[0].profilePic,
          })
        }
        else {
          setSelectedConversation({
            _id: '',
            userId: notification._id,
            name: contacts.find(person => person._id === notification._id).name,
            userProfilePic: contacts.find(person => person._id === notification._id).profilePic
          })
        }
    
        // Navigate to the target page
        navigate(`/chat/${notification._id}`);
      };
    
    const AcceptReq = async () => {
        try {
            const res = await fetch(`${window.location.origin}/api/users/acceptfollowreq/${notification._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await res.json();
            if(data.length === 0){
                return;
            }
            if (data.error) {
                showToast("Error", error, "error")
                return;
            }
            // If request is successful, remove the notification
            showToast("Contact Added", `We'hv added ${notification.name} to your contact`, "warning")
            removeNotification(notification._id);

        } catch (error) {
            showToast("Error", error.message, "error")
            console.log(error.message)
        }
    }
    return (
        <>
            {!notification.isAccepted &&
                <Flex bg={useColorModeValue('gray.200','gray.800')} p={3} borderRadius={15} mb={5}>
                    <Flex gap={2} width={'100vw'} justifyContent={'space-between'} alignItems={'center'}  >
                        <Flex gap={4}>
                            <Avatar src={notification.profilePic} size='lg' />
                            <Box>
                                <Text fontSize={"sm"} fontWeight={"bold"}>
                                    {notification.name}
                                </Text>
                                <Text color={"gray.light"} fontSize={"sm"}>
                                    {notification.number}
                                </Text>
                                <Text color={"gray.light"} fontSize={"sm"}>
                                    {notification.email.length > 18 ? `${notification.email.substring(0, 15)}...` : notification.email}
                                </Text>
                            </Box>

                        </Flex>
                        <Flex gap={2}>
                            <FaRegCheckCircle size={40} color='green' onClick={AcceptReq} />
                            <RxCrossCircled size={40} color='red' />
                        </Flex>
                    </Flex>

                </Flex>
            }
            {notification.isAccepted &&
                <Flex bg={useColorModeValue('gray.200','gray.800')} p={3} borderRadius={15} mb={5}>
                    <Flex width="100%" justifyContent="space-between" alignItems="center">
                        <Flex alignItems="center">
                            <Avatar src={notification.profilePic} size="lg" />
                            <Box ml={4}>
                                <Text>
                                    <Box as="b">{notification.name}</Box> has accepted your request
                                </Text>
                                <Button
                                    mt={2}
                                    size="sm"
                                    rightIcon={<IoIosArrowRoundForward />}
                                    colorScheme="teal"
                                    variant="outline"
                                    onClick={handleSelectConv}
                                >
                                    Start Chat
                                </Button>
                            </Box>
                        </Flex>
                    </Flex>
                </Flex>
            }
        </>
    )
}

export default NotificationComp

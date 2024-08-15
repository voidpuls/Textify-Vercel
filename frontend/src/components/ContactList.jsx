
import React, { useEffect, useState } from 'react'
import { useColorMode, useColorModeValue, WrapItem, Avatar, AvatarBadge, Flex, Stack, Text, Image, Box } from '@chakra-ui/react';
import { BsCheck2All } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom';
import { conversationsAtom, selectedConversationAtom } from '../atom/messageAtom.js';
import { useRecoilState, useRecoilValue } from 'recoil';
import { contactAtom } from '../atom/contactAtom.js';
import { useSocket } from '../context/SocketContext.jsx';
import userAtom from '../atom/userAtom.js';
import AlertSound from '../assets/sound/NewNotification.mp3'

const ContactList = ({ isOnline, contact, lastMessageObject }) => {
  const { colorMode } = useColorMode();
  const [conversations, setConversation] = useRecoilState(conversationsAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
  const contacts = useRecoilValue(contactAtom)
  const navigate = useNavigate();
  const { socket } = useSocket();
  const currentUser = useRecoilValue(userAtom);
  const [newMsg, setNewMsg] = useState(false);
  const [sender,setSender] = useState(true)
  const [msgSeen,setMsgSeen] = useState(true)

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (message) => {
        if (message.sender === contact._id) {
          setNewMsg(true);
          const AlertMsgSound = new Audio(AlertSound);
          AlertMsgSound.play();
        }
      })
    }
    return () => {
      if (socket) {
        socket.off("newMessage");
      }
    };
  })

  useEffect(() => {
      if(!lastMessageObject){
        setSender(false)
      }
      else if(lastMessageObject && lastMessageObject?.sender !== currentUser._id){
        
        setNewMsg(!lastMessageObject?.seen)
        setSender(false)
      } 
      else{
        setMsgSeen(lastMessageObject?.seen)
      }   
  },[setMsgSeen,setSender,setNewMsg])

  const handleClick = async (e) => {
    e.preventDefault();
    // Execute your function here
    if (conversations.find(conversation => conversation.participants[0]._id === contact._id)) {
      setSelectedConversation({
        _id: conversations.find(conversation => conversation.participants[0]._id === contact._id)._id,
        userId: contact._id,
        name: conversations.find(conversation => conversation.participants[0]._id === contact._id).participants[0].name,
        userProfilePic: conversations.find(conversation => conversation.participants[0]._id === contact._id).participants[0].profilePic,
      })
    }
    else {
      setSelectedConversation({
        _id: '',
        userId: contact._id,
        name: contacts.find(person => person._id === contact._id).name,
        userProfilePic: contacts.find(person => person._id === contact._id).profilePic
      })
    }

    // Navigate to the target page
    navigate(`/chat/${contact._id}`);
  };

  return (
    <Flex
      gap={4}
      alignItems={"center"}
      p={"2"}
      _hover={{
        cursor: 'pointer',
        bg: useColorModeValue("gray.600", "gray.dark"),
        color: "white"
      }}
      borderRadius={"md"}
      bg={(colorMode === "light" ? "gray.300" : "dark")}
      onClick={handleClick} // Attach the click handler here
    >
      <WrapItem>
        <Avatar size={{
          base: "md",
          sm: "sm",
          md: "md"
        }}
          src={contact?.profilePic} >
          {isOnline ? <AvatarBadge boxSize={"1em"} bg={"green.500"} /> : ""}
        </Avatar>
      </WrapItem>
      <Stack direction={'column'} fontSize={"sm"}>
        <Text fontWeight={"700"} fontSize={17} display={"flex"} alignItems={"center"}>
          {contact?.name} <Image src='/verified.png' w={4} h={4} ml={1} />
        </Text>
        <Text fontSize={"sm"} gap={1} display={"flex"} alignItems={"center"}>
          {sender && 
          <Box color={msgSeen ? "blue.400" : ""}>
            <BsCheck2All size={16}  />
          </Box>
          }
          {lastMessageObject?.text.length > 30 ? lastMessageObject?.text.substring(0, 18) + '...' : lastMessageObject?.text}
        </Text>
      </Stack>
      {newMsg && 
        <Box border="2px solid" borderColor="greenyellow" borderRadius="md" w={10} ml="auto">
          <Text fontSize={"sm"} textAlign={"center"} color={'greenyellow'}>
            new
          </Text>
        </Box>
      }
    </Flex>
  )
}

export default ContactList

import { Box, Button, Flex, Text, Link, useColorModeValue } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { MdOutlineChat } from "react-icons/md";
import { MdNotificationAdd } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoIosNotifications } from "react-icons/io";
import { NavLink } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import userAtom from '../atom/userAtom';
import { useRecoilValue } from 'recoil';
import useShowToast from '../CostomHooks/useShowToast';
import AlertSound from '../assets/sound/NewNotification.mp3'

const Footer = () => {
  const { socket } = useSocket();
  const [notification, setNotification] = useState(<IoIosNotifications fontSize={24} />);
  const currentUser = useRecoilValue(userAtom);
  const showToast = useShowToast();

  useEffect(() => {
    if (socket) {
      socket.on("newNotification", (message) => {
        if (message === currentUser._id) {
          setNotification(<MdNotificationAdd fontSize={24} color='red' onClick={markNotificationAsSeen} />);
          const sound = new Audio(AlertSound);
          sound.play();
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("newMessage");
      }
    };
  }, [socket, setNotification]);

  useEffect(() => {
    const getNotificationAlert = async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/users/notificationAlert`);
        const data = await res.json();
        if (data.length === 0) {
          return;
        }
        if (data.error) {
          showToast('Error', data.error, 'error');
          return;
        }
        if (!data[0].seen) {
          setNotification(<MdNotificationAdd fontSize={24} color='red' onClick={markNotificationAsSeen} />);
        }
      } catch (error) {
        showToast('Error', error.message, 'error');
        console.log(error.message);
      }
    };
    getNotificationAlert();
  }, [showToast, setNotification]);

  const markNotificationAsSeen = async () => {
    try {
      const res = await fetch(`${window.location.origin}/api/users/marknotificationseen`);
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      setNotification(<IoIosNotifications fontSize={24} />);
    } catch (error) {
      showToast('Error', error.message, 'error');
      console.log(error.message);
    }
  };

  return (
    <Flex
      position={'fixed'}
      bottom={0}
      width={'100%'}
      py={3}
      alignItems='center'
      justifyContent={'space-around'}
      bg={useColorModeValue('gray.200', '#101010')}
      zIndex={1} // Ensure it stays above other content
    >
      <Flex flexDirection='column' gap={1} alignItems='center'>
        <NavLink to='/' activeClassName='active'>
          <MdOutlineChat fontSize={24} />
        </NavLink>
        <Text fontSize={12}>Chats</Text>
      </Flex>
      <Flex flexDirection='column' gap={1} alignItems='center'>
        <NavLink to='/find' activeClassName='active'>
          <FaSearch fontSize={24} />
        </NavLink>
        <Text fontSize={12}>Search</Text>
      </Flex>
      <Flex flexDirection='column' gap={1} alignItems='center'>
        <NavLink to='/profile' activeClassName='active'>
          <CgProfile fontSize={24} />
        </NavLink>
        <Text fontSize={12}>Profile</Text>
      </Flex>
      <Flex flexDirection='column' gap={1} alignItems='center'>
        <NavLink to='/update' activeClassName='active'>
          {notification}
        </NavLink>
        <Text fontSize={12}>Update</Text>
      </Flex>
    </Flex>
  );
};

export default Footer;

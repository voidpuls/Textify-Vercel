import { Flex, Text,Menu,MenuButton,MenuList,MenuItem,Button,useColorModeValue } from '@chakra-ui/react'
import React from 'react'
import { BsThreeDotsVertical } from "react-icons/bs";
import useLogout from '../CostomHooks/useLogout';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const logout = useLogout()
    const navigate = useNavigate();

 
    const menuItemBg = useColorModeValue('gray.200', 'gray.800'); // MenuItem background for light and dark modes

    return (
        <Flex justifyContent={'space-between'} mt={5}>
            <Text fontSize="29px" fontWeight="bold">TextiFy</Text>
            <Menu>
                <MenuButton as={Button} bg={useColorModeValue('gray.300','dark')}>
                    <BsThreeDotsVertical fontSize="20px" fontWeight="bold" />
                </MenuButton>
                <MenuList bg={useColorModeValue('gray.200','gray.800')}>
                    <MenuItem bg={menuItemBg} onClick={() => navigate('/')}>Home</MenuItem>
                    <MenuItem  bg={menuItemBg} onClick={() => navigate('/setting')}>Setting</MenuItem>
                    <MenuItem  bg={menuItemBg} onClick={logout}>Log out</MenuItem>
                </MenuList>
            </Menu>
        </Flex>
    )
}

export default Header

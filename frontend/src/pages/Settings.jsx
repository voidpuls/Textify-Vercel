import React, { useState } from 'react'
import Header from '../components/Header'
import { Box, Flex,Text, useColorModeValue, } from '@chakra-ui/react'
import ColorModeToggle from '../components/ColorModeToggle'

const Settings = () => {


  return (
    <>
      <Header />
      <Flex mt={5}  bg={useColorModeValue('white', 'gray.800')} p={4} rounded={'xl'}>
        <Box display={'flex'} justifyContent={'space-between'} w={'100%'} alignItems={'center'}>
           <Text fontSize="20px" fontWeight="bold">
               Toggle Color Mode 
           </Text>
           <ColorModeToggle />
        </Box>
      </Flex>
    </>
  )
}

export default Settings

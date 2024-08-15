import { Flex, Input, Skeleton, SkeletonCircle, Box, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import ContactList from '../components/ContactList.jsx'
import Header from '../components/Header.jsx'
import useShowToast from '../CostomHooks/useShowToast.js'
import { useSocket } from '../context/SocketContext.jsx'
import { contactAtom } from '../atom/contactAtom.js'
import { useRecoilState } from 'recoil'
import { conversationsAtom } from '../atom/messageAtom.js'

const HomePage = () => {
  const [contacts, setContacts] = useRecoilState(contactAtom)
  const [filteredContacts, setFilteredContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const showToast = useShowToast()
  const { socket, onlineUsers } = useSocket()
  const [conversations, setConversation] = useRecoilState(conversationsAtom)

  // Fetch contacts only once and update only when necessary
  useEffect(() => {
    if (contacts.length === 0) {
      console.log('INSIDE')
      setLoading(true)
      const getContacts = async () => {
        try {
          const res = await fetch(`${window.location.origin}/api/users/getcontacts`)
          const data = await res.json()
          if (data.error) {
            showToast("Error", data.error, "error")
            return
          }
          setContacts(data)
        } catch (error) {
          showToast("Error", error.message, "error")
        } finally {
          setLoading(false)
        }
      }
      getContacts()
    }
    else{
      setLoading(false)
    }
  }, [ setContacts, setLoading,showToast])


  useEffect(() => {
    const updateContacts = async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/users/getcontacts`)
        const data = await res.json()
        if (data.error) {
          showToast("Error", data.error, "error")
          return
        }
        setContacts(prevContacts => [...prevContacts, ...data.filter(contact => !prevContacts.some(c => c._id === contact._id))])
      } catch (error) {
        showToast("Error", error.message, "error")
      }
    }

    // Set interval to call the function every 3 seconds
    const intervalId = setInterval(updateContacts, 5000)
  
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId)
    
  }, [contacts,showToast, setContacts])

  // Fetch conversations only once
  useEffect(() => {
    const setConvToRecoil = async () => {
      try {
        const res = await fetch(`${window.location.origin}/api/message/conversations`)
        const data = await res.json()
        if (data.error) {
          showToast("Error", data.error, "error")
          return
        }
        setConversation(data)
      } catch (error) {
        showToast("Error", error.message, "error")
      }
    }
  
    // Set interval to call the function every 3 seconds
    const intervalId = setInterval(setConvToRecoil, 5000)
  
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId)
  }, [conversations, setConversation, showToast])
  

  const handleSearchForContacts = (e) => {
    const value = e.target.value
    if (value === '') {
      setFilteredContacts([])
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredContacts(filtered)
    }
  }
  
  return (
    <>
      <Header />
      <Flex mt={5} justifyContent="center">
        <Input
          placeholder='Search'
          _placeholder={{ color: 'gray.500' }}
          borderColor={'white'}
          type="text"
          border={'2px solid'}
          borderRadius={20}
          w={{ base: "90%", md: "50%" }}
          onChange={handleSearchForContacts}
        />
      </Flex>

      {loading &&
        [...Array(10)].map((_, i) => (
          <Flex key={i} gap={4} mt={5} alignItems={'center'} p={"1"} borderRadius={"md"}>
            <Box>
              <SkeletonCircle size={"10"} />
            </Box>
            <Flex w={"full"} flexDirection={"column"} gap={3}>
              <Skeleton h={"10px"} w={"80px"} />
              <Skeleton h={"8px"} w={"90%"} />
            </Flex>
          </Flex>
        ))
      }

      {!loading && (
        <Flex flexDirection={'column'} mt={5} gap={4} overflow={'auto'} height={'75vh'} px={4}>
          {filteredContacts.length > 0 && filteredContacts.map((contact) => (
            <ContactList
              key={contact._id}
              isOnline={onlineUsers.includes(contact._id)}
              contact={contact}
              lastMessageObject={conversations.find(conv => conv.participants[0]._id === contact._id)?.lastMessage}
            />
          ))}

          {filteredContacts.length === 0 && contacts.length > 0 && contacts.map((contact) => (
            <ContactList
              key={contact._id}
              isOnline={onlineUsers.includes(contact._id)}
              contact={contact}
              lastMessageObject={conversations?.find(conv => conv.participants[0]._id === contact._id)?.lastMessage}
            />
          ))}

          {contacts.length === 0 && (
            <Text className='gradient-text'>Add someone to contact to start conversation</Text>
          )}

          <br />
          <br />
        </Flex>
      )}
    </>
  )
}

export default HomePage

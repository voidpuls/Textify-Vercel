import React, { useState } from 'react'
import { Flex, Input } from '@chakra-ui/react'
import SuggestedUsers from '../components/SuggestedUsers.jsx'
import useShowToast from '../CostomHooks/useShowToast.js'
import SuggestedUserComp from '../components/SuggestedUserComp.jsx'

const FindPage = () => {

  const showToast = useShowToast();
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])

  const handleSearchForUsers = async (e) => {
    const value = e.target.value;

    if (value) {
      setQuery(value);
      try {

        const res = await fetch(`${window.location.origin}/api/users/SearchUser?q=${value}`)
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error")
          return;
        }
        setUsers(data)
      } catch (error) {
        showToast("Error", error.message, "error")
      }
    }
    else {
      setUsers([])
    }
  }

  return (
    <>
      <Flex mt={10}>
        <Input
          placeholder='Search for users'
          _placeholder={{ color: 'gray.500' }}
          borderColor={'white'}
          type="text"
          onChange={handleSearchForUsers}
        />
        {/* <FaSearch /> */}
      </Flex>
      <Flex direction={"column"} gap={4} mt={10}>
        {users.length == 0 &&
          <SuggestedUsers />
        }
        {users.length !== 0 &&
          users.map(user => <SuggestedUserComp key={user._id} user={user} />)
        }
      </Flex>
    </>
  )
}

export default FindPage

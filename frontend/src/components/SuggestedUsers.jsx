import { Box, Flex, Skeleton, SkeletonCircle, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import SuggestedUserComp from './SuggestedUserComp.jsx'
import useShowToast from '../CostomHooks/useShowToast.js'

const SuggestedUsers = () => {
  const [loading, setLoading] = useState(true)
  const [suggestedUser,setSuggestedUser] = useState([]);
  const showToast = useShowToast()

 
  useEffect(() => {
    const getSuggestedUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${window.location.origin}/api/users/suggestedusers`)
            const data = await res.json();
            if(data.error){
                showToast("Error",data.error,"error")
                return;
            }
            setSuggestedUser(data)
        } catch (error) {
            showToast("Error",error.message,"error")
        } finally {
            setLoading(false)
        }
    }
    getSuggestedUsers()

  },[])

  return (
    <>
      <Text mb={4} fontWeight={"bold"}>
          Suggested Users
      </Text>
      <Flex direction={"column"} gap={4}>
        {!loading && suggestedUser.map(user => <SuggestedUserComp key={user._id} user={user} />)}
        {loading &&
					[0, 1, 2, 3, 4].map((_, idx) => (
						<Flex key={idx} gap={2} alignItems={"center"} p={"1"} borderRadius={"md"}>
							{/* avatar skeleton */}
							<Box>
								<SkeletonCircle size={"10"} />
							</Box>
							{/* username and fullname skeleton */}
							<Flex w={"full"} flexDirection={"column"} gap={2}>
								<Skeleton h={"8px"} w={"80px"} />
								<Skeleton h={"8px"} w={"90px"} />
							</Flex>
							{/* follow button skeleton */}
							<Flex>
								<Skeleton h={"20px"} w={"60px"} />
							</Flex>
						</Flex>
					))}
      </Flex>
    </>
  )
}

export default SuggestedUsers

import React, { useEffect } from 'react'
import { Flex, Avatar, Box, Text, Button } from '@chakra-ui/react'
import { Link } from "react-router-dom";
import useFollowUnfollow from '../CostomHooks/useFollowUnfollow';
import { useRecoilValue } from 'recoil';
import userAtom from '../atom/userAtom';

const SuggestedUserComp = ({ user }) => {
    const { handleFollowUnfollow, updating, following, pendingReq } = useFollowUnfollow(user)

    return (
        <Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
            {/* left side */}
            <Flex gap={2}>
                <Avatar src={user.profilePic} />
                <Box>
                    <Text fontSize={"sm"} fontWeight={"bold"}>
                        {user.name}
                    </Text>
                    <Text color={"gray.light"} fontSize={"sm"}>
                        {user.name}
                    </Text>
                </Box>
            </Flex>
            {/* right side */}
            <Button
                size={"sm"}
                color={following ? "black" : (pendingReq ? 'black' : 'white')}
                bg={following ? 'red.400' : (pendingReq ? 'white' : 'blue.400')}
                onClick={handleFollowUnfollow}
                isLoading={updating}
                _hover={{
                    color: following ? "white" : "black",
                    opacity: ".8",
                }}
            >
                {following ? "remove" : (pendingReq ? "pending" : "connect")}

            </Button>
        </Flex>
    )
}

export default SuggestedUserComp

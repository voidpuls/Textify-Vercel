import React, { useEffect, useState } from 'react'
import { Flex, Box, Avatar, Text, Button,Skeleton,SkeletonCircle } from '@chakra-ui/react'
import Header from '../components/Header'
import useShowToast from '../CostomHooks/useShowToast';
import NotificationComp from '../components/NotificationComp';

const Notification = () => {
    const showToast = useShowToast();
    const [notifications, SetNotifications] = useState([]);
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const getNotification = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${window.location.origin}/api/users/getnotification`)
                const data = await res.json()
                if (data.error) {
                    showToast('Error', data.error, 'error')
                    return
                }
                //console.log(data)
                SetNotifications(data);
            } catch (error) {
                showToast('Error', error.message, 'error')
                console.log(error.message)
            } finally {
                setLoading(false)
            }
        }
        getNotification();
    }, [showToast])

    const removeNotification = (id) => {
        SetNotifications(notifications.filter(notification => notification._id !== id))
    };
    return (
        <>
            <Header />
            {loading && (
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
            )}
            {!loading && notifications.length > 0 &&
                <Flex flexDirection={'column'} mt={10} >
                    {notifications.map((notification) => (
                        <NotificationComp key={notification._id} notification={notification} removeNotification={removeNotification} />
                    ))}
                    <br />
                    <br />
                </Flex>
            }
            {!loading && notifications.length < 1 &&
                <Text className='gradient-text' mt={10}>No new notification</Text>
            }
        </>
    )
}

export default Notification

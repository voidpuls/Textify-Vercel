import { React, useState } from 'react'

import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Link,
} from '@chakra-ui/react'
import authAtom from '../atom/authAtom'
import { useSetRecoilState } from 'recoil'
import userAtom from '../atom/userAtom'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import useShowToast from '../CostomHooks/useShowToast'

const LoginCard = () => {
    const [showPassword, setShowPassword] = useState(false)
    const setAuthScreen = useSetRecoilState(authAtom)
    const showToast = useShowToast();
    const setUser = useSetRecoilState(userAtom)
    const [loading, setLoading] = useState(false)
    const [inputs,setInputs] = useState({
        number:"",
        password:""
    })
    const handleLogin = async() => {
        setLoading(true)
        try {
            const res = await fetch(`${window.location.origin}/api/users/login`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputs),
            })
            const data = await res.json();
            if(data.error){
               showToast("Error",data.error,"error")
               return;
            }
            localStorage.setItem("TextiFy", JSON.stringify(data));
            setUser(data)
            showToast("Welcome",'Logged in successfully','success')
        } 
        catch {
            showToast("Error",error.message,"error")
        }
        finally {
            setLoading(false)
        } 
    }
    return (
        <Flex
            align={'center'}
            justify={'center'}>
            <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'4xl'} textAlign={'center'}>
                        TextiFy
                    </Heading>
                </Stack>
                <Box
                    w={{
                        sm: "400px",
                        base: "full"
                    }}
                    rounded={'lg'}
                    bg={useColorModeValue('white', 'gray.dark')}
                    boxShadow={'lg'}
                    p={8}>
                    <Stack spacing={4}>

                        <FormControl isRequired>
                            <FormLabel>Mobile Number</FormLabel>
                            <Input type="number" onChange={(e) => setInputs({...inputs,number: e.target.value})} value={inputs.number} />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                                    value={inputs.password}
                                />
                                <InputRightElement h={'full'}>
                                    <Button
                                        variant={'ghost'}
                                        onClick={() => setShowPassword((showPassword) => !showPassword)}>
                                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText="loging in"
                                size="lg"
                                bg={useColorModeValue("gray.600", "gray.700")}
                                color={'white'}
                                _hover={{
                                    bg: useColorModeValue("gray.700", "gray.800"),
                                }}
                                onClick={handleLogin}
                            >
                                Login
                            </Button>
                        </Stack>
                        <Stack pt={6}>
                            <Text align={'center'}>
                                Dont&apos;t have an account? <Link color={'blue.400'}
                                    onClick={() => setAuthScreen("signup")}>SignUp</Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    )
}

export default LoginCard

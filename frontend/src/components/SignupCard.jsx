

import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    HStack,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Link,
    useToast,
    Center,
    PinInput,
    PinInputField
} from '@chakra-ui/react'
import { useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import useShowToast from '../CostomHooks/useShowToast'
import { useRecoilState, useRecoilValue,useSetRecoilState } from 'recoil'
import userAtom from '../atom/userAtom'
import authAtom from '../atom/authAtom'

export default function SignupCard() {

    const setAuthScreen = useSetRecoilState(authAtom)
    const setUser = useSetRecoilState(userAtom)
    const [showPassword, setShowPassword] = useState(false)
    const showToast = useShowToast();
    const [inputs, setInputs] = useState({
        name: "",
        number: "",
        email: "",
        password: "",
    });

    const handelSignupRequest = async() => {
        
        try {
            const res = await fetch(`${window.location.origin}/api/users/signup`,{
                method:'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputs)
            });
            const data = await res.json();
            if(data.error){
                showToast("Error",data.error,"error")
                return;
            }
            localStorage.setItem("TextiFy", JSON.stringify(data));
            setUser(data)
            showToast("Account created","we have created your account","success")
        } catch (error) {
            showToast("Error",error.message,"error")
        }

    }
   
    return (
        <> 
            <Flex
                align={'center'}
                justify={'center'}>
                <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                    <Stack align={'center'}>
                        <Heading fontSize={'4xl'} textAlign={'center'}>
                            Sign up
                        </Heading>
                    </Stack>
                    <Box
                        rounded={'lg'}
                        bg={useColorModeValue('white', 'gray.dark')}
                        boxShadow={'lg'}
                        p={8}>
                        <Stack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Full Name</FormLabel>
                                <Input type="text"
                                    onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                                    value={inputs.name} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Mobile Number</FormLabel>
                                <Input type="number"
                                    onChange={(e) => setInputs({ ...inputs, number: e.target.value })}
                                    value={inputs.number} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Email address</FormLabel>
                                <Input type="email"
                                    onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                                    value={inputs.email} />
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
                                    size="lg"
                                    bg={useColorModeValue("gray.600", "gray.700")}
                                    color={'white'}
                                    _hover={{
                                        bg: useColorModeValue("gray.700", "gray.800"),
                                    }}
                                    onClick={handelSignupRequest}
                                >
                                    Sign Up
                                </Button>
                            </Stack>
                            <Stack pt={6}>
                                <Text align={'center'}>
                                    Already a user? <Link color={'blue.400'}
                                        onClick={() => setAuthScreen("login")}>Login</Link>
                                </Text>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Flex>
        </>
    )
}
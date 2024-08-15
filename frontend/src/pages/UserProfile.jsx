
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  HStack,
  Avatar,
  AvatarBadge,
  IconButton,
  Center,
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import Header from '../components/Header.jsx'
import { useRecoilState } from 'recoil'
import userAtom from '../atom/userAtom.js'
import useShowToast from '../CostomHooks/useShowToast.js'
import usePreviewImg from '../CostomHooks/usePreviewImg.js'

const UserProfile = () => {

  const [user, setUser] = useRecoilState(userAtom)
  const [updating, setUpdating] = useState(false)
  const fileRef = useRef(null)
  const showToast = useShowToast();
  const { handleImageChange, imgUrl } = usePreviewImg()
  const [inputs, setInputs] = useState({
    name: user?.name,
    email: user?.email,
    number: user?.number,
    bio: user?.bio,
    password: ''
  })

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`${window.location.origin}/api/users/profileupdate/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...inputs, profilePic: imgUrl })
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error")
        return;
      }
      showToast("Success", "Profile updated successfully", "success")
      setUser(data)
      localStorage.setItem("TextiFy", JSON.stringify(data));
    } catch (error) {
      showToast("Error", error.message, "error")
    } finally {
      setUpdating(false)
    }
  }
  return (
    <>
      <Header />
      <form onSubmit={handleUpdateProfile}>
        <Stack
          spacing={4}
          w={'full'}
          maxW={'md'}
          bg={useColorModeValue('white', 'gray.800')}
          rounded={'xl'}
          boxShadow={'lg'}
          p={6}
          my={6}>
          <Heading lineHeight={1.1} textAlign={'center'} fontSize={{ base: '2xl', sm: '3xl' }}>
            User Profile Edit
          </Heading>
          <FormControl>
            <Stack direction={['column', 'row']} spacing={6}>
              <Center>
                <Avatar size="xl" src={imgUrl || user?.profilePic}>
                </Avatar>
              </Center>
              <Center w="full">
                <Button w="full" onClick={() => fileRef.current.click()}>Change Avatar</Button>
                <Input type='file' hidden ref={fileRef} onChange={handleImageChange} />
              </Center>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="Your name"
              _placeholder={{ color: 'gray.500' }}
              type="text"
              onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
              value={inputs.name}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email address</FormLabel>
            <Input
              placeholder="your-email@example.com"
              _placeholder={{ color: 'gray.500' }}
              type="email"
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              value={inputs.email}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Input
              placeholder="your bio"
              _placeholder={{ color: 'gray.500' }}
              type="text"
              onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
              value={inputs.bio}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="password"
              _placeholder={{ color: 'gray.500' }}
              type="password"
              onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
              value={inputs.password}
            />
          </FormControl>
          <Stack spacing={6} direction={['column', 'row']}>
            <Button
              loadingText="Updating"
              bg={'blue.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'blue.500',
              }}
              type='submit'
              onClick={handleUpdateProfile}
              isLoading={updating}
            >
              Submit
            </Button>
            <br />
          </Stack>
        </Stack>
      </form>
    </>
  )
}

export default UserProfile

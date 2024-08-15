import React from 'react'
import authAtom from '../atom/authAtom.js'
import { useRecoilValue } from 'recoil'
import LoginCard from '../components/LoginCard.jsx'
import SignupCard from '../components/SignupCard.jsx'

const AuthPage = () => {
  const authAtomValue = useRecoilValue(authAtom)
  return (
     <>
       {authAtomValue === 'login' && <LoginCard />}
       {authAtomValue === 'signup' && <SignupCard />}
     </>
  )
}

export default AuthPage

import React, { useEffect } from 'react'
import {Routes, Route, Navigate }from "react-router-dom"
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import  Navbar  from './components/Navbar'
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingPage from "./pages/SettingPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from './store/useAuthStore';
import VerifyOTPPage from './pages/VerifyOTPPage';

const App = () => {
  const {authUser, checkAuth, isChecking} = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

console.log("AuthUser: ", authUser)
if (isChecking && !authUser)
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  );
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />}></Route>
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />}></Route>
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />}></Route>
        <Route path="/verify-otp" element={!authUser ? <VerifyOTPPage /> : <Navigate to="/" />} />
        <Route path="/forget-password" element={!authUser ? <ForgetPasswordPage /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={!authUser ? <ResetPasswordPage /> : <Navigate to="/" />} />
        <Route path='/settings' element={<SettingPage/>}></Route>
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />}></Route>
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App
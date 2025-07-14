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
import { useThemeStore } from './store/useThemeStore';
import VideoCallPage from './pages/VideoCallPage';

const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();
  const {theme} = useThemeStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
if (isCheckingAuth && !authUser)
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  );
  return (
    <div data-theme={theme}>
      <Navbar/>
      <Routes>
       <Route
          path='/'
          element={
            authUser
              ? (authUser.data.fullName == null || authUser.data.fullName === '')
                ? <Navigate to="/profile" />
                : <HomePage />
              : <Navigate to="/login" />
          }
        />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />}></Route>
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />}></Route>
        <Route path="/verify-otp" element={!authUser ? <VerifyOTPPage /> : <Navigate to="/" />} />
        <Route path="/forget-password" element={!authUser ? <ForgetPasswordPage /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={!authUser ? <ResetPasswordPage /> : <Navigate to="/" />} />
        <Route path='/settings' element={<SettingPage/>}></Route>
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />}></Route>
        <Route path="/video-call" element={<VideoCallPage />} />
      </Routes>
      <Toaster/>
    </div>
    // <div className="flex bg-gray-100 min-h-screen">
    //   <HomePage />
    // </div>
  )
}

export default App
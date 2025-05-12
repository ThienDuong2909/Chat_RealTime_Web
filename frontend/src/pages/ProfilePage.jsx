import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from "../store/useUserStore";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Edit, Check,LoaderCircle  } from "lucide-react";
import { TygerAvatar } from 'tyger-avatar';
import toast from 'react-hot-toast';
import 'tyger-avatar/lib/bundle/styles.css';

// Simple debounce function
const ProfilePage = () => {
  const { authUser } = useAuthStore();
  const { isUpadatingAvatar,isUpadatingFullname, updateFullname, updateAvatar } = useUserStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditingFullName, setIsEditingFullName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(authUser?.data?.fullName || '');
  const [nameLabel, setNameLabel] = useState(authUser?.data?.fullName || '');
  const fullNameInputRef = useRef(null);
  const hasShownToast = useRef(false);

  // List of available TygerAvatar names

  console.log("authUser profile", authUser)

  useEffect(() => {
    if (authUser && (authUser.data.fullName == null || authUser.data.fullName === '')) {
      setIsEditingFullName(true);
      if (!hasShownToast.current) {
        toast.success('Có vẻ bạn là người mới, Xin nhập các thông tin cần thiết', { duration: 2000 });
        hasShownToast.current = true;
      }
    }
  }, [authUser]);

  useEffect(() => {
    if (isEditingFullName && fullNameInputRef.current) {
      requestAnimationFrame(() => {
        fullNameInputRef.current.focus();
      });
    }
  }, [isEditingFullName]);

  // Sync fullNameInput with authUser.fullName when it changes
  useEffect(() => {
    setFullNameInput(authUser?.data?.fullName || '');
  }, [authUser?.data?.fullName]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, or GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      try {
        await updateAvatar({ avatar: base64Image });
        toast.success('Avatar updated successfully');
      } catch (error) {
        toast.error(`Failed to update avatar: ${error.message}`);
      }
    };

    reader.onerror = () => {
      toast.error('Error reading the image file');
    };
  };

  const handleEditFullName = () => {
    setIsEditingFullName(true);
    setTimeout(() => fullNameInputRef.current?.focus(), 0); // Ensure focus after render
  };

  const handleSaveFullName = async () => {
    const trimmedInput = fullNameInput.trim();
  const currentFullName = authUser?.data?.fullName?.trim() || '';

  if (trimmedInput === '') {
    toast.error('Full name cannot be empty');
    return;
  }

  if (trimmedInput === currentFullName) {
    setIsEditingFullName(false);
    return;
  }
    try {
      await updateFullname({ fullName: trimmedInput });
      toast.success('Full name updated successfully');
      setNameLabel(trimmedInput)
      setIsEditingFullName(false);
    } catch (error) {
      toast.error('Failed to update full name:'+ error);
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-base-300 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="size-32 rounded-full border-4 bg-base-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedImg || authUser?.data?.avatar || "/avatar.png"}
                    alt="Profile"
                    className="size-32 rounded-full object-cover"
                  />
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                <label
                  htmlFor="avatar-upload"
                  className={`
                    bg-base-content hover:scale-105
                    p-1.5 rounded-full cursor-pointer 
                    transition-all duration-200
                    ${isUpadatingAvatar ? "animate-pulse pointer-events-none" : ""}
                  `}
                >
                  <Camera className="w-4 h-4 text-base-200" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpadatingAvatar}
                  />
                </label>
              </div>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpadatingAvatar
                ? "Processing..."
                : "Click the camera to upload or shuffle for a random avatar"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <div className="relative">
                {isEditingFullName ? (
                  <input
                    ref={fullNameInputRef}
                    type="text"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-base-200 rounded-lg border focus:outline-none focus:ring-2 focus:ring-base-content"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                    {nameLabel}
                  </p>
                )}
                <button
                  onClick={isEditingFullName ? handleSaveFullName : handleEditFullName}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-base-100 transition-all duration-200"
                  disabled={isUpadatingAvatar || isUpadatingFullname}
                >
                  {isEditingFullName ? (
                    isUpadatingFullname ? (
                      <LoaderCircle className="w-4 h-4 text-base-content animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 text-base-content" />
                    )
                  ) : (
                    <Edit className="w-4 h-4 text-base-content" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.data?.email}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl py-2 px-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.data?.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
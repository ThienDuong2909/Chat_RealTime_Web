import React from "react";
import { Home, Compass, Bell, Mail, Bookmark, BarChart2, Settings, Palette } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-full  bg-white p-4 min-h-screen border-r border-gray-200">
      <div className="flex items-center gap-2 mb-8">
        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-semibold">Diana Ayi</div>
          <div className="text-gray-500 text-sm">@dayi</div>
        </div>
      </div>

      <div className="space-y-4">
        <SidebarItem icon={<Home size={20} />} label="Home" active />
        <SidebarItem icon={<Compass size={20} />} label="Explore" />
        <SidebarItem icon={<Bell size={20} />} label="Notifications" badge="9+" />
        <SidebarItem icon={<Mail size={20} />} label="Messages" badge="6" />
        <SidebarItem icon={<Bookmark size={20} />} label="Bookmarks" />
        <SidebarItem icon={<BarChart2 size={20} />} label="Analytics" />
        <SidebarItem icon={<Palette size={20} />} label="Theme" />
        <SidebarItem icon={<Settings size={20} />} label="Settings" />
      </div>

      <button className="mt-10 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-sm font-semibold">
        Create Post
      </button>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, badge }) => (
  <div
    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
      active ? "bg-gray-100 border-l-4 border-purple-600" : ""
    }`}
  >
    <div className="flex items-center gap-3">
      <span className="text-gray-700">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    {badge && (
      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </div>
);

export default Sidebar;

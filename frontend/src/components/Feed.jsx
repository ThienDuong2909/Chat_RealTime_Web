import React, { useRef, useState } from "react";
import {ImageUp } from "lucide-react";


export const Feed = () => {
  const [postContent, setPostContent] = useState("");
  const [image, setImage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handlePost = () => {
    console.log("Post content:", postContent);
    console.log("Image file:", image);
    setPostContent("");
    setImage(null);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setPostContent("");
    setImage(null);
    setIsExpanded(false);
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Create Post */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-start gap-3 mb-2">
          <img
            src="https://randomuser.me/api/portraits/women/49.jpg"
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            {!isExpanded ? (
              // === Compact View ===
              <div
                className="flex items-center gap-3 border border-gray-300 rounded-lg px-3 py-2 cursor-text"
                onClick={() => setIsExpanded(true)}
              >
                <input
                  type="text"
                  className="flex-1 text-sm focus:outline-none"
                  placeholder="What's on your mind?"
                  readOnly
                />
                <button
                  onClick={() => setIsExpanded(true)}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-xs"
                >
                  Post
                </button>
              </div>
            ) : (
              // === Expanded View ===
              <div>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none resize-none"
                  rows="3"
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  autoFocus
                ></textarea>

                {image && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  {/* Icon chọn ảnh */}
                  <div
                    className="cursor-pointer text-purple-600 hover:text-purple-800"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <ImageUp size={24} />
                  </div>

                  {/* Input file ẩn */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="text-gray-500 border border-gray-300 px-4 py-1.5 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePost}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feed Item (Demo) */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="https://randomuser.me/api/portraits/women/49.jpg"
            alt="Lana Rose"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="font-semibold">Lana Rose</div>
            <div className="text-xs text-gray-500">Dubai, 15 MINUTES AGO</div>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1608889175421-69d60b2186ed"
          alt="Post Content"
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        <p className="text-gray-700 text-sm">
          <strong>Lana Rose</strong> Lorem ipsum dolor sit quisquam eius. #lifestyle
        </p>
        <div className="mt-2 text-sm text-gray-500">
          <span className="font-semibold">Ernest Achiever</span> and 2,323 others liked this
        </div>
      </div>
    </div>
  );
};

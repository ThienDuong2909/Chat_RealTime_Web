import React, { useRef, useState } from 'react'
import {Image, Send, X, Plus } from 'lucide-react'
import {toast} from 'react-hot-toast'
import { useChatStore } from '../store/useChatStore';


const MAX_IMAGES = 10;

const ChatInput = () => {
  const [imagePreviews, setImagePreviews] = useState([]);
  const [text, setText] = useState("");
  const fileInputRef = useRef(null)
  const {sendMessage } = useChatStore()

const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(file => file.type.startsWith('image/'));

    if (validImages.length + imagePreviews.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    const readers = validImages.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      setImagePreviews(prev => [...prev, ...results]);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  const handleSendMessage = async(e)=>{
      e.preventDefault();
      console.log("imagePreviews", imagePreviews)
      

    if (!text.trim() && imagePreviews.length === 0) return;
    setText("");
    setImagePreviews([]);

    try {
      await sendMessage({
        text: text.trim(),
        images: imagePreviews, 
      });

      
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };



  return  (
    <div className="p-4 w-full">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            multiple
            ref={fileInputRef}
            onChange={handleImageChange}
          />
         <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreviews ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
          
        </div>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && imagePreviews.length === 0}
        >
          <Send size={22} />
        </button>
      </form>

      {imagePreviews.length > 0 && (
        <div className="mt-3 mx-2">
          <p className="text-sm text-zinc-400 mb-2">{imagePreviews.length} Photo{imagePreviews.length > 1 ? 's' : ''}</p>
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((src, index) => (
              <div key={index} className="relative">
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}

            {imagePreviews.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-zinc-600 flex items-center justify-center rounded-lg"
              >
                <Plus className="text-zinc-400" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInput
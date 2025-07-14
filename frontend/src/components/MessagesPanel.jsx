const MessagesPanel = () => {
  const messages = [
    {
      name: "Steve Jobs",
      username: "@steve",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      preview: "How's your day going?",
    },
    {
      name: "Elon Musk",
      username: "@elon",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      preview: "We need to talk about Mars...",
    },
    {
      name: "Ada Lovelace",
      username: "@ada",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      preview: "Check out this algorithm I made!",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Messages</h2>
      {messages.map((msg, index) => (
        <div key={index} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg">
          <img src={msg.avatar} alt={msg.name} className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <div className="font-medium text-sm">{msg.name}</div>
            <div className="text-xs text-gray-500">{msg.preview}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessagesPanel;

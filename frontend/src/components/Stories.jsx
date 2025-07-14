
export const Stories = () => {
  const storyUsers = [
    { name: "Your Story", image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Lilia James", image: "https://randomuser.me/api/portraits/women/45.jpg" },
    { name: "Winnie Hale", image: "https://randomuser.me/api/portraits/women/46.jpg" },
    { name: "Daniel Bale", image: "https://randomuser.me/api/portraits/men/46.jpg" },
    { name: "Jane Doe", image: "https://randomuser.me/api/portraits/women/47.jpg" },
    { name: "Tina White", image: "https://randomuser.me/api/portraits/women/48.jpg" },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto py-4">
      {storyUsers.map((user, index) => (
        <div key={index} className="flex flex-col items-center text-center">
          <img
            src={user.image}
            alt={user.name}
            className="w-16 h-16 rounded-full border-2 border-purple-600 p-0.5"
          />
          <span className="text-xs mt-1 text-gray-700 whitespace-nowrap">{user.name}</span>
        </div>
      ))}
    </div>
  );
};
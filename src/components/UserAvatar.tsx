import React from 'react';

interface UserAvatarProps {
  name: string;
  imageUrl?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, imageUrl }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-green-400 to-emerald-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-pink-400 to-rose-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-yellow-400 to-orange-500',
      'bg-gradient-to-br from-red-400 to-red-600',
      'bg-gradient-to-br from-teal-400 to-cyan-600'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="text-center group cursor-pointer">
      <div className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center text-white font-bold text-lg lg:text-xl mx-auto mb-2 lg:mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 ${
        imageUrl ? '' : getRandomColor(name)
      }`}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full rounded-2xl object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
      <p className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{name}</p>
    </div>
  );
};

export default UserAvatar;
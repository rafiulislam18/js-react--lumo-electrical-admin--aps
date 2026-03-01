import React from 'react';

const Comments: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8">Comments</h3>
      
      <div className="space-y-1 mb-4 lg:mb-6">
        <div className="flex justify-between text-xs sm:text-sm font-semibold text-gray-500 pb-3 uppercase tracking-wide">
          <span>Comments</span>
          <span>Date</span>
        </div>
      </div>
      
      <div className="space-y-4 lg:space-y-6">
        <div className="border-b border-gray-100 pb-4 lg:pb-6">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut 
            Ut enim ad minim veniam, quis nostrud exercitation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Comments;
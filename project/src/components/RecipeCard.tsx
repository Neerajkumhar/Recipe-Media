// src/components/RecipeCard.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Edit2, Trash2 } from 'lucide-react';
import { FALLBACK_IMAGE } from '../constants/images';

interface RecipeCardProps {
  id: string;
  title: string;
  category: string;
  image: string;
  prepTime?: string;
  servings?: number;
  className?: string;
  isPrivate?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
  chefName?: string;
  userId?: string;
  currentUserId?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  category,
  image,
  prepTime,
  servings,
  className = '',
  isPrivate = false,
  onEdit,
  onDelete,
  showActions = true,
  chefName,
  userId,
  currentUserId,
}) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(image || FALLBACK_IMAGE);
  const isOwner = userId && currentUserId && userId === currentUserId;

  const handleClick = () => {
    navigate(`/recipedetail/${id}`);
  };

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_IMAGE) {
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative card group cursor-pointer overflow-hidden rounded-md shadow-md ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View details for ${title}`}
    >
      <div
        className="h-48 bg-cover bg-center rounded-t-md"
        style={{ 
          backgroundImage: `url(${imgSrc})`,
          backgroundColor: '#f3f4f6' // Light gray fallback
        }}
        role="img"
        aria-label={`Image of ${title}`}
        onError={handleImageError}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-t-md transition duration-300" />

      {/* Edit/Delete buttons */}
      {showActions && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(id);
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Edit recipe"
          >
            <Edit2 size={16} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors hover:bg-red-100"
            aria-label="Delete recipe"
          >
            <Trash2 size={16} className="text-gray-600" />
          </button>
        </div>
      )}

      <div className="p-4">
        {/* Title and Privacy Indicator */}
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-accent-600 transition-colors duration-200">
          {title}
          {isPrivate && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Private
            </span>
          )}
        </h3>
        <p className="text-gray-600 text-sm">
          By {chefName || 'Unknown'}
        </p>

        {/* Category and Time/Servings Info */}
        <p className="text-gray-500 mb-2 line-clamp-1" title={category}>
          {category}
        </p>
        {(prepTime || servings) && (
          <div className="flex items-center text-sm text-gray-500 space-x-6 mt-2">
            {prepTime && (
              <div
                className="flex items-center"
                aria-label={`Preparation time: ${prepTime}`}
              >
                <Clock size={16} className="mr-1" />
                <span>{prepTime}</span>
              </div>
            )}
            {servings && (
              <div
                className="flex items-center"
                aria-label={`${servings} servings`}
              >
                <Users size={16} className="mr-1" />
                <span>{servings} servings</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;

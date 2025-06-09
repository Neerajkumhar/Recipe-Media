import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeadingProps {
  title: string;
  viewAllLink?: string;
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ 
  title, 
  viewAllLink,
  className = '' 
}) => {
  return (
    <div className={`flex justify-between items-center mb-6 ${className}`}>
      <h2 className="text-2xl font-bold">{title}</h2>
      
      {viewAllLink && (
        <Link 
          to={viewAllLink} 
          className="flex items-center text-accent-600 hover:text-accent-700 font-medium"
        >
          View all
          <ChevronRight size={18} className="ml-1" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeading;
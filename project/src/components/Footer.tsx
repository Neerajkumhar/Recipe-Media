import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 text-white py-10 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">mogo</h3>
            <p className="text-gray-300 mb-4">
              Delicious recipes and meal planning made simple for everyone.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" className="text-gray-300 hover:text-accent-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" className="text-gray-300 hover:text-accent-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://facebook.com" className="text-gray-300 hover:text-accent-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://youtube.com" className="text-gray-300 hover:text-accent-500 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-accent-500 transition-colors">Home</Link></li>
              <li><Link to="/recipes" className="text-gray-300 hover:text-accent-500 transition-colors">Recipes</Link></li>
              <li><Link to="/meal-plan" className="text-gray-300 hover:text-accent-500 transition-colors">Meal Plan</Link></li>
              <li><Link to="/grocery-list" className="text-gray-300 hover:text-accent-500 transition-colors">Grocery List</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/recipes?category=breakfast" className="text-gray-300 hover:text-accent-500 transition-colors">Breakfast</Link></li>
              <li><Link to="/recipes?category=lunch" className="text-gray-300 hover:text-accent-500 transition-colors">Lunch</Link></li>
              <li><Link to="/recipes?category=dinner" className="text-gray-300 hover:text-accent-500 transition-colors">Dinner</Link></li>
              <li><Link to="/recipes?category=desserts" className="text-gray-300 hover:text-accent-500 transition-colors">Desserts</Link></li>
              <li><Link to="/recipes?category=vegetarian" className="text-gray-300 hover:text-accent-500 transition-colors">Vegetarian</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Email: hello@mogo.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Cooking St, Food City</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} mogo. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="text-gray-400 hover:text-gray-300 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
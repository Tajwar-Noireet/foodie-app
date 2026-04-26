import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; 


import logoLight from '../assets/images/mobileDark.png';       
import logoDark from '../assets/images/mobileWhite.png';  

export default function MobileHeader({ currentTheme }) {
  return (
    <div className="mobile-header">
      <Link to="/" className="mobile-logo">
        
        {/* 🚨 2. Change <img> to <motion.img> */}
        <motion.img 
          src={currentTheme === 'dark' ? logoDark : logoLight} 
          alt="RecipeApp Logo" 
          
          /* --- THE ANIMATION  --- */
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.9 }}    
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 17 
          }} 
        />
        
      </Link>
      
      <div className="mobile-header-actions">
        {/* <button>🔔</button> */}
      </div>
    </div>
  );
}
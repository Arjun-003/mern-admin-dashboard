import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full py-6 border-t border-gray-200"
      style={{
        background: "linear-gradient(90deg, #FFA000, #FF6F00)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-balck-600 text-sm ml-2">
              &copy; {currentYear} OldGoldSpear Admin Panel. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// PostMenu.jsx
import React, { useState } from "react";
import "../../css/postMenu.css";

export const PostMenu = ({ onPostDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      onPostDelete();
    }
  };

  return (
    <div className="post-menu">
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        &#8942; {/* Три вертикальные точки */}
      </button>
      {isOpen && (
        <ul className="menu-dropdown">
          <li className="menu-item" onClick={handleDeleteClick}>
            Delete
          </li>
        </ul>
      )}
    </div>
  );
};
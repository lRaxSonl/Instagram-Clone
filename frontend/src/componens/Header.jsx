import React from "react";
import "../css/header.css";
import { slugify } from "../utils/slugify";

// Пример аватара по умолчанию
import defaultAvatar from "../img/avatars/default-avatar.png";

export const Header = ({ currentUser }) => {
  if (!currentUser) return null;

  const userSlug = slugify(`${currentUser.username}`);

  return (
    <header className="instagram-header">
      {/* Левая часть — лого или название */}
      <div className="header-left">
        <a className="feed-link" href="/feed"><span className="logo">InstaClone</span></a>
      </div>

      {/* Правая часть — аватар и никнейм */}
      <a href={`/profile/${userSlug}-${currentUser.id}`} className="header-right">
        <img
          src={currentUser.avatar || defaultAvatar}
          alt="avatar"
          className="user-avatar"
        />
        <span className="username">{currentUser.username}</span>
      </a>
    </header>
  );
};
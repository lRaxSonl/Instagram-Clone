import React, { useState } from "react";
import "../css/commentCard.css";
import { ReactComponent as LikeIcon } from "../img/icons/Like_icon.svg";

export const CommentCard = ({ comment }) => {
  const [liked, setLiked] = useState(false); //Состояние лайка для каждого комментария

  const handleLike = () => {
    setLiked((prev) => !prev); //Переключаем состояние лайка
  };

  return (
    <div className="comment-card">
      <img
        src={comment.user.avatar || "/default-avatar.png"}
        alt="avatar"
        className="comment-avatar"
      />
      <div className="comment-content">
        <div className="comment-top">
          <strong className="comment-username">{comment.user.username}</strong>
          <span className="comment-text">{comment.text}</span>
        </div>
        <div className="comment-actions">
          <button
            className={`like-button ${liked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <LikeIcon className={`like-icon ${liked ? "liked" : ""}`} />
          </button>
          {liked && <span className="like-text">Лайкнут</span>}
        </div>
      </div>
    </div>
  );
};

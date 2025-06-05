import React, { useEffect, useState } from "react";
import "../css/postCard.css";
import { BACKEND_SERVER } from "../config";
import { ReactComponent as LikeIcon } from "../img/icons/Like_icon.svg";
import { ReactComponent as CommentIcon } from "../img/icons/Comment_icon.svg";
import defaultAvatar from "../img/avatars/default-avatar.png";
import { likePost, deleteLike } from "../api/likes";
import { CommentCard } from "./CommentCard";
import { PostMenu } from "./forms/PostMenu";
import { deletePost } from "../api/posts";
import { slugify } from "../utils/slugify";

export const PostCard = ({ post, currentUser }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [likeId, setLikeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Проверяем, лайкнул ли текущий пользователь пост
  useEffect(() => {
    if (currentUser) {
      const userLike = post.likes.find(like => like.user === currentUser.id);
      setLiked(!!userLike);
      setLikeId(userLike?.id || null);
    }
  }, [currentUser, post.likes]);

  //Лайк
  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (liked) {
        await deleteLike(likeId);
        setLiked(false);
        setLikesCount(prev => prev - 1);
        setLikeId(null);
      } else {
        const res = await likePost(post.id);
        setLikeId(res.data.id);
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error when changing the like", error);
    } finally {
      setLoading(false);
    }
  };

  //Дабл-клик по изображению — лайк
  const handleDoubleClick = async () => {
    if (!liked) {
      try {
        const res = await likePost(post.id);
        setLikeId(res.data.id);
        setLiked(true);
        setLikesCount(prev => prev + 1);
      } catch (error) {
        console.error("Double-click error", error);
      }
    }
  };

  //Переключение видимости комментариев
  const toggleComments = () => {
    setIsCommentsOpen(prev => !prev);
  };

   //Удаление поста
  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      setIsDeleted(true); //Убираем пост из UI
    } catch (err) {
      console.error("Ошибка при удалении поста:", err);
      alert("Не удалось удалить пост");
    }
  };

  if (isDeleted) {
    return null; //Не рендерим пост, если он удален
  }

  const userSlug = slugify(`${currentUser.username}`);

  return (
    <div className="post-card">
      {/* Заголовок поста: аватар + имя */}
      <div className="post-header">
        <a className="profile-link" href={`/profile/${userSlug}-${currentUser.id}`}>
        <img src={post.user.avatar || defaultAvatar} alt="avatar" className="avatar" />
        <span className="username">{post.user.username}</span>
        </a>
        {/* Меню с три точками */}
        <div className="post-menu-wrapper">
          <PostMenu onPostDelete={handleDeletePost} />
        </div>
      </div>

      {/* Картинка поста */}
      {post.image && (
        <div className="post-image" onDoubleClick={handleDoubleClick}>
          <img src={`${BACKEND_SERVER}${post.image}`} alt="пост" />
        </div>
      )}

      {/* Тело поста: действия, количество лайков, текст */}
      <div className="post-body">
        <div className="post-actions">
          <button className={`like-button ${liked ? "liked" : ""}`} onClick={handleLike} disabled={loading}>
            <LikeIcon className={`like-icon ${liked ? "liked" : ""}`} />
          </button>
          <CommentIcon className="comment-icon" onClick={toggleComments} />
        </div>
        <div className="likes-count">{likesCount} likes</div>
        <div className="post-text">
          <strong>{post.user.username}</strong> {post.text}
        </div>
      </div>

      {/* Блок комментариев */}
      {isCommentsOpen && (
        <CommentCard post={post} currentUser={currentUser} />
      )}
    </div>
  );
};
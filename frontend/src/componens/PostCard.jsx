import React, { useEffect, useState } from "react";
import "../css/postCard.css";
import { BACKEND_SERVER } from "../config";
import { ReactComponent as LikeIcon } from "../img/icons/Like_icon.svg";
import { ReactComponent as CommentIcon } from "../img/icons/Comment_icon.svg";
import { likePost, deleteLike } from "../api/likes";


export const PostCard = ({ post, currentUser }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [likeId, setLikeId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      const userLike = post.likes.find(like => like.user === currentUser.id);
      setLiked(!!userLike);
      setLikeId(userLike?.id || null);
    }
  }, [currentUser, post.likes]);

  const handleLike = async () => {
    try {
      if (liked) {
        //TODO: FIX Broken pipe error

        //Delete like
        await deleteLike(likeId);
        setLiked(false);
        setLikesCount(prev => prev - 1);
        setLikeId(null)
      } else {
        //Add like
        await likePost(post.id).then(res => setLikeId(res.data.id));
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error when added like", error);
    }
  };


    return (
        <div className="post-card">
        {/* Title with username and avatar */}
        <div className="post-header">
          <img src={post.user.avatar || '/default-avatar.png'} alt="avatar" className="avatar" />
          <span className="username">{post.user.username}</span>
        </div>
  
        {/* Post img */}
        {post.image && (
          <div className="post-image">
            <img src={`${BACKEND_SERVER}${post.image}`} alt="post" />
          </div>
        )}
  
        {/* Likes and text */}
        <div className="post-body">
          <div className="post-actions">
          <button className={`like-button ${liked ? 'liked' : ''}`} onClick={handleLike}>
            <LikeIcon className="like-icon" />
          </button>
            <CommentIcon className="comment-icon" />
          </div>
          {likesCount} лайков
          <div className="post-text">
            <strong>{post.user.username}</strong> {post.text}
          </div>
        </div>
  
        {/* Comments */}
        <div className="post-comments">
          {post.comments?.slice(0, 2).map((c) => (
            <div key={c.id} className="comment">
              <strong>{c.user.username}</strong> {c.text}
            </div>
          ))}
          {post.comments?.length > 2 && (
            <button className="show-all-comments">Показать все комментарии</button>
          )}
        </div>
      </div>
    );
}
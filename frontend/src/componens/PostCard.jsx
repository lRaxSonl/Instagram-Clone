import React, { useEffect, useState } from "react";
import "../css/postCard.css";
import { BACKEND_SERVER } from "../config";
import { ReactComponent as LikeIcon } from "../img/icons/Like_icon.svg";
import { ReactComponent as CommentIcon } from "../img/icons/Comment_icon.svg";
import { likePost, deleteLike } from "../api/likes";
import { CommentCard } from "./CommentCard";
import { createPostComment } from "../api/posts";


export const PostCard = ({ post, currentUser }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [likeId, setLikeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);


  useEffect(() => {
    if (currentUser) {
      const userLike = post.likes.find(like => like.user === currentUser.id);
      setLiked(!!userLike);
      setLikeId(userLike?.id || null);
    }
  }, [currentUser, post.likes]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDoubleClick = async () => {
    if (!liked) {
      try {
        await likePost(post.id).then(res => setLikeId(res.data.id));
        setLiked(true);
        setLikesCount(prev => prev + 1);
      } catch (error) {
        console.error("Error when double-click сliking", error);
      }
    }
  };


  const toggleComments = () => {
    setIsCommentsOpen(prev => !prev); //Переключение видимости комментариев
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
  
    try {
      const response = await createPostComment(post.id, { text: newComment });
      const createdComment = response.data;
      setComments(prev => [...prev, createdComment]);
      setNewComment("");
    } catch(err) {
      console.error("Ошибка при отправке комментария:", err);
      };
    }


    return (
        <div className="post-card">
        {/* Title with username and avatar */}
        <div className="post-header">
          <img src={post.user.avatar || '/default-avatar.png'} alt="avatar" className="avatar" />
          <span className="username">{post.user.username}</span>
        </div>
  
        {/* Post img */}
        {post.image && (
          <div className="post-image" onDoubleClick={handleDoubleClick}>
            <img src={`${BACKEND_SERVER}${post.image}`} alt="post" />
          </div>
        )}
  
        {/* Likes and text */}
        <div className="post-body">
          <div className="post-actions">
          <button className={`like-button ${liked ? 'liked' : ''}`} onClick={handleLike}>
            <LikeIcon className={`like-icon ${liked ? "liked" : ""}`} />
          </button>
            <CommentIcon className="comment-icon" onClick={toggleComments} />
          </div>
          {likesCount} лайков
          <div className="post-text">
            <strong>{post.user.username}</strong> {post.text}
          </div>
        </div>
  
         {/* Comments */}
         {isCommentsOpen && (
          <div className="comments-modal">
            <div className="comments-list">
              {post.comments?.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>

            <div className="comment-input-container">
              <input
                type="text"
                placeholder="Добавьте комментарий..."
                className="comment-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="send-comment-button"
                onClick={handleSendComment}
                disabled={!newComment.trim()}
              >
                Отправить
              </button>
            </div>

            <button className="close-comments" onClick={toggleComments}>
              Закрыть комментарии
            </button>
          </div>
        )}

      </div>
    );
}
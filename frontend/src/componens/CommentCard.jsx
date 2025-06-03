import React, { useState, useEffect } from "react";
import "../css/commentCard.css";
import { ReactComponent as LikeIcon } from "../img/icons/Like_icon.svg";
import { createPostComment, getPostComments } from "../api/posts";
import { likeComment, deleteLike } from "../api/likes";
import defaultAvatar from "../img/avatars/default-avatar.png";


export const CommentCard = ({ post, currentUser }) => {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Состояние для лайков комментариев
  const [commentLikes, setCommentLikes] = useState({});

  //Загружаем комментарии при монтировании компонента
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getPostComments(post.id);
        setLocalComments(response.data || []);
      } catch (err) {
        setError("Error uploading comments");
        console.error("Error when uploading comments:", err);
      } finally {
        setLoading(false);
      }
    };

    if (post?.id) {
      fetchComments();
    }
  }, [post.id]);

  //Инициализируем состояния для каждого комментария
  useEffect(() => {
    const initialLikes = {};
    localComments.forEach((comment) => {
      const userLike = comment.likes.find(
        (like) => like.user === currentUser?.id
      );
      initialLikes[comment.id] = {
        liked: !!userLike,
        likesCount: comment.likes.length,
        likeId: userLike?.id || null,
      };
    });
    setCommentLikes(initialLikes);
  }, [localComments, currentUser]);

  //Логика лайка/дизлайка для комментария
  const handleLike = async (comment) => {
    const commentId = comment.id;
    const currentUserId = currentUser?.id;

    if (!currentUserId) {
      alert("Log in to your account to like");
      return;
    }

    const currentState = commentLikes[commentId] || {
      liked: false,
      likesCount: comment.likes.length,
      likeId: null,
    };

    const isLiked = currentState.liked;

    // Предварительно обновляем состояние UI
    setCommentLikes({
      ...commentLikes,
      [commentId]: {
        ...currentState,
        liked: !isLiked,
        likesCount: isLiked
          ? currentState.likesCount - 1
          : currentState.likesCount + 1,
        likeId: isLiked ? null : currentState.likeId,
      },
    });

    try {
      if (isLiked && currentState.likeId) {
        //Удаляем лайк
        await deleteLike(currentState.likeId);

        //Обновляем состояние после удаления
        setCommentLikes((prev) => ({
          ...prev,
          [commentId]: {
            ...prev[commentId],
            liked: false,
            likesCount: prev[commentId].likesCount - 1,
            likeId: null,
          },
        }));
      } else {
        //Ставим новый лайк
        const res = await likeComment(commentId);
        const newLikeId = res.data.id;

        //Обновляем состояние после добавления
        setCommentLikes((prev) => ({
          ...prev,
          [commentId]: {
            ...prev[commentId],
            liked: true,
            likesCount: prev[commentId].likesCount,
            likeId: newLikeId,
          },
        }));
      }
    } catch (error) {
      console.error("Error when changing the like", error);
      alert("Couldn't update like");

      //Откатываем изменения
      setCommentLikes({
        ...commentLikes,
        [commentId]: currentState,
      });
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await createPostComment(post.id, {
        text: newComment,
      });
      const createdComment = response.data;
      setLocalComments((prev) => [createdComment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Error when sending a comment:", err);
    }
  };

  const formatDateShort = (timestamp) => {
    const date = new Date(Date.parse(timestamp));
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  if (loading) return <p>Uploading comments...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="comment-section">
      {/* Список комментариев */}
      <div className="comments-list">
        {localComments.length > 0 ? (
          localComments.map((comment) => {
            const currentLikeState = commentLikes[comment.id] || {
              liked: false,
              likesCount: comment.likes.length,
            };

            const isLiked = currentLikeState.liked;
            const likesCount = currentLikeState.likesCount;

            return (
              <div key={comment.id} className="instagram-comment">
                <img
                  src={comment.user.avatar || defaultAvatar}
                  alt="avatar"
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <strong className="comment-username">
                      {comment.user.username}
                    </strong>
                    <span className="comment-text">{comment.text}</span>
                  </div>
                  <div className="comment-footer">
                    <button
                      className={`like-button ${isLiked ? "liked" : ""}`}
                      onClick={() => handleLike(comment)}
                    >
                      <LikeIcon
                        className={`like-icon ${isLiked ? "liked" : ""}`}
                      />
                    </button>
                    {0<likesCount && <span className="like-count">Likes: {likesCount}</span>}
                    <span className="comment-time">
                      {formatDateShort(comment.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-comments">There are no comments yet</p>
        )}
      </div>

      {/* Поле ввода нового комментария */}
      <div className="comment-input-wrapper">
        <input
          type="text"
          placeholder="Write a comment..."
          className="comment-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="send-button"
          onClick={handleSendComment}
          disabled={!newComment.trim()}
        >
          To publish
        </button>
      </div>
    </div>
  );
};
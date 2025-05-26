import React, { useState, useEffect } from "react";
import "../css/commentCard.css";
import { ReactComponent as LikeIcon } from "../img/icons/Like_icon.svg";
import { createPostComment, getPostComments } from "../api/posts";


export const CommentCard = ({ post }) => {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем комментарии при монтировании компонента
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getPostComments(post.id);
        setLocalComments(response.data || []);
      } catch (err) {
        setError("Ошибка загрузки комментариев");
        console.error("Ошибка при загрузке комментариев:", err);
      } finally {
        setLoading(false);
      }
    };

    if (post?.id) {
      fetchComments();
    }
  }, [post.id]);

  //TODO: Сделать обработку лайка для комментария
  const handleLike = (index) => {
    const updatedComments = [...localComments];
    updatedComments[index].liked = !updatedComments[index].liked;
    setLocalComments(updatedComments);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    try {
      console.log(newComment)
      console.log(post.id)
      const response = await createPostComment(post.id, { text: newComment });
      const createdComment = response.data;
      setLocalComments((prev) => [createdComment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Ошибка при отправке комментария:", err);
    }
  };

  return (
    <div className="comment-section">
      {/* Список комментариев */}
      <div className="comments-list">
        {localComments.length > 0 ? (
          localComments.map((comment, index) => (
            <div key={comment.id} className="instagram-comment">
              <img
                src={comment.user.avatar || "/default-avatar.png"}
                alt="avatar"
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-header">
                  <strong className="comment-username">{comment.user.username}</strong>
                  <span className="comment-text">{comment.text}</span>
                </div>
                <div className="comment-footer">
                  <button
                    className={`like-button ${comment.liked ? "liked" : ""}`}
                    onClick={() => handleLike(index)}
                  >
                    <LikeIcon className={`like-icon ${comment.liked ? "liked" : ""}`} />
                  </button>
                  {comment.liked && <span className="like-count">Нравится</span>}
                  <span className="comment-time">1ч</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-comments">Комментариев пока нет</p>
        )}
      </div>

      {/* Поле ввода нового комментария */}
      <div className="comment-input-wrapper">
        <input
          type="text"
          placeholder="Напишите комментарий..."
          className="comment-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="send-button"
          onClick={handleSendComment}
          disabled={!newComment.trim()}
        >
          Опубликовать
        </button>
      </div>
    </div>
  );
};
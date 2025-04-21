import React from "react";
import "../css/postCard.css"


export const PostCard = ({ post }) => {
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
            <img src={post.image} alt="post" />
          </div>
        )}
  
        {/* Likes and text */}
        <div className="post-body">
          <div className="post-actions">
            ❤️ {post.likes_count} лайков
          </div>
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
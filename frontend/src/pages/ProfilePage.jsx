import { useState, useEffect } from "react";
import { getUser, getUserSubcrtiptions, getUserSubscribers } from "../api/users";
import { getPostsByUser } from "../api/posts";
import { BACKEND_SERVER } from "../config";
import { PostCard } from "../componens/PostCard";
import "../css/profilePage.css";
import defaultAvatar from "../img/avatars/default-avatar.png";
import { useParams } from "react-router-dom";


const ProfilePage = () => {
    const [user, setUser] = useState();
    const [posts, setPosts] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null); //Для модального окна
    const { slug } = useParams();

    const getId = () => {
        let parts = slug.split("-")
        return parts[parts.length - 1]
    }

    useEffect(() => {
        let isMounted = true;

        const fetchData = () => {
            const userId = getId();

            //Получаем профиля
            getUser(userId)
                .then((userRes) => {
                    if (!isMounted) return;
                    setUser(userRes.data);

                    //Параллельно запрашиваем подписчиков и подписки
                    return Promise.all([
                        getUserSubscribers(userId),
                        getUserSubcrtiptions(userId),
                        getPostsByUser(userId)
                    ]);
                })
                .then(([followersRes, followingRes, postsRes]) => {
                    if (!isMounted) return;

                    setSubscribers(followersRes.data || []);
                    setSubscriptions(followingRes.data || []);
                    setPosts(postsRes.data || []);
                })
                .catch((err) => {
                    console.error("Error when uploading data", err);
                    setError("Couldn't upload user data");
                })
                .finally(() => {
                    if (isMounted) setLoading(false);
                });
        };

        fetchData();
    }, []);



    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return <div>User is not found</div>;

    const subscribers_count = subscribers.length;
    const subscriptions_count = subscriptions.length;

    return (
        <div className="profile-container">
            {/* Шапка профиля */}
            <div className="profile-header">
                <img
                    src={user.avatar || defaultAvatar}
                    alt="Аватар"
                    className="profile-avatar"
                />
                <div className="profile-info">
                    <div className="profile-username">{user.username}</div>
                    <div className="profile-stats">
                        <span><strong>{posts.length}</strong> publications</span>
                        <span><strong>{subscribers_count}</strong> subscribers</span>
                        <span><strong>{subscriptions_count}</strong> subscriptions</span>
                    </div>
                    <div className="profile-email">{user.email}</div>
                    <button className="edit-profile-button">Edit Profile</button>
                </div>
            </div>

            {/* Посты */}
            <div className="profile-posts">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.id} className="post-grid-item">
                            <img
                                src={`${BACKEND_SERVER}${post.image}`}
                                alt="Пост"
                                className="post-image"
                                onClick={() => setSelectedPost(post)}
                            />
                        </div>
                    ))
                ) : (
                    <div className="no-posts">Нет публикаций</div>
                )}
            </div>

            {/* Модальное окно */}
            {selectedPost && (
                <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <PostCard post={selectedPost} currentUser={user} />
                    </div>
                </div>
            )}
        </div>
    );
};


export default ProfilePage;
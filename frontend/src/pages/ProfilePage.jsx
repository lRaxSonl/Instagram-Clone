import React, { useState, useEffect } from "react";
import {
    getUser,
    getUserSubcriptions,
    getUserSubscribers,
    getCurrentUser,
    createSubcription,
    deleteSubcription,
} from "../api/users";
import { getPostsByUser } from "../api/posts";
import { BACKEND_SERVER } from "../config";
import { PostCard } from "../componens/PostCard";
import "../css/profilePage.css";
import defaultAvatar from "../img/avatars/default-avatar.png";
import { useParams } from "react-router-dom";
import { Header } from "../componens/Header";
import { jwtDecode } from "jwt-decode";
import AddPostForm from "../componens/forms/AddPostForm"

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null); // Модальное окно поста
    const [isFollowing, setIsFollowing] = useState(false);   // Состояние подписки
    const [isPostFormOpen, setIsPostFormOpen] = useState(false); // Состояние для формы
    const { slug } = useParams();

    // Получаем ID пользователя из URL
    const getId = () => {
        const token = localStorage.getItem("access")
        return jwtDecode(token).user_id
    };

    const handleFollowToggle = async () => {
        const userId = user.id;

        try {
            console.log(isFollowing)
            if (isFollowing) {
                const subscriptionToDelete = subscribers.find(
                    (sub) => sub.subscriber === currentUser.id
                );
                console.log(subscriptionToDelete);

                if (!subscriptionToDelete) return;

                await deleteSubcription(user.id);

                setSubscriptions((prev) =>
                    prev.filter((sub) => sub.id !== subscriptionToDelete.id)
                );
            } else {
                const res = await createSubcription(userId);
                setSubscriptions((prev) => [...prev, res.data]);
            }

            setIsFollowing((prev) => !prev);
        } catch (err) {
            console.error("Ошибка подписки", err);
            alert("Не удалось изменить статус подписки");
        }
    };

      const handlePostCreated = (newPost) => {
        setPosts((prev) => [newPost, ...prev]); // Добавляем новый пост в начало
        setIsPostFormOpen(false); // Закрываем форму
    };

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            const userId = getId();

            if (!userId) {
                setError("Неверный формат URL");
                setLoading(false);
                return;
            }

            try {
                //Загружаем профиль пользователя
                const userRes = await getUser(userId);
                if (!isMounted) return;
                setUser(userRes.data);

                //Параллельно запрашиваем данные
                const [followersRes, followingRes, postsRes, currentUserRes] = await Promise.all([
                    getUserSubscribers(userId),
                    getUserSubcriptions(userId),
                    getPostsByUser(userId),
                    getCurrentUser(),
                ]);

                if (!isMounted) return;

                setSubscribers(followersRes.data || []);
                setSubscriptions(followingRes.data || []);
                setPosts(postsRes.data || []);
                setCurrentUser(currentUserRes.data);

                //Проверяем, подписан ли текущий пользователь
                const isNowFollowing = (followersRes.data || []).some(
                    (subscription) => subscription.subscriber === currentUserRes.data.id
                );
                console.log(isNowFollowing)

                setIsFollowing(isNowFollowing);
            } catch (err) {
                console.error("Ошибка при загрузке данных", err);
                setError("Не удалось загрузить данные пользователя");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    //Обновляем isFollowing при изменении subscriptions или currentUser
    useEffect(() => {
        if (!currentUser || !user) return;

        const isNowFollowing = subscribers.some(
            (sub) => sub.subscriber === currentUser.id
        );

        setIsFollowing(isNowFollowing);
    }, [currentUser, user, subscribers]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return <div>Пользователь не найден</div>;

    const subscribers_count = subscribers.length;
    const subscriptions_count = subscriptions.length;

    return (
        <>
        <Header currentUser={currentUser}/>
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
                        <span><strong>{posts.length}</strong> публикаций</span>
                        <span><strong>{subscribers_count}</strong> подписчиков</span>
                        <span><strong>{subscriptions_count}</strong> подписок</span>
                    </div>
                    <div className="profile-email">{user.email}</div>

                    {/* Кнопка: Подписаться / Отписаться */}
                    {currentUser && currentUser.id !== user.id && (
                        <button
                            className={`subscribe-button ${isFollowing ? "unfollow" : ""}`}
                            onClick={handleFollowToggle}
                            disabled={loading}
                        >
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    )}

                    {/* Кнопка редактирования профиля */}
                    {currentUser && currentUser.id === user.id && (
                        <div className="profile-actions">
                        <button className="profile-button">Редактировать профиль</button>
                        
                        <button className="profile-button create-post-button" onClick={() => setIsPostFormOpen(true)}>Создать пост</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Сетка постов */}
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

            {/* Модальное окно с постом */}
            {selectedPost && (
                <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PostCard post={selectedPost} currentUser={user} />
                    </div>
                </div>
            )}

            <AddPostForm
            isOpen={isPostFormOpen}
            onClose={() => setIsPostFormOpen(false)}
            onPostCreated={handlePostCreated}
            />
        </div>
        </>
    );
};

export default ProfilePage;
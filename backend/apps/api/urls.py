from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [# Аутентификация
    path('token/refresh/', views.CustomRefreshView.as_view(), name='token_refresh'),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/logout/', views.RefreshTokensBlacklist.as_view(), name='logout'),

    # Пользователи
    path('user/register/', views.UserRegisterView.as_view(), name='user_register'),
    path('user/<int:pk>/', views.UserView.as_view(), name='user_detail'),
    path('user/me/', views.UserViewMe.as_view(), name='user_me'),
    path('user/update/', views.UserUpdateView.as_view(), name='user_update'),
    path('user/delete/', views.UserDeleteView.as_view(), name='user_delete'),

    # Посты
    path('posts/', views.PostListView.as_view(), name='post_list'),
    path('posts/user/<int:id>/', views.PostByUserView.as_view(), name='post_by_user'),
    path('posts/create/', views.PostCreateView.as_view(), name='post_create'),
    path('posts/update/<int:pk>/', views.PostUpdateView.as_view(), name='post_update'),
    path('posts/delete/<int:post_id>/', views.PostDeleteView.as_view(), name='post_delete'),
    path('posts/<int:post_id>/comments/', views.PostCommentsView.as_view(), name='post_comments'),
    path('posts/<int:post_id>/comments/create/', views.PostCommentsCreateView.as_view(), name='post_comments_create'),
    path('comments/<int:parent_id>/reply/create/', views.CommentRepliesCreateView.as_view(), name='comment_replies_create'),
    path('comments/update/<int:pk>/', views.CommentsUpdateView.as_view(), name='comments_update'),
    path('comments/delete/<int:comment_id>/', views.CommentsDeleteView.as_view(), name='comments_delete'),

    # Лайки
    path('posts/<int:post_id>/like/add/', views.LikeCreateView.as_view(), name='like_create'),
    path('comment/<int:comment_id>/like/add/', views.LikeCreateView.as_view(), name='comment_like_create'),
    path('like/delete/<int:like_id>/', views.LikeDeleteView.as_view(), name='like_delete'),

    # Подписки
    path('user/<int:user_id>/subscriptions/', views.UserSubscriptionsView.as_view(), name='user_subscriptions'),
    path('user/<int:user_id>/subscribers/', views.UserSubscribersView.as_view(), name='user_subscribers'),
    path('subscription/create/<int:user_id>/', views.SubscriptionCreateView.as_view(), name='subscription_create'),
    path('subscription/delete/<int:user_id>/', views.SubscriptionDeleteView.as_view(), name='subscription_delete'),

]
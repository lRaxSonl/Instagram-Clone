from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

from . import views

urlpatterns = [
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  #Обновление токена
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),



    path('user/register/', views.UserRegisterView.as_view()),
    path('user/update/', views.UserUpdateView.as_view()),
    path('user/delete/', views.UserDeleteView.as_view()),

    path('posts/', views.PostListView.as_view()),
    path('posts/create/', views.PostCreateView.as_view()),
    path('posts/update/<pk>/', views.PostUpdateView.as_view()),
    path('posts/delete/<post_id>/', views.PostDeleteView.as_view()),
    path('posts/<int:post_id>/comments/', views.PostCommentsView.as_view()),
    path('posts/<int:post_id>/comments/create/', views.PostCommentsCreateView.as_view()),
    path('comments/<int:parent_id>/reply/create/', views.CommentRepliesCreateView.as_view()),
    path('comments/update/<int:pk>/', views.CommentsUpdateView.as_view()),
    path('comments/delete/<int:comment_id>/', views.CommentsDeleteView.as_view()),

    path('post/<post_id>/like/add/', views.LikeCreateView.as_view()),
    path('comment/<comment_id>/like/add/', views.LikeCreateView.as_view()),
    path('like/delete/<like_id>/', views.LikeDeleteView.as_view()),

    path('user/<user_id>/subscribers/', views.SubscribersView.as_view()),
    path('subscribe/create/<user_id>/', views.SubscribeCreateView.as_view()),
    path('subscribe/delete/<user_id>/', views.SubscribeDeleteView.as_view()),


]
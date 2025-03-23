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
]
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

from . import views

urlpatterns = [
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  #Обновление токена
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),



    path('user/register/', views.UserRegisterView.as_view()),

    path('posts/all/', views.PostListView.as_view()),
    path('posts/create/', views.PostCreate.as_view()),
]
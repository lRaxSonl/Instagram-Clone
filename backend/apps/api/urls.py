from django.urls import path
from . import views


urlpatterns = [
    path('posts/all', views.PostListView.as_view()),
]
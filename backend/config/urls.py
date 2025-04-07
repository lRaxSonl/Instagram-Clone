from django.contrib import admin
from django.urls import path, include

from apps import users, posts

urlpatterns = [
    #path('admin/', admin.site.urls),
    path('api/', include('apps.api.urls')),
]

from django.contrib import admin
from django.conf.urls.static import static
from django.urls import path, include

from apps import users, posts
from config import settings

urlpatterns = [
    #path('admin/', admin.site.urls),
    path('api/v1/', include('apps.api.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
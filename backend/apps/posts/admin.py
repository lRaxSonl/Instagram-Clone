from django.contrib import admin

from apps.posts.models import Post, Comment, Like

admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Like)

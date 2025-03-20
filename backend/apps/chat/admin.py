from django.contrib import admin
from apps.chat.models import Message, Chat

admin.site.register(Chat)
admin.site.register(Message)

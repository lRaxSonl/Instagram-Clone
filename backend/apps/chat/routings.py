from django.urls import re_path

from apps.chat.consumer import ChatConsumer

websocket_patterns = [
    re_path('ws/chat/<int:chat_id>/', ChatConsumer.as_asgi()),
]
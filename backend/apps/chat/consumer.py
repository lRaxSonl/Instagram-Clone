import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model

from apps.chat.models import Chat, Message

user = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data=None):
        data = json.loads(text_data)
        user = self.scope['user']
        text = data.get('message')

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': text,
                'username': user.username
            }
        )

        async def chat_message(self, event):
            await self.send(text_data=json.dumps({
                'message': event['message'],
                'username': event['username']
            }))

        @database_sync_to_async
        def save_message(self, user, text):
            chat = Chat.objects.filter(chat_id=user.chat_id)
            return Message.objects.create(user=user, chat=chat, text=text)
from django.db import models
from apps.common.models import AbstractModel
from config import settings


class Chat(AbstractModel):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chats_as_user1')
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chats_as_user2')

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f'Chat between {self.user1} and {self.user2}'

class Message(AbstractModel):
    text = models.TextField(null=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

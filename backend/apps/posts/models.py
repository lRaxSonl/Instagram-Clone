import os
from datetime import datetime
import random
import string
from config import settings
from django.db import models
from apps.users.models import User
from apps.common.models import AbstractModel

def make_path_to_file(instance, filename):
    year = datetime.now().year

    unique_filename = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6)) + f'_{filename}'

    return os.path.join(settings.MEDIA_ROOT, str(year), unique_filename)

class Post(AbstractModel):
    image = models.ImageField(upload_to=make_path_to_file, null=True, blank=True)
    text = models.TextField(null=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, related_name='posts')

    def __str__(self):
        return f'Post {self.id} by {self.user}'


class Comment(AbstractModel):
    text = models.TextField(null=False, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True)
    parent = models.ForeignKey('self', null=True,
                               related_name='replies', on_delete=models.CASCADE)


    def __str__(self):
        return f'Comment {self.id} by {self.user}'


class Like(AbstractModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False)
    post = models.ForeignKey(Post, related_name='likes', on_delete=models.CASCADE, null=True)
    comment = models.ForeignKey(Comment, related_name='likes', on_delete=models.CASCADE, null=True)

    class Meta:
        unique_together = (('user', 'post'), ('user', 'comment'))


    def __str__(self):
        return f'Like by {self.user}'


from django.contrib import admin
from apps.users.models import User, Subscription

admin.site.register(User)
admin.site.register(Subscription)
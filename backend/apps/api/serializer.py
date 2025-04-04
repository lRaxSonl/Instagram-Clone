from django.contrib.auth.hashers import make_password
from django.db.migrations import serializer
from django.template.context_processors import request
from django.utils.timezone import now
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from tutorial.quickstart.serializers import UserSerializer
from apps.posts.models import Post, Comment, Like
from apps.users.models import User, Subscription


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username

        user.last_login = now()
        user.save(update_fields=['last_login'])
        return token

    # def validate(self, attrs):
    #     data = super().validate(attrs)
    #     data['username'] = self.user.username
    #     return data


#Post list
class PostSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    likes = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'text', 'image', 'user', 'created_at', 'updated_at', 'likes')

    def get_likes(self, obj):
        likes = Like.objects.filter(post=obj)
        return LikeSerializer(likes, many=True).data
        #return obj.likes.values_list('user_id', flat=True)

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')

        if not request.user or not request.user.is_authenticated:
            raise serializers.ValidationError("You are not authenticated")

        if instance.user != request.user:
            raise serializers.ValidationError("You can only edit your own posts")

        for attr, value in validated_data.items():
            setattr(instance, attr, value) #обновляет поле attr новым значением value.

        instance.save()
        return instance



class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(allow_null=True, required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar', 'password')

    def validate_email(self, value):
        """Проверяем, существует ли уже пользователь с таким email."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already in use.')
        return value

    def validate_username(self, value):
        """Проверяем, существует ли уже пользователь с таким username."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already in use.')
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """Обновление данных пользователя."""

        request = self.context.get('request') #Получаем запрос

        if request.user != instance.user:
            raise serializers.ValidationError('You can only update your own account.')

        for attr, value in validated_data.items():
            if attr == "password":
                value = make_password(value)
            setattr(instance, attr, value)

        instance.save()
        return instance



class CommentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    replies = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'post', 'parent', 'replies', 'likes']


    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True).data

    def get_likes(self, obj):
        likes = obj.likes.all()
        return LikeSerializer(likes, many=True).data

    def validate(self, validated_data):
        post = self.context.get("post")
        parent = self.context.get("parent")
        request = self.context.get('request')

        if request and request.method == 'POST':
            if not post and not parent:
                raise serializers.ValidationError("You have to specify a post or a replies.")

        return validated_data



    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            raise serializers.ValidationError("You are not authenticated")

        # post = validated_data.get('post')
        # parent = validated_data.get('parent')
        #
        # if not post and not parent:
        #     raise serializers.ValidationError("You have to specify a post or a replies.")

        validated_data['user'] = user

        return Comment.objects.create(**validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            raise serializers.ValidationError("You are not authenticated")

        if instance.user != user:
            raise serializers.ValidationError("You can only edit your own comments.")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance



class LikeSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(default=serializers.CurrentUserDefault(),
                                   required=False,
                                   read_only=True)
    #target = serializers.SerializerMethodField()
    # comment = serializers.PrimaryKeyRelatedField(required=False, read_only=True)
    # post = serializers.PrimaryKeyRelatedField(required=False, read_only=True)

    class Meta:
        model = Like
        fields = ('id', 'user')

    # def get_target(self, obj):
    #     if obj.post:
    #         return {'post': obj.post.id}
    #     elif obj.comment:
    #         return {'comment': obj.comment.id}
    #     return None

    def get_user(self, obj):
        return obj.user.id

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user if request else None

        if not request.user or not user.is_authenticated:
            raise serializers.ValidationError("You are not authenticated")

        post = validated_data.get("post")
        comment = validated_data.get("comment")

        if not post and not comment:
            raise serializers.ValidationError("You must specify either a post or a comment to like.")

        if post and comment:
            raise serializers.ValidationError("You cannot like both a post and a comment at the same time.")

        if post and Like.objects.filter(user=user, post=post).first():
            raise serializers.ValidationError("You have already liked this post.")

        if comment and Like.objects.filter(user=user, comment=comment).first():
            raise serializers.ValidationError("You have already liked this comment.")


        validated_data["user"] = user
        return super().create(validated_data)


#TODO: Fix
class SubscriptionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    subscriber = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Subscription
        fields = ('id', 'user', 'subscriber')

    '''User - текущий пользователь сайта, а data['user'] это пользователь
     на которого подписываюстся'''
    def validate(self, data):
        request = self.context.get("request")
        user = getattr(request, 'user', None)

        if not user or not user.is_authenticated:
            raise serializers.ValidationError("You are not authenticated")

        if data["user"] == user:
            raise serializers.ValidationError("You cannot subscribe to yourself.")

        if Subscription.objects.filter(subscriber=user, user=data['user']).exists():
            raise serializers.ValidationError("You are already subscribed.")

        return data

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        validated_data["subscriber"] = user

        return super().create(validated_data)

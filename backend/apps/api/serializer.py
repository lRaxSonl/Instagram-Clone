from django.contrib.auth.hashers import make_password
from django.template.context_processors import request
from django.utils.timezone import now
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from tutorial.quickstart.serializers import UserSerializer
from apps.posts.models import Post
from apps.users.models import User


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


"""TODO: Разобраться как это работает"""
#Post list
class PostSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Post
        fields = '__all__'



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
        """Создание пользователя с хешированным паролем."""
        validated_data['password'] = make_password(validated_data.pop('password', None))
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """Обновление данных пользователя."""

        request = self.context.get('request') #Получаем запрос

        if request and request.user != instance.user:
            raise serializers.ValidationError('You can only update your own account.')

        for attr, value in validated_data.items():
            if attr == "password":
                value = make_password(value)
            setattr(instance, attr, value)

        instance.save()
        return instance


    def delete(self, instance, validated_data):
        request = self.context.get('request')
        if request and request.user != instance.user:
            raise serializers.ValidationError('You can only delete your own account.')
        instance.delete()
        return instance
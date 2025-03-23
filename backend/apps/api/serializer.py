from django.contrib.auth.hashers import make_password
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
    user = UserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = '__all__'



#Post create
class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)




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
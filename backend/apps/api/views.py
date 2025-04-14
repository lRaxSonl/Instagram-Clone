from django.views.generic import CreateView
from rest_framework import status, viewsets, serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import UpdateAPIView, CreateAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializer import PostSerializer, CustomTokenObtainPairSerializer, UserSerializer, CommentSerializer, \
    LikeSerializer, SubscriptionSerializer

from rest_framework.response import Response
from rest_framework.views import APIView

from apps.posts.models import Post, Comment, Like
from ..users.models import User, Subscription


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer




class PostListView(APIView):
    def get(self, request):
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)


class PostCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostUpdateView(UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        post = self.get_object()

        if post.user != self.request.user:
            raise PermissionDenied("You can edit only your own post")

        serializer.save()

class PostDeleteView(APIView):
    permission_classes = [IsAuthenticated]


    def delete(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)

        if post.user != self.request.user:
            raise PermissionDenied("You can edit only your own posts")

        post.delete()
        return Response({"detail":"Success deleted"}, status=status.HTTP_204_NO_CONTENT)



class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserView(APIView):
    def get(self, request, id):
        serializer = UserSerializer(get_object_or_404(User, id=id))
        return Response(serializer.data)


class UserUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_object(self):
        return self.request.user


# class UserUpdateView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def put(self, request):
#         user = request.user
#         serializer = UserSerializer(user, data=request.data, partial=True)
#
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]


    def delete(self, request):
        user = self.request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class PostCommentsView(APIView):
    def get(self, request, post_id):
        comments = Comment.objects.filter(post_id=post_id, parent__isnull=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PostCommentsCreateView(CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        """Добавляем post в контекст сериализатора"""
        context = super().get_serializer_context()
        post_id = self.kwargs.get("post_id")
        post = get_object_or_404(Post, id=post_id)
        context["post"] = post
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, post=self.get_serializer_context()["post"])


class CommentsUpdateView(UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    queryset = Comment.objects.all()

    def get_object(self):
        return super().get_object()

    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.user != self.request.user:
            raise PermissionDenied("You can edit only your own comment")

        serializer.save()


class CommentsDeleteView(APIView):
    permission_classes = [IsAuthenticated]


    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)

        if comment.user != self.request.user:
            raise PermissionDenied("You can edit only your own comments")

        comment.delete()
        return Response({"detail":"Success deleted"}, status=status.HTTP_204_NO_CONTENT)



class CommentRepliesCreateView(CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]


    def get_serializer_context(self):
        """Добавляем parent в контекст сериализатора"""
        context = super().get_serializer_context()
        parent_id = self.kwargs.get("parent_id")
        parent = get_object_or_404(Comment, id=parent_id)
        context["parent"] = parent
        return context

    def perform_create(self, serializer):
        parent = self.get_serializer_context()['parent']
        serializer.save(user=self.request.user, parent=parent, post=parent.post)



# class LikeView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request, post_id):
#         post = get_object_or_404(Post, id=post_id)
#
#         comments = Like.objects.filter(post=post_id)
#         serializer = LikeSerializer(comments, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


class LikeCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LikeSerializer

    def perform_create(self, serializer):
        post_id = self.kwargs.get("post_id")
        comment_id = self.kwargs.get("comment_id")
        user = self.request.user

        post = Post.objects.filter(id=post_id).first()
        comment = Comment.objects.filter(id=comment_id).first()

        if not post and not comment:
            raise serializers.ValidationError("You have to specify a valid post or a comment.")

        if post and Like.objects.filter(user=user, post=post).exists():
            raise serializers.ValidationError("You have already liked this post.")

        if comment and Like.objects.filter(user=user, comment=comment).exists():
            raise serializers.ValidationError("You have already liked this comment.")

        serializer.save(user=user, post=post, comment=comment)


class LikeDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, like_id):
        like = get_object_or_404(Like, id=like_id)

        if like.user != self.request.user:
            raise PermissionDenied("You can delete only your own like")

        like.delete()
        return Response({"detail":"Success deleted"}, status=status.HTTP_204_NO_CONTENT)


#Подписки пользователя
class UserSubscriptionsView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionSerializer

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        subscriptions = Subscription.objects.filter(subscriber=user)
        serializer = SubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

#Подписчики пользователя
class UserSubscribersView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionSerializer

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        subscribers = Subscription.objects.filter(user=user)
        serializer = SubscriptionSerializer(subscribers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SubscriptionCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionSerializer

    def create(self, request, *args, **kwargs):
        user_id = self.kwargs.get("user_id")
        subscribe_to_user = get_object_or_404(User, id=user_id)

        if subscribe_to_user == request.user:
            raise PermissionDenied("You can not subscribe to your own profile")

        serializer = self.get_serializer(
            data={"user": subscribe_to_user.id},
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)  #теперь вызываем с уже готовым сериализатором
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(subscriber=self.request.user)


class SubscriptionDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        subscribe = Subscription.objects.filter(user=user_id, subscriber=self.request.user).first()

        if not subscribe:
            raise PermissionDenied("You were not subscribed to this user")

        subscribe.delete()
        return Response({"detail":"Success deleted"}, status=status.HTTP_204_NO_CONTENT)




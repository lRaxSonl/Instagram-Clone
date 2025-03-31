from django.views.generic import CreateView
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import UpdateAPIView, CreateAPIView, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializer import PostSerializer, CustomTokenObtainPairSerializer, UserSerializer, CommentSerializer

from rest_framework.response import Response
from rest_framework.views import APIView

from apps.posts.models import Post, Comment
from ..users.models import User


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

class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



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
        return Response(status=status.HTTP_204_NO_CONTENT)





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
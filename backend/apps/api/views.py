from .serializer import PostSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.posts.models import Post


class PostListView(APIView):
    def get(self, request):
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)
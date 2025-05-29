from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, filters
from .serializers import UserSerializer, PostSerializer, CategorySerializer, CommentSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Post, Category, Comment
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

# Create your views here.
# USER VIEWS
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow any user to create an account

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# POST VIEWS
class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content','category__name','user__username']
    permission_classes = [IsAuthenticatedOrReadOnly]  # This handles both cases properly
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    parser_classes = [MultiPartParser, FormParser]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def perform_update(self, serializer):
        # Only allow the owner of the post to update it
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only update your own posts.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Allow post owner or admin to delete
        if instance.user != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own posts or you must be an admin.")
        instance.delete()

class PostsByCategoryView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]  # Add this line to allow unauthenticated access
    
    def get_queryset(self):
        category_name = self.kwargs['category_name']
        return Post.objects.filter(category__name=category_name)

# CATEGORY VIEWS
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# COMMENTS VIEWS
class PostCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post__id=post_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post_instance = Post.objects.get(id=post_id)
        serializer.save(user=self.request.user, post=post_instance)
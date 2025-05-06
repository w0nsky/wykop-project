from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Category, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class PostSerializer(serializers.ModelSerializer):
    comment_count = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ['id', 'user', 'title', 'content', 'created_at', 'category','image','comment_count']
        read_only_fields = ['id', 'user', 'created_at']
    def get_comment_count(self, obj):
        return obj.comments.count()

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
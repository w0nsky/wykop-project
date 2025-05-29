from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Post, Category, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'is_staff', 'is_superuser']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class PostSerializer(serializers.ModelSerializer):
    comment_count = serializers.SerializerMethodField()
    category = serializers.SlugRelatedField(
        queryset=Category.objects.all(),
        slug_field='name'  # <-- tutaj zamiast ID, pokaże nazwę kategorii
    )
    class Meta:
        model = Post
        fields = ['id', 'user', 'title', 'content', 'created_at', 'category','image','comment_count','slug']
        read_only_fields = ['id', 'user', 'created_at', 'slug']
    
    def get_comment_count(self, obj):
        return obj.comments.count()
    
    def get_category(self,obj):
        return obj.category.name 
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data.get("image"):
            data["image"] = "https://storagewykop.blob.core.windows.net/media/post/placeholder.webp"
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_user(self, obj):
        return obj.user.username
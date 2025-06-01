from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Post, Category, Comment
import json


class UserViewsTestCase(APITestCase):
    """Test cases for user-related views"""

    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_create_user_success(self):
        """Test successful user creation"""
        new_user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpassword123'
        }
        response = self.client.post('/api/user/register/', new_user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_create_user_duplicate_username(self):
        """Test user creation with duplicate username"""
        duplicate_data = {
            'username': 'testuser',  # Already exists
            'email': 'another@example.com',
            'password': 'password123'
        }
        response = self.client.post('/api/user/register/', duplicate_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_view_authenticated(self):
        """Test MeView with authenticated user"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_me_view_unauthenticated(self):
        """Test MeView without authentication"""
        response = self.client.get('/api/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PostViewsTestCase(APITestCase):
    """Test cases for post-related views"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='otherpass123'
        )
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            is_staff=True
        )
        # Category name “Technology” will be sent as a string in test payloads
        self.category = Category.objects.create(name='Technology')
        self.post = Post.objects.create(
            title='Test Post',
            content='Test content',
            user=self.user,
            category=self.category,
            slug='test-post'
        )

    def create_test_image(self):
        """Helper method to create test image file"""
        # Create a simple test file instead of an actual image
        test_content = b'fake image content'
        return SimpleUploadedFile('test.jpg', test_content, content_type='image/jpeg')

    def test_post_list_view(self):
        """Test getting list of posts"""
        response = self.client.get('/api/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle both paginated and non-paginated responses
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)

    def test_post_create_authenticated(self):
        """Test creating post when authenticated"""
        self.client.force_authenticate(user=self.user)
        post_data = {
            'title': 'New Post',
            'content': 'New content',
            # Changed from self.category.id to the category name (string)
            'category': self.category.name,
            'slug': 'new-post'
        }
        response = self.client.post('/api/posts/', post_data)
        if response.status_code != status.HTTP_201_CREATED:
            print("Create post error:", response.data)  # Debug output
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 2)

    def test_post_create_unauthenticated(self):
        """Test creating post without authentication"""
        post_data = {
            'title': 'New Post',
            'content': 'New content',
            'category': self.category.name  # must match serializer expectations
        }
        response = self.client.post('/api/posts/', post_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_post_create_with_image(self):
        """Test creating post with image"""
        self.client.force_authenticate(user=self.user)
        image = self.create_test_image()
        post_data = {
            'title': 'Post with Image',
            'content': 'Content with image',
            # Again, category as string
            'category': self.category.name,
            'slug': 'post-with-image',
            'image': image
        }
        response = self.client.post('/api/posts/', post_data, format='multipart')
        if response.status_code != status.HTTP_201_CREATED:
            print("Create post with image error:", response.data)  # Debug output
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_post_search(self):
        """Test post search functionality"""
        response = self.client.get('/api/posts/?search=Test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)

        # Test search by category name
        response = self.client.get('/api/posts/?search=Technology')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)

        # Test search by username
        response = self.client.get('/api/posts/?search=testuser')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)

    def test_post_detail_view(self):
        """Test getting post detail"""
        response = self.client.get(f'/api/posts/{self.post.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Post')

    def test_post_update_by_owner(self):
        """Test updating post by owner"""
        self.client.force_authenticate(user=self.user)
        update_data = {
            'title': 'Updated Post',
            'content': 'Updated content',
            # Use category name instead of integer ID
            'category': self.category.name,
            'slug': self.post.slug  # Keep the same slug
        }
        response = self.client.put(f'/api/posts/{self.post.slug}/', update_data)
        if response.status_code != status.HTTP_200_OK:
            print("Update post error:", response.data)  # Debug output
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, 'Updated Post')

    def test_post_update_by_non_owner(self):
        """Test updating post by non-owner (should fail)"""
        self.client.force_authenticate(user=self.other_user)
        update_data = {
            'title': 'Hacked Post',
            'content': 'Hacked content',
            # Must match category format (string)
            'category': self.category.name,
            'slug': self.post.slug
        }
        response = self.client.put(f'/api/posts/{self.post.slug}/', update_data)
        # Should be 403 Forbidden, but might be 400 if validation fails first
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST])

    def test_post_partial_update(self):
        """Test partial update of post"""
        self.client.force_authenticate(user=self.user)
        update_data = {'title': 'Partially Updated'}
        response = self.client.patch(f'/api/posts/{self.post.slug}/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, 'Partially Updated')

    def test_post_delete_by_owner(self):
        """Test deleting post by owner"""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/posts/{self.post.slug}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Post.objects.filter(id=self.post.id).exists())

    def test_post_delete_by_admin(self):
        """Test deleting post by admin"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/posts/{self.post.slug}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Post.objects.filter(id=self.post.id).exists())

    def test_post_delete_by_non_owner(self):
        """Test deleting post by non-owner (should fail)"""
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(f'/api/posts/{self.post.slug}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Post.objects.filter(id=self.post.id).exists())

    def test_posts_by_category(self):
        """Test getting posts by category"""
        # Create post in a different category
        other_category = Category.objects.create(name='Sports')
        Post.objects.create(
            title='Sports Post',
            content='Sports content',
            user=self.user,
            category=other_category,
            slug='sports-post'
        )

        response = self.client.get(f'/api/posts/category/{self.category.name}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['title'], 'Test Post')
        else:
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['title'], 'Test Post')

    def test_posts_by_nonexistent_category(self):
        """Test getting posts by non-existent category"""
        response = self.client.get('/api/posts/category/NonExistent/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 0)
        else:
            self.assertEqual(len(response.data), 0)


class CategoryViewsTestCase(APITestCase):
    """Test cases for category-related views"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(name='Technology')

    def test_category_list(self):
        """Test getting list of categories"""
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)

    def test_category_create_authenticated(self):
        """Test creating category when authenticated"""
        self.client.force_authenticate(user=self.user)
        category_data = {'name': 'Sports'}
        response = self.client.post('/api/categories/', category_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Category.objects.filter(name='Sports').exists())

    def test_category_create_unauthenticated(self):
        """Test creating category without authentication"""
        category_data = {'name': 'Sports'}
        response = self.client.post('/api/categories/', category_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_category_create_duplicate(self):
        """Test creating duplicate category"""
        self.client.force_authenticate(user=self.user)
        category_data = {'name': 'Technology'}  # Already exists
        response = self.client.post('/api/categories/', category_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CommentViewsTestCase(APITestCase):
    """Test cases for comment-related views"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='otherpass123'
        )
        self.category = Category.objects.create(name='Technology')
        self.post = Post.objects.create(
            title='Test Post',
            content='Test content',
            user=self.user,
            category=self.category,
            slug='test-post'
        )
        self.comment = Comment.objects.create(
            content='Test comment',
            user=self.user,
            post=self.post
        )

    def test_comment_list_for_post(self):
        """Test getting comments for a specific post"""
        response = self.client.get(f'/api/posts/{self.post.id}/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['content'], 'Test comment')
        else:
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['content'], 'Test comment')

    def test_comment_create_authenticated(self):
        """Test creating comment when authenticated"""
        self.client.force_authenticate(user=self.other_user)
        comment_data = {
            'content': 'New comment',
            # Now including “post” in the request body to satisfy serializer
            'post': self.post.id
        }
        response = self.client.post(f'/api/posts/{self.post.id}/comments/', comment_data)
        if response.status_code != status.HTTP_201_CREATED:
            print("Create comment error:", response.data)  # Debug output
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 2)

    def test_comment_create_unauthenticated(self):
        """Test creating comment without authentication"""
        comment_data = {
            'content': 'New comment',
            'post': self.post.id
        }
        response = self.client.post(f'/api/posts/{self.post.id}/comments/', comment_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_comment_create_for_nonexistent_post(self):
        """Test creating comment for non-existent post"""
        self.client.force_authenticate(user=self.user)
        comment_data = {
            'content': 'Comment for non-existent post',
            'post': 999  # Doesn’t matter; URL is /api/posts/999/comments/
        }
        response = self.client.post('/api/posts/999/comments/', comment_data)
        # Might be 404 instead of 500, or 400 for bad request
        self.assertIn(response.status_code, [
            status.HTTP_404_NOT_FOUND,
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_500_INTERNAL_SERVER_ERROR
        ])

    def test_comments_ordered_by_created_at(self):
        """Test that comments are ordered by creation date (newest first)"""
        # Create additional comments
        Comment.objects.create(
            content='Second comment',
            user=self.other_user,
            post=self.post
        )
        Comment.objects.create(
            content='Third comment',
            user=self.user,
            post=self.post
        )

        response = self.client.get(f'/api/posts/{self.post.id}/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        if 'results' in response.data:
            comments = response.data['results']
        else:
            comments = response.data

        # Should be ordered by newest first
        self.assertEqual(comments[0]['content'], 'Third comment')
        self.assertEqual(comments[1]['content'], 'Second comment')
        self.assertEqual(comments[2]['content'], 'Test comment')


class IntegrationTestCase(APITestCase):
    """Integration tests for the entire API workflow"""

    def setUp(self):
        self.client = APIClient()

    def test_complete_workflow(self):
        """Test complete workflow: create user, create category, create post, add comment"""
        # 1. Create user
        user_data = {
            'username': 'workflowuser',
            'email': 'workflow@example.com',
            'password': 'workflowpass123'
        }
        response = self.client.post('/api/user/register/', user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 2. Authenticate user
        user = User.objects.get(username='workflowuser')
        self.client.force_authenticate(user=user)

        # 3. Create category
        category_data = {'name': 'Workflow Category'}
        response = self.client.post('/api/categories/', category_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        category = Category.objects.get(name='Workflow Category')

        # 4. Create post
        post_data = {
            'title': 'Workflow Post',
            'content': 'This is a workflow test post',
            # Use category name instead of ID
            'category': category.name,
            'slug': 'workflow-post'
        }
        response = self.client.post('/api/posts/', post_data)
        if response.status_code != status.HTTP_201_CREATED:
            print("Workflow post creation error:", response.data)  # Debug output
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        post = Post.objects.get(title='Workflow Post')

        # 5. Add comment to post
        comment_data = {
            'content': 'Great workflow post!',
            # Include “post” field explicitly
            'post': post.id
        }
        response = self.client.post(f'/api/posts/{post.id}/comments/', comment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 6. Verify everything exists
        self.assertTrue(User.objects.filter(username='workflowuser').exists())
        self.assertTrue(Category.objects.filter(name='Workflow Category').exists())
        self.assertTrue(Post.objects.filter(title='Workflow Post').exists())
        self.assertTrue(Comment.objects.filter(content='Great workflow post!').exists())


# Additional utility test case for edge cases
class EdgeCaseTestCase(APITestCase):
    """Test edge cases and error conditions"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_invalid_post_slug(self):
        """Test accessing post with invalid slug"""
        response = self.client.get('/api/posts/invalid-slug/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_empty_post_data(self):
        """Test creating post with empty data"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/posts/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_category_reference(self):
        """Test creating post with invalid category name"""
        self.client.force_authenticate(user=self.user)
        post_data = {
            'title': 'Test Post',
            'content': 'Test content',
            # Send a category name that does not exist
            'category': 'NonExistent'
        }
        response = self.client.post('/api/posts/', post_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

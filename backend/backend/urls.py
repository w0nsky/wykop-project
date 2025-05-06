from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, PostListCreateView, PostDetailView, CategoryListCreateView, PostCommentListCreateView, MeView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path("api-auth/", include("rest_framework.urls")),
    path('api/posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('api/posts/<slug:slug>/', PostDetailView.as_view(), name='post-detail'),
    path('api/categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('api/posts/<int:post_id>/comments/', PostCommentListCreateView.as_view(), name='post-comments'),
    path('api/me/', MeView.as_view(), name='me'),
]

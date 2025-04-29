from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, PostListCreateView, PostDetailView, CategoryListCreateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path("api-auth/", include("rest_framework.urls")),
    path('api/posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('api/posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('api/categories/', CategoryListCreateView.as_view(), name='category-list-create'),


]

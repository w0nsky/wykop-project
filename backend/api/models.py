from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from unidecode import unidecode
from django.db.models import Count

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'categories'

    def __str__(self):
        return self.name

class Post(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='posts',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.FileField(upload_to='post/', null=True, blank=True, default='post/placeholder.webp')
    slug = models.SlugField(unique=True,blank=True) #unique=True,

    class Meta:
        db_table = 'posts'

    def __str__(self):
        return self.title
    
    #Obsługa slugów
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(unidecode(self.title))
            slug = base_slug
            counter = 1

            while Post.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

class Comment(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comments'

    def __str__(self):
        return f"Comment by {self.user} on {self.post}"


from django.db import models


class NewsPost(models.Model):

    created_at = models.DateTimeField(auto_now_add=True)

    short_desc = models.TextField(blank=True, null=True, default=None)
    description = models.TextField(blank=True, null=True, default=None)

    url_slug = models.TextField(blank=False, null=False, unique=True)
    blog_content_preview = models.TextField(blank=True, null=True, default=None)
    blog_content = models.TextField(blank=True, null=True, default=None)
    post_image = models.TextField(blank=True, null=True, default=None)

    author = models.TextField(blank=True, null=True, default=None)

    category = models.TextField(blank=True, null=True, default=None)

    def __str__(self) -> str:
        desc = self.short_desc if self.short_desc else self.description
        return f'{desc} - {self.created_at}'

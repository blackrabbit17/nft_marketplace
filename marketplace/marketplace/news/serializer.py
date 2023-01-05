import arrow
from news.models import NewsPost


def serialize_newspost(np: NewsPost) -> dict:
    if np is None:
        return None
    
    return {'id': np.id, 
            'created_at': str(np.created_at),
            'created_at_human': arrow.get(np.created_at).humanize(),
            'short_desc': np.short_desc,
            'description': np.description,
            'url_slug': np.url_slug,
            'author': np.author,
            'category': np.category,
            'blog_content_preview': np.blog_content_preview,
            'blog_content': np.blog_content,
            'post_image': np.post_image}

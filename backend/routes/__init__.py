from .home import home_bp
from .images import remove_bg_bp
from .donations import donations_bp

# Export all blueprints for easy importing
__all__ = ['home_bp', 'remove_bg_bp', 'donations_bp']

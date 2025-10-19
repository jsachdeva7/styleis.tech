from .home import home_bp
from .images import remove_bg_bp
from .clothes import clothes_bp
from .weather import weather_bp
from .locations import locations_bp

# Export all blueprints for easy importing
__all__ = ['home_bp', 'remove_bg_bp', 'clothes_bp', 'weather_bp', 'locations_bp']

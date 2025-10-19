from .home import home_bp

from .clothes import clothes_bp
from .weather import weather_bp
from .locations import locations_bp
from .donations import donations_bp

# Export all blueprints for easy importing
__all__ = ['home_bp', 'clothes_bp', 'weather_bp', 'locations_bp', 'donations_bp']

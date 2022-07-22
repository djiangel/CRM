from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt import views as jwt_views
from django.views.generic.base import TemplateView

urlpatterns = [
    path('api/', include('sales.api.urls')),
    path('api/', include('authentication.api.urls')),
    path('api/', include("river_admin_remake.urls")),
    path('api/', include('sales.analytics.urls')),
    path('admin/', admin.site.urls), # admin site

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


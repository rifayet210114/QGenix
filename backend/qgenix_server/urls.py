"""
URL configuration for qgenix_server project.

Bengali Note:
       :
. /api/auth/ -> accounts.urls (,  ,  ,  )
. /admin/ ->    
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Accounts & Authentication Endpoints
    path('api/auth/', include('accounts.urls')),
]

if settings.MEDIA_URL:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


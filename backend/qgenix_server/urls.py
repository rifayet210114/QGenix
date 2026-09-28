"""
URL configuration for qgenix_server project.

Bengali Note:
এই ফাইলে প্রধান এপিআই রুটগুলো রাউট করা হয়েছে:
১. /api/auth/ -> accounts.urls (লগইন, টোকেন রিফ্রেশ, কারেন্ট প্রোফাইল, ইউজার ম্যানেজমেন্ট)
২. /admin/ -> ডিফল্ট জ্যাঙ্গো অ্যাডমিন প্যানেল
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Accounts & Authentication Endpoints
    path('api/auth/', include('accounts.urls')),
]

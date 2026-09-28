# =========================================================================================
# accounts/urls.py — Authentication & RBAC User Management Endpoints
# -----------------------------------------------------------------------------------------
# Bengali Note:
# এই ফাইলে অ্যাকাউন্টস অ্যাপের ইউআরএল রুটগুলো কনফিগার করা হয়েছে:
# ১. /login/ -> JWT টোকেন ও রোল ভিত্তিক তথ্যসহ লগইন হ্যান্ডলার
# ২. /token/refresh/ -> মেয়াদোত্তীর্ণ টোকেন রিফ্রেশ করার এন্ডপয়েন্ট
# ৩. /me/ -> বর্তমানে লগইন থাকা ইউজারের প্রোফাইল
# ৪. /users/ -> শুধুমাত্র অ্যাডমিনের জন্য ইউজার ম্যানেজমেন্ট CRUD রাউট
# =========================================================================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomLoginView, 
    CurrentUserView, 
    AdminUserViewSet, 
    StudentRegistrationView,
    DashboardStatsView,
    CourseViewSet,
    DepartmentViewSet,
    ExamSessionViewSet,
    NoticeViewSet,
    PublishSemesterResultView
)

router = DefaultRouter()
# Register Admin User Management CRUD endpoints (/api/auth/users/)
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'courses', CourseViewSet, basename='admin-courses')
router.register(r'departments', DepartmentViewSet, basename='admin-departments')
router.register(r'exam-sessions', ExamSessionViewSet, basename='admin-exam-sessions')
router.register(r'notices', NoticeViewSet, basename='admin-notices')

urlpatterns = [
    # Dynamic DB Metrics for Executive Dashboard
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    # Publish semester result and dynamic CGPA recalculation
    path('publish-semester-result/', PublishSemesterResultView.as_view(), name='publish-semester-result'),
    # Public Student Registration
    path('register/student/', StudentRegistrationView.as_view(), name='register-student'),
    # JWT Login: Returns access, refresh, role and profile
    path('login/', CustomLoginView.as_view(), name='auth-login'),
    # Refresh JWT access token
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    # Current User Profile
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    # Admin User & Academics CRUD routes
    path('', include(router.urls)),
]


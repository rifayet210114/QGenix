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
    ChangePasswordView,
    AdminUserViewSet, 
    StudentRegistrationView,
    DashboardStatsView,
    CourseViewSet,
    DepartmentViewSet,
    ExamSessionViewSet,
    NoticeViewSet,
    AuditLogViewSet,
    PublishSemesterResultView,
    BatchViewSet,
    ClassRoutineViewSet,
    CourseAllocationViewSet,
    AIConfigurationView,
    DatabaseBackupView,
    SemesterArchiveViewSet,
    ArchiveSemesterActionView,
    SystemSettingView,
    FacultyDossierView
)

router = DefaultRouter()
# Register Admin User Management CRUD endpoints (/api/auth/users/)
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'courses', CourseViewSet, basename='admin-courses')
router.register(r'departments', DepartmentViewSet, basename='admin-departments')
router.register(r'batches', BatchViewSet, basename='admin-batches')
router.register(r'archives', SemesterArchiveViewSet, basename='admin-archives')
router.register(r'routines', ClassRoutineViewSet, basename='admin-routines')
router.register(r'allocations', CourseAllocationViewSet, basename='admin-allocations')
router.register(r'exam-sessions', ExamSessionViewSet, basename='admin-exam-sessions')
router.register(r'notices', NoticeViewSet, basename='admin-notices')
router.register(r'audit-logs', AuditLogViewSet, basename='admin-audit-logs')

urlpatterns = [
    # 100% Real Database Faculty Dossier (Class Routine, Biometrics & Leaves)
    path('faculty-dossier/<str:identifier>/', FacultyDossierView.as_view(), name='faculty-dossier'),
    # Dynamic DB Metrics for Executive Dashboard
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    # System Settings & Email Formats Configuration
    path('system-settings/', SystemSettingView.as_view(), name='system-settings'),
    # Academic Archive Semester Action
    path('archive-semester/', ArchiveSemesterActionView.as_view(), name='archive-semester'),
    # AI Engine Configuration & Quota Settings
    path('ai-config/', AIConfigurationView.as_view(), name='ai-config'),
    # Database Snapshot Backup Export
    path('backup/export/', DatabaseBackupView.as_view(), name='backup-export'),
    # Publish semester result and dynamic CGPA recalculation
    path('publish-semester-result/', PublishSemesterResultView.as_view(), name='publish-semester-result'),
    # Public Student Registration
    path('register/student/', StudentRegistrationView.as_view(), name='register-student'),
    # JWT Login: Returns access, refresh, role and profile
    path('login/', CustomLoginView.as_view(), name='auth-login'),
    # Refresh JWT access token
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    # Change Password for Authenticated User
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    # Current User Profile
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    # Admin User & Academics CRUD routes
    path('', include(router.urls)),
]


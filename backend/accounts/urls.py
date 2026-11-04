# =========================================================================================
# accounts/urls.py — Authentication & RBAC User Management Endpoints
# -----------------------------------------------------------------------------------------
# Bengali Note:
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
    GradingScaleRuleViewSet,
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
    FacultyDossierView,
    ClassAttendanceViewSet,
    AIQuestionPaperViewSet,
    TeacherBiometricCheckInOutView,
    BiometricShiftPolicyView,
    FacultyTimesheetView,
    TeacherCourseResourceView,
    AIGenerateExamView,
    AIPublishExamView,
    StudentAssignedExamView,
    StudentExamResultViewSet,
    SubmitTeacherExamResultsView,
    PublishBatchExamResultsView,
    UnpublishBatchExamResultsView,
    OnlineClassSessionViewSet,
    StudentAllocatedCoursesView
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
router.register(r'attendances', ClassAttendanceViewSet, basename='admin-attendances')
router.register(r'exam-sessions', ExamSessionViewSet, basename='admin-exam-sessions')
router.register(r'grading-scale', GradingScaleRuleViewSet, basename='admin-grading-scale')
router.register(r'notices', NoticeViewSet, basename='admin-notices')
router.register(r'audit-logs', AuditLogViewSet, basename='admin-audit-logs')
router.register(r'ai-questions', AIQuestionPaperViewSet, basename='admin-ai-questions')
router.register(r'student-exam-results', StudentExamResultViewSet, basename='student-exam-results')
router.register(r'online-classes', OnlineClassSessionViewSet, basename='online-classes')


urlpatterns = [
    # 100% Real Database Faculty Dossier (Class Routine, Biometrics & Leaves)
    path('faculty-dossier/<str:identifier>/', FacultyDossierView.as_view(), name='faculty-dossier'),
    # Teacher Real-Time Biometric Check-In & Check-Out
    path('teacher-checkin/', TeacherBiometricCheckInOutView.as_view(), name='teacher-checkin'),
    # Faculty Biometric Shift Rules & Punctuality Policy (100% DB-driven)
    path('biometric-shift-policy/', BiometricShiftPolicyView.as_view(), name='biometric-shift-policy'),
    # Faculty Timesheet Logging & Reporting API (100% Real-Time DB Synced)
    path('faculty-timesheet/', FacultyTimesheetView.as_view(), name='faculty-timesheet'),
    path('faculty-timesheet/<int:pk>/', FacultyTimesheetView.as_view(), name='faculty-timesheet-detail'),
    # Teacher Course Resources, Books & Notes Management (100% DB Table: teacher_course_resources)
    path('teacher-resources/', TeacherCourseResourceView.as_view(), name='teacher-resources'),
    # Student Allocated Courses (100% DB-driven)
    path('student-courses/', StudentAllocatedCoursesView.as_view(), name='student-courses'),
    path('teacher-resources/<int:pk>/', TeacherCourseResourceView.as_view(), name='teacher-resources-detail'),
    # AI Exam Generation & Publish Endpoints
    path('ai-generate-exam/', AIGenerateExamView.as_view(), name='ai-generate-exam'),
    path('ai-publish-exam/', AIPublishExamView.as_view(), name='ai-publish-exam'),
    path('student-assigned-exam/', StudentAssignedExamView.as_view(), name='student-assigned-exam'),
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
    path('submit-teacher-results/', SubmitTeacherExamResultsView.as_view(), name='submit-teacher-results'),
    path('publish-batch-results/', PublishBatchExamResultsView.as_view(), name='publish-batch-results'),
    path('unpublish-batch-results/', UnpublishBatchExamResultsView.as_view(), name='unpublish-batch-results'),
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


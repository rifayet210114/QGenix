# =========================================================================================
# accounts/permissions.py — Role-Based Access Control (RBAC) Permission Classes
# -----------------------------------------------------------------------------------------
# Bengali Note:
# RBAC security: verifies user roles and denies unauthorized access with 403
# RBAC security: verifies user roles and denies unauthorized access with 403
# RBAC security: verifies user roles and denies unauthorized access with 403
# RBAC security: verifies user roles and denies unauthorized access with 403
# =========================================================================================

from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to authenticated users with ADMIN role or Django Superusers.
    """
    message = "Access Denied: You must be a verified System Administrator to access this endpoint."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'ADMIN' or request.user.is_superuser or request.user.is_staff)
        )

class IsTeacherUserRole(permissions.BasePermission):
    """
    Allows access only to authenticated Faculty/Teacher users or Admins.
    """
    message = "Access Denied: You must be a verified Faculty Member to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'TEACHER' or request.user.role == 'ADMIN' or request.user.is_superuser)
        )

class IsStudentUserRole(permissions.BasePermission):
    """
    Allows access to authenticated Students.
    """
    message = "Access Denied: Student authorization required."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'STUDENT' or request.user.role == 'ADMIN' or request.user.is_superuser)
        )

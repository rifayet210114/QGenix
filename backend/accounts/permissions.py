# =========================================================================================
# accounts/permissions.py — Role-Based Access Control (RBAC) Permission Classes
# -----------------------------------------------------------------------------------------
# Bengali Note:
# এই ফাইলে কাস্টম পারমিশন ক্লাসগুলো ডিফাইন করা হয়েছে:
# ১. IsAdminUserRole: শুধুমাত্র ADMIN রোলের ব্যবহারকারী অ্যাডমিন এপিআই কল করতে পারবে।
#    কোনো টিচার বা স্টুডেন্ট অ্যাডমিন এপিআইতে রিকোয়েস্ট পাঠালে ব্যাকএন্ড সাথে সাথে 
#    HTTP 403 Forbidden রিটার্ন করবে।
# ২. IsTeacherUserRole: শুধুমাত্র শিক্ষকদের অ্যাক্সেস পারমিশন।
# ৩. IsStudentUserRole: শুধুমাত্র শিক্ষার্থীদের অ্যাক্সেস পারমিশন।
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

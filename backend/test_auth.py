# =========================================================================================
# backend/test_auth.py — Verification of Role-Based Security & Permissions
# -----------------------------------------------------------------------------------------
# Bengali Note:
# এই টেস্ট স্ক্রিপ্টটি যাচাই করে:
# ১. অ্যাডমিন (ADMIN) সফলভাবে টোকেন পায় এবং অ্যাডমিন রিসোর্স (/api/auth/users/) অ্যাক্সেস করতে পারে (200 OK)।
# ২. শিক্ষক (TEACHER) অথবা শিক্ষার্থী (STUDENT) অ্যাডমিন রিসোর্সে ঢুকতে চাইলে ব্যাকএন্ড স্বয়ংক্রিয়ভাবে 
#    403 Forbidden দিয়ে তাদের ব্লক করে।
# =========================================================================================

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qgenix_server.settings')
django.setup()

from rest_framework.test import APIClient
from accounts.models import CustomUser

def test_rbac_security():
    client = APIClient()

    print("--- 1. Testing Admin Login & Access ---")
    admin_login = client.post('/api/auth/login/', {'username': 'admin', 'password': 'admin123'})
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.data}"
    admin_token = admin_login.data['access']
    admin_role = admin_login.data['user']['role']
    print(f"Admin Authenticated! Role: {admin_role}")

    # Admin access to admin-only user endpoint
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    admin_res = client.get('/api/auth/users/')
    print(f"Admin Access to /api/auth/users/ -> Status Code: {admin_res.status_code}")
    assert admin_res.status_code == 200, "Admin should have full access!"

    print("\n--- 2. Testing Teacher Login & Unauthorized Access Attempt ---")
    teacher_login = client.post('/api/auth/login/', {'username': 'teacher', 'password': 'teacher123'})
    assert teacher_login.status_code == 200, f"Teacher login failed: {teacher_login.data}"
    teacher_token = teacher_login.data['access']
    teacher_role = teacher_login.data['user']['role']
    print(f"Teacher Authenticated! Role: {teacher_role}")

    # Teacher access to admin-only user endpoint (MUST BE 403 FORBIDDEN)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {teacher_token}')
    teacher_res = client.get('/api/auth/users/')
    print(f"Teacher Access to /api/auth/users/ -> Status Code: {teacher_res.status_code}")
    assert teacher_res.status_code == 403, "Security Alert: Teacher MUST receive 403 Forbidden on admin endpoints!"
    print(f"Teacher Blocked Message: {teacher_res.data.get('detail')}")

    print("\n--- 3. Testing Student Login & Unauthorized Access Attempt ---")
    student_login = client.post('/api/auth/login/', {'username': 'student', 'password': 'student123'})
    assert student_login.status_code == 200, f"Student login failed: {student_login.data}"
    student_token = student_login.data['access']
    student_role = student_login.data['user']['role']
    print(f"Student Authenticated! Role: {student_role}")

    # Student access to admin-only user endpoint (MUST BE 403 FORBIDDEN)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {student_token}')
    student_res = client.get('/api/auth/users/')
    print(f"Student Access to /api/auth/users/ -> Status Code: {student_res.status_code}")
    assert student_res.status_code == 403, "Security Alert: Student MUST receive 403 Forbidden on admin endpoints!"
    print(f"Student Blocked Message: {student_res.data.get('detail')}")

    print("\n>>> ALL RBAC SECURITY CHECKS PASSED WITH 100% SUCCESS! <<<")

if __name__ == '__main__':
    test_rbac_security()

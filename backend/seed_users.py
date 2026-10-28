# =========================================================================================
# backend/seed_users.py — Seed Initial Roles & Users with DIIT Institutional Email Format
# -----------------------------------------------------------------------------------------
# Bengali Note:
# Standard institutional email format test credentials
# =========================================================================================

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qgenix_server.settings')
django.setup()

from accounts.models import CustomUser

def seed():
    # 1. Create or update Admin User
    admin_user, created = CustomUser.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@diit.edu.bd',
            'first_name': 'Super',
            'last_name': 'Administrator',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True,
            'department': 'Central Administration',
            'institutional_id': 'ADM-001'
        }
    )
    admin_user.email = 'admin@diit.edu.bd'
    admin_user.set_password('admin123')
    admin_user.role = 'ADMIN'
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.save()
    print(f"[{'Created' if created else 'Updated'}] Admin: admin / admin@diit.edu.bd / admin123 (Role: ADMIN)")

    # 2. Create or update Teacher User
    teacher_user, created = CustomUser.objects.get_or_create(
        username='teacher',
        defaults={
            'email': 'teacher@diit.edu.bd',
            'first_name': 'Dr. Tariq',
            'last_name': 'Hasan',
            'role': 'TEACHER',
            'department': 'Computer Science & Engineering',
            'designation': 'Associate Professor',
            'institutional_id': 'FAC-201'
        }
    )
    teacher_user.email = 'teacher@diit.edu.bd'
    teacher_user.set_password('teacher123')
    teacher_user.role = 'TEACHER'
    teacher_user.save()
    print(f"[{'Created' if created else 'Updated'}] Teacher: teacher / teacher@diit.edu.bd / teacher123 (Role: TEACHER)")

    # 3. Create or update Primary Student User with institutional format: first_name_with_class_id.diit.edu.bd
    student_user, created = CustomUser.objects.get_or_create(
        username='tanvir_2022014',
        defaults={
            'email': 'tanvir_2022014@diit.edu.bd',
            'first_name': 'Tanvir',
            'last_name': 'Rahman',
            'role': 'STUDENT',
            'department': 'Computer Science & Engineering',
            'batch': 'Batch 2022',
            'cgpa': 3.82,
            'institutional_id': '2022014'
        }
    )
    student_user.email = 'tanvir_2022014@diit.edu.bd'
    student_user.set_password('student123')
    student_user.role = 'STUDENT'
    student_user.save()
    print(f"[{'Created' if created else 'Updated'}] Student: tanvir_2022014 / tanvir_2022014@diit.edu.bd / student123 (Role: STUDENT)")

    # 4. Also support 'student' username for quick development convenience
    student_alias, created = CustomUser.objects.get_or_create(
        username='student',
        defaults={
            'email': 'student@diit.edu.bd',
            'first_name': 'Tanvir',
            'last_name': 'Rahman',
            'role': 'STUDENT',
            'department': 'Computer Science & Engineering',
            'batch': 'Batch 2022',
            'cgpa': 3.82,
            'institutional_id': '2022014-ALIAS'
        }
    )
    student_alias.email = 'student@diit.edu.bd'
    student_alias.set_password('student123')
    student_alias.role = 'STUDENT'
    student_alias.save()

if __name__ == '__main__':
    seed()

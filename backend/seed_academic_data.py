import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qgenix_server.settings')
django.setup()

from accounts.models import CustomUser, Department, Course, Batch, ExamSession, Notice, AuditLog

def seed_academic():
    # 1. Seed Departments
    departments_data = [
        {'code': 'CSE', 'name': 'Computer Science & Engineering', 'hod': 'Prof. Dr. Mahbubur Rahman', 'faculty_count': 38, 'student_count': 1650, 'established': '2012'},
        {'code': 'EEE', 'name': 'Electrical & Electronic Engineering', 'hod': 'Dr. Farhana Ahmed', 'faculty_count': 26, 'student_count': 980, 'established': '2014'},
        {'code': 'BBA', 'name': 'Business Administration', 'hod': 'Prof. Tariqul Islam', 'faculty_count': 22, 'student_count': 850, 'established': '2015'},
        {'code': 'CE', 'name': 'Civil Engineering', 'hod': 'Dr. Nazmul Huda', 'faculty_count': 18, 'student_count': 520, 'established': '2018'},
        {'code': 'ENG', 'name': 'English & Modern Languages', 'hod': 'Dr. Shaila Parveen', 'faculty_count': 14, 'student_count': 250, 'established': '2019'},
    ]
    for d in departments_data:
        Department.objects.get_or_create(code=d['code'], defaults=d)
    print("Departments seeded.")

    # 2. Seed Courses
    courses_data = [
        {'code': 'CSE-301', 'title': 'Database Management Systems', 'credits': 3.0, 'department': 'CSE', 'modules': 5, 'prerequisite': 'CSE-201'},
        {'code': 'CSE-302', 'title': 'Operating Systems & System Programming', 'credits': 3.0, 'department': 'CSE', 'modules': 6, 'prerequisite': 'CSE-205'},
        {'code': 'CSE-315', 'title': 'Artificial Intelligence & Machine Learning', 'credits': 4.0, 'department': 'CSE', 'modules': 8, 'prerequisite': 'CSE-301'},
        {'code': 'EEE-211', 'title': 'Signals and Linear Systems', 'credits': 3.0, 'department': 'EEE', 'modules': 4, 'prerequisite': 'EEE-101'},
        {'code': 'BBA-205', 'title': 'Financial Accounting & Reporting', 'credits': 3.0, 'department': 'BBA', 'modules': 5, 'prerequisite': 'None'},
    ]
    for c in courses_data:
        Course.objects.get_or_create(code=c['code'], defaults=c)
    print("Courses seeded.")

    # 3. Seed Batches
    batches_data = [
        {'name': 'Batch 2022-2026', 'department': 'CSE', 'semester': '6th Semester', 'student_count': 210, 'status': 'Active'},
        {'name': 'Batch 2023-2027', 'department': 'CSE', 'semester': '4th Semester', 'student_count': 180, 'status': 'Active'},
        {'name': 'Batch 2021-2025', 'department': 'EEE', 'semester': '8th Semester', 'student_count': 95, 'status': 'Graduating'},
        {'name': 'Batch 2024-2028', 'department': 'BBA', 'semester': '2nd Semester', 'student_count': 220, 'status': 'Active'},
        {'name': 'Batch 2023-2027', 'department': 'CE', 'semester': '4th Semester', 'student_count': 80, 'status': 'Active'},
    ]
    for b in batches_data:
        Batch.objects.get_or_create(name=b['name'], department=b['department'], defaults=b)
    print("Batches seeded.")

    # 4. Seed Exam Sessions
    exam_sessions_data = [
        {'name': 'Spring 2026 Midterm Examination', 'exam_type': 'Midterm', 'start_date': '2026-04-10', 'end_date': '2026-04-22', 'is_locked': False, 'submitted_papers': 42, 'total_expected': 42},
        {'name': 'Spring 2026 Continuous Assessment Quiz II', 'exam_type': 'Quiz', 'start_date': '2026-03-28', 'end_date': '2026-04-02', 'is_locked': True, 'submitted_papers': 86, 'total_expected': 86},
        {'name': 'Fall 2025 Semester Final Examination', 'exam_type': 'Final', 'start_date': '2025-12-15', 'end_date': '2026-01-05', 'is_locked': True, 'submitted_papers': 110, 'total_expected': 110},
    ]
    for e in exam_sessions_data:
        ExamSession.objects.get_or_create(name=e['name'], defaults=e)
    print("Exam Sessions seeded.")

    # 5. Seed Faculty in CustomUser
    faculty_users = [
        {'username': 'prof_mahbub', 'email': 'mahbub@qgenix.edu', 'first_name': 'Mahbubur', 'last_name': 'Rahman', 'designation': 'Professor & Head', 'department': 'CSE', 'institutional_id': 'FAC-101'},
        {'username': 'dr_farhana', 'email': 'farhana@qgenix.edu', 'first_name': 'Farhana', 'last_name': 'Ahmed', 'designation': 'Associate Professor', 'department': 'EEE', 'institutional_id': 'FAC-104'},
        {'username': 'engr_tanvir', 'email': 'tanvir.h@qgenix.edu', 'first_name': 'Tanvir', 'last_name': 'Hasan', 'designation': 'Assistant Professor', 'department': 'CSE', 'institutional_id': 'FAC-112'},
        {'username': 'dr_asad', 'email': 'asad@qgenix.edu', 'first_name': 'Asaduzzaman', 'last_name': 'Chowdhury', 'designation': 'Senior Lecturer', 'department': 'CSE', 'institutional_id': 'FAC-120'},
        {'username': 'prof_tariqul', 'email': 'tariqul@qgenix.edu', 'first_name': 'Tariqul', 'last_name': 'Islam', 'designation': 'Professor & Dean', 'department': 'BBA', 'institutional_id': 'FAC-135'},
    ]
    for f in faculty_users:
        u, created = CustomUser.objects.get_or_create(
            username=f['username'],
            defaults={
                'email': f['email'],
                'first_name': f['first_name'],
                'last_name': f['last_name'],
                'role': 'TEACHER',
                'department': f['department'],
                'designation': f['designation'],
                'institutional_id': f['institutional_id'],
            }
        )
        if created:
            u.set_password('teacher123')
            u.save()
    print("Faculty users seeded.")

    # 6. Seed Notices
    notices_data = [
        {
            'title': 'Spring 2026 Midterm Examination Schedule Revised',
            'category': 'Exam',
            'audience': 'All Students & Teachers',
            'priority': 'Urgent',
            'pinned': True,
            'author': 'Office of the Exam Controller',
            'date': 'Sep 24, 2026',
            'content': 'Due to national holiday announcements, all midterm exams originally scheduled for April 12 have been shifted to April 24. Updated admit cards are accessible in student portals.',
            'attachment': 'Revised_Midterm_Routine_2026.pdf'
        },
        {
            'title': 'Faculty Senate Meeting: AI Assessment Curriculum Review',
            'category': 'Academic',
            'audience': 'Teachers Only',
            'priority': 'High',
            'pinned': True,
            'author': 'Academic Council',
            'date': 'Sep 22, 2026',
            'content': 'All departmental HoDs and course instructors are requested to attend the senate review regarding QGenix AI question moderation quotas on Thursday at 3:00 PM.',
            'attachment': None
        }
    ]
    for n in notices_data:
        Notice.objects.get_or_create(title=n['title'], defaults=n)
    print("Notices seeded.")

    # 7. Seed Initial Audit Logs
    audit_data = [
        {'user': 'Super Administrator', 'action': 'Database Bootstrapped & Synced', 'category': 'System', 'target': 'All University Tables', 'timestamp': 'Just now', 'status': 'Success'},
        {'user': 'System Initializer', 'action': 'Console Bootstrapped', 'category': 'System', 'target': 'Core State Initialized', 'timestamp': '10:00 AM', 'status': 'Success'}
    ]
    for a in audit_data:
        AuditLog.objects.get_or_create(action=a['action'], defaults=a)
    print("Audit logs seeded.")

    print(f"Total Students in DB: {CustomUser.objects.filter(role='STUDENT').count()}")
    print(f"Total Faculty in DB: {CustomUser.objects.filter(role='TEACHER').count()}")
    print(f"Total Courses in DB: {Course.objects.count()}")
    print(f"Total Departments in DB: {Department.objects.count()}")
    print(f"Total Notices in DB: {Notice.objects.count()}")
    print(f"Total Audit Logs in DB: {AuditLog.objects.count()}")

if __name__ == '__main__':
    seed_academic()


import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qgenix_server.settings')
django.setup()

from accounts.models import (
    CustomUser, Department, Course, Batch, ExamSession, Notice, AuditLog,
    ClassRoutine, CourseAllocation, AIConfiguration, ClassAttendance
)

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
        {'name': 'Batch 2022 - 2023', 'department': 'CSE', 'semester': '6th Semester', 'sections': 'A, B, C', 'student_count': 210, 'status': 'Active'},
        {'name': 'Batch 2023 - 2024', 'department': 'CSE', 'semester': '4th Semester', 'sections': 'A, B', 'student_count': 180, 'status': 'Active'},
        {'name': 'Batch 2021 - 2022', 'department': 'EEE', 'semester': '8th Semester', 'sections': 'A', 'student_count': 95, 'status': 'Graduating'},
        {'name': 'Batch 2024 - 2025', 'department': 'BBA', 'semester': '2nd Semester', 'sections': 'A, B, C', 'student_count': 220, 'status': 'Active'},
        {'name': 'Batch 2023 - 2024', 'department': 'CE', 'semester': '4th Semester', 'sections': 'A', 'student_count': 80, 'status': 'Active'},
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

    # 8. Seed Routine Slots
    routine_slots_data = [
        {'day': 'Sunday', 'time': '09:00 AM - 10:30 AM', 'course': 'CSE-301: Database Systems', 'teacher': 'Dr. Asaduzzaman', 'room': 'Lab-402', 'batch': 'Batch 2022 Sec A', 'conflict': False},
        {'day': 'Sunday', 'time': '10:45 AM - 12:15 PM', 'course': 'CSE-315: Artificial Intelligence', 'teacher': 'Prof. Dr. Mahbubur Rahman', 'room': 'Room-501', 'batch': 'Batch 2022 Sec A', 'conflict': False},
        {'day': 'Sunday', 'time': '01:00 PM - 02:30 PM', 'course': 'EEE-211: Signals & Systems', 'teacher': 'Dr. Farhana Ahmed', 'room': 'Room-302', 'batch': 'Batch 2023 Sec B', 'conflict': False},
        {'day': 'Sunday', 'time': '02:45 PM - 04:15 PM', 'course': 'BBA-205: Financial Accounting', 'teacher': 'Prof. Tariqul Islam', 'room': 'Room-204', 'batch': 'Batch 2024 Sec A', 'conflict': False},
        {'day': 'Monday', 'time': '09:00 AM - 10:30 AM', 'course': 'CSE-302: Operating Systems', 'teacher': 'Engr. Tanvir Hasan', 'room': 'Lab-401', 'batch': 'Batch 2022 Sec B', 'conflict': False},
        {'day': 'Monday', 'time': '10:45 AM - 12:15 PM', 'course': 'CSE-301: Database Systems', 'teacher': 'Dr. Asaduzzaman', 'room': 'Lab-401', 'batch': 'Batch 2023 Sec A', 'conflict': True},
    ]
    for r in routine_slots_data:
        ClassRoutine.objects.get_or_create(day=r['day'], time=r['time'], room=r['room'], defaults=r)
    print("Class Routine slots seeded.")

    # 9. Seed Course Allocations
    allocations_data = [
        {'course_code': 'CSE-301', 'course_name': 'Database Management Systems', 'teacher': 'Dr. Asaduzzaman', 'batch': 'Batch 2022 - 2023', 'section': 'Sec A & B', 'hours_per_week': 4, 'status': 'Confirmed'},
        {'course_code': 'CSE-315', 'course_name': 'Artificial Intelligence & Machine Learning', 'teacher': 'Prof. Dr. Mahbubur Rahman', 'batch': 'Batch 2022 - 2023', 'section': 'Sec A', 'hours_per_week': 4, 'status': 'Confirmed'},
        {'course_code': 'CSE-302', 'course_name': 'Operating Systems', 'teacher': 'Engr. Tanvir Hasan', 'batch': 'Batch 2023 - 2024', 'section': 'Sec B', 'hours_per_week': 3, 'status': 'Pending Review'},
        {'course_code': 'EEE-211', 'course_name': 'Signals and Linear Systems', 'teacher': 'Dr. Farhana Ahmed', 'batch': 'Batch 2021 - 2022', 'section': 'Sec A', 'hours_per_week': 4, 'status': 'Confirmed'},
    ]
    for a in allocations_data:
        CourseAllocation.objects.get_or_create(course_code=a['course_code'], teacher=a['teacher'], batch=a['batch'], defaults=a)
    print("Course Allocations seeded.")

    # 10. Seed AI Configuration
    AIConfiguration.objects.get_or_create(
        id=1,
        defaults={
            'primary_provider': 'gemini',
            'primary_model': 'gemini-1.5-pro',
            'gemini_api_key': 'AIzaSyD-981x2084792384791827491283',
            'openai_api_key': 'sk-proj-48197491274918274918274912',
            'daily_quota_per_teacher': 50,
            'similarity_threshold': 15,
            'enable_safety_guard': True,
            'temperature': 0.4
        }
    )
    # 11. Seed Initial Class Attendance Records
    attendance_records = [
        {'batch': 'Batch 2022 - 2023', 'section': 'Sec A', 'department': 'CSE', 'course_title': 'Database Management Systems', 'course_code': 'CSE-301', 'teacher': 'Dr. Asaduzzaman', 'date': '2026-10-24', 'total_students': 30, 'present_count': 28, 'absent_count': 2, 'late_count': 0, 'average_attendance': 93.3},
        {'batch': 'Batch 2022 - 2023', 'section': 'Sec A', 'department': 'CSE', 'course_title': 'Artificial Intelligence & Machine Learning', 'course_code': 'CSE-315', 'teacher': 'Prof. Dr. Mahbubur Rahman', 'date': '2026-10-24', 'total_students': 30, 'present_count': 26, 'absent_count': 3, 'late_count': 1, 'average_attendance': 90.0},
        {'batch': 'Batch 2023 - 2024', 'section': 'Sec B', 'department': 'CSE', 'course_title': 'Operating Systems & System Programming', 'course_code': 'CSE-302', 'teacher': 'Engr. Tanvir Hasan', 'date': '2026-10-25', 'total_students': 28, 'present_count': 25, 'absent_count': 3, 'late_count': 0, 'average_attendance': 89.3},
        {'batch': 'Batch 2021 - 2022', 'section': 'Sec A', 'department': 'EEE', 'course_title': 'Signals and Linear Systems', 'course_code': 'EEE-211', 'teacher': 'Dr. Farhana Ahmed', 'date': '2026-10-25', 'total_students': 25, 'present_count': 24, 'absent_count': 1, 'late_count': 0, 'average_attendance': 96.0},
        {'batch': 'Batch 2024 - 2025', 'section': 'Sec A', 'department': 'BBA', 'course_title': 'Financial Accounting & Reporting', 'course_code': 'BBA-205', 'teacher': 'Prof. Tariqul Islam', 'date': '2026-10-25', 'total_students': 32, 'present_count': 27, 'absent_count': 4, 'late_count': 1, 'average_attendance': 87.5}
    ]
    for item in attendance_records:
        ClassAttendance.objects.get_or_create(
            batch=item['batch'],
            section=item['section'],
            course_title=item['course_title'],
            date=item['date'],
            defaults=item
        )
    print("Class Attendance records seeded.")

    # 12. Seed AI Question Papers & Live Token Usage Telemetry
    from accounts.models import AIQuestionPaper, AITokenUsageLog
    from django.utils import timezone
    ai_papers_data = [
        {
            'paper_id': 'Q-9801',
            'course': 'CSE-315: AI & Machine Learning',
            'teacher': 'Dr. Asaduzzaman',
            'questions_count': 25,
            'difficulty': 'Hard',
            'similarity_score': 2.1,
            'originality_score': 97.9,
            'tokens_consumed': 38200,
            'estimated_cost': 0.0000,
            'status': 'Pending Review',
            'sample_question': 'In a distributed relational database, which concurrency control protocol guarantees strict serializability without requiring synchronized physical clocks?',
            'generated_on': '2026-09-22'
        },
        {
            'paper_id': 'Q-9802',
            'course': 'CSE-301: Database Management Systems',
            'teacher': 'Prof. Dr. Mahbubur Rahman',
            'questions_count': 40,
            'difficulty': 'Medium',
            'similarity_score': 0.8,
            'originality_score': 99.2,
            'tokens_consumed': 54100,
            'estimated_cost': 0.0000,
            'status': 'Approved',
            'sample_question': 'Explain the 3NF and BCNF normalization anomalies with an example relational table.',
            'generated_on': '2026-09-23'
        },
        {
            'paper_id': 'Q-9803',
            'course': 'EEE-211: Signals & Systems',
            'teacher': 'Dr. Farhana Ahmed',
            'questions_count': 30,
            'difficulty': 'Medium',
            'similarity_score': 4.5,
            'originality_score': 95.5,
            'tokens_consumed': 41800,
            'estimated_cost': 0.0000,
            'status': 'Pending Review',
            'sample_question': 'Derive the Continuous-Time Fourier Transform (CTFT) of an exponentially decaying sinusoidal pulse.',
            'generated_on': '2026-09-24'
        },
        {
            'paper_id': 'Q-9804',
            'course': 'CSE-302: Operating Systems & System Programming',
            'teacher': 'Engr. Tanvir Hasan',
            'questions_count': 35,
            'difficulty': 'Hard',
            'similarity_score': 1.4,
            'originality_score': 98.6,
            'tokens_consumed': 49500,
            'estimated_cost': 0.0000,
            'status': 'Approved',
            'sample_question': 'Compare Peterson algorithm with hardware atomic test-and-set instructions in preventing priority inversion.',
            'generated_on': '2026-09-25'
        },
        {
            'paper_id': 'Q-9805',
            'course': 'BBA-205: Financial Accounting & Reporting',
            'teacher': 'Prof. Tariqul Islam',
            'questions_count': 20,
            'difficulty': 'Easy',
            'similarity_score': 0.6,
            'originality_score': 99.4,
            'tokens_consumed': 26400,
            'estimated_cost': 0.0000,
            'status': 'Approved',
            'sample_question': 'Contrast IFRS 16 lease liability capitalization mechanics with US GAAP operating lease accounting.',
            'generated_on': '2026-09-26'
        },
        {
            'paper_id': 'Q-9806',
            'course': 'CSE-315: Artificial Intelligence & Machine Learning',
            'teacher': 'Prof. Dr. Mahbubur Rahman',
            'questions_count': 50,
            'difficulty': 'Hard',
            'similarity_score': 1.8,
            'originality_score': 98.2,
            'tokens_consumed': 68000,
            'estimated_cost': 0.0000,
            'status': 'Approved',
            'sample_question': 'Formulate the mathematical loss gradient update for a multi-head self-attention Transformer layer.',
            'generated_on': '2026-10-01'
        }
    ]
    for p in ai_papers_data:
        paper_obj, _ = AIQuestionPaper.objects.get_or_create(paper_id=p['paper_id'], defaults=p)
        AITokenUsageLog.objects.get_or_create(
            paper=paper_obj,
            tokens_consumed=p['tokens_consumed'],
            defaults={'provider': 'gemini', 'model_name': 'gemini-1.5-pro', 'is_throttle_violation': False}
        )
    print("AI Question Papers & Token Usage Logs seeded.")

    print(f"Total Students in DB: {CustomUser.objects.filter(role='STUDENT').count()}")
    print(f"Total Faculty in DB: {CustomUser.objects.filter(role='TEACHER').count()}")
    print(f"Total Courses in DB: {Course.objects.count()}")
    print(f"Total Departments in DB: {Department.objects.count()}")
    print(f"Total Notices in DB: {Notice.objects.count()}")
    print(f"Total Audit Logs in DB: {AuditLog.objects.count()}")
    print(f"Total Routine Slots in DB: {ClassRoutine.objects.count()}")
    print(f"Total Allocations in DB: {CourseAllocation.objects.count()}")
    print(f"Total Class Attendance in DB: {ClassAttendance.objects.count()}")
    print(f"Total AI Question Papers in DB: {AIQuestionPaper.objects.count()}")

if __name__ == '__main__':
    seed_academic()




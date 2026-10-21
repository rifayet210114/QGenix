# =========================================================================================
# accounts/models.py — Custom User Model & Role-Based Access Hierarchy
# -----------------------------------------------------------------------------------------
# Bengali Note:
# এই মডেলে QGenix প্ল্যাটফর্মের কাস্টম ইউজার মডেল (CustomUser) তৈরি করা হয়েছে।
# প্রধান বৈশিষ্ট্যসমূহ:
# ১. Role Selection: ADMIN, TEACHER, STUDENT — এর মাধ্যমে ইউজার কোন পোর্টালে ঢুকতে পারবে তা নির্ধারিত হয়।
# ২. শুধুমাত্র ADMIN রোলের ব্যবহারকারী অ্যাডমিন কনসোলে প্রবেশের পারমিশন পাবে।
# ৩. প্রতিটি ব্যবহারকারীর ডিপার্টমেন্ট, ফোন এবং রোল অনুযায়ী অতিরিক্ত প্রোফাইল ফিল্ড যুক্ত আছে।
# =========================================================================================

from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # User Roles Choices (ব্যবহারকারীর ভূমিকা নির্ধারণ)
    ROLE_CHOICES = (
        ('ADMIN', 'System Administrator'),
        ('TEACHER', 'Faculty / Teacher'),
        ('STUDENT', 'Enrolled Student'),
    )

    # Core Role Field (রোলের ফিল্ড — অ্যাডমিন, শিক্ষক বা শিক্ষার্থী)
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='STUDENT',
        help_text="Designates the system access level and dashboard routing."
    )

    # Department Association (বিভাগ যেমন: CSE, EEE, BBA)
    department = models.CharField(max_length=50, blank=True, null=True)

    # Contact & Identity
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    institutional_id = models.CharField(
        max_length=50, 
        unique=True, 
        blank=True, 
        null=True,
        help_text="Student ID (e.g. STU-2022-001) or Faculty Employee ID (FAC-101)"
    )

    # Student Specific Attributes (শিক্ষার্থীদের জন্য প্রয়োজনীয় ফিল্ড)
    batch = models.CharField(max_length=50, blank=True, null=True)
    section = models.CharField(max_length=20, blank=True, default='A', help_text="e.g. A, B, C")
    registration_no = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="University Registration Number (e.g. REG-2022-001)"
    )
    cgpa = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, blank=True, null=True)

    # Faculty Specific Attributes (শিক্ষকদের জন্য প্রয়োজনীয় ফিল্ড)
    designation = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Professor, Assistant Professor, Lecturer")

    # Helper role checking properties
    @property
    def is_admin_role(self):
        return self.role == 'ADMIN' or self.is_superuser

    @property
    def is_teacher_role(self):
        return self.role == 'TEACHER'

    @property
    def is_student_role(self):
        return self.role == 'STUDENT'

    def get_dynamic_cgpa(self):
        """
        Dynamically calculates the average CGPA across all published semester results for this student.
        If no published semester results exist, returns self.cgpa or 3.75.
        """
        results = self.semester_results.filter(is_published=True)
        if results.exists():
            avg_gpa = results.aggregate(models.Avg('gpa'))['gpa__avg']
            return round(avg_gpa, 2)
        return float(self.cgpa) if self.cgpa else 3.75

    def __str__(self):
        return f"{self.username} [{self.get_role_display()}] - {self.email}"


class Department(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    hod = models.CharField(max_length=150, blank=True, null=True)
    faculty_count = models.IntegerField(default=0)
    student_count = models.IntegerField(default=0)
    established = models.CharField(max_length=10, blank=True, default='2012')

    def __str__(self):
        return f"{self.code} - {self.name}"


class Course(models.Model):
    code = models.CharField(max_length=30, unique=True)
    title = models.CharField(max_length=200)
    credits = models.DecimalField(max_digits=3, decimal_places=1, default=3.0)
    department = models.CharField(max_length=50, blank=True)
    modules = models.IntegerField(default=5)
    prerequisite = models.CharField(max_length=50, blank=True, default='None')

    def __str__(self):
        return f"{self.code}: {self.title}"


class Batch(models.Model):
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=50)
    semester = models.CharField(max_length=50, blank=True)
    sections = models.CharField(max_length=255, default='A, B', blank=True)
    student_count = models.IntegerField(default=0)
    status = models.CharField(max_length=30, default='Active')

    def __str__(self):
        return f"{self.name} ({self.department})"


class ExamSession(models.Model):
    name = models.CharField(max_length=200)
    exam_type = models.CharField(max_length=50, default='Midterm')
    start_date = models.CharField(max_length=50, blank=True)
    end_date = models.CharField(max_length=50, blank=True)
    is_locked = models.BooleanField(default=False)
    submitted_papers = models.IntegerField(default=0)
    total_expected = models.IntegerField(default=40)

    def __str__(self):
        return self.name


class Notice(models.Model):
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, default='General')
    audience = models.CharField(max_length=100, default='All Students & Teachers')
    priority = models.CharField(max_length=30, default='Medium')
    pinned = models.BooleanField(default=False)
    author = models.CharField(max_length=100, default='Administration')
    date = models.CharField(max_length=50, blank=True)
    content = models.TextField()
    attachment = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.title


class AuditLog(models.Model):
    user = models.CharField(max_length=150)
    action = models.CharField(max_length=150)
    category = models.CharField(max_length=100, default='System')
    target = models.CharField(max_length=255, blank=True)
    ip_address = models.CharField(max_length=50, default='127.0.0.1')
    timestamp = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=30, default='Success')

    def __str__(self):
        return f"{self.user} - {self.action} ({self.timestamp})"


class SemesterResult(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='semester_results')
    semester = models.CharField(max_length=50) # e.g. "1st Semester", "2nd Semester", etc.
    gpa = models.DecimalField(max_digits=3, decimal_places=2, default=3.75)
    total_credits = models.DecimalField(max_digits=4, decimal_places=1, default=15.0)
    published_date = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.student.username} - {self.semester}: GPA {self.gpa}"


class ClassRoutine(models.Model):
    day = models.CharField(max_length=20) # e.g. Sunday, Monday
    time = models.CharField(max_length=50) # e.g. "09:00 AM - 10:30 AM"
    course = models.CharField(max_length=200)
    teacher = models.CharField(max_length=150)
    room = models.CharField(max_length=50)
    batch = models.CharField(max_length=100)
    conflict = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.day} {self.time} - {self.course} ({self.room})"


class CourseAllocation(models.Model):
    course_code = models.CharField(max_length=30)
    course_name = models.CharField(max_length=200)
    teacher = models.CharField(max_length=150)
    batch = models.CharField(max_length=100)
    section = models.CharField(max_length=50, default='Sec A')
    hours_per_week = models.IntegerField(default=3)
    weekly_days = models.CharField(max_length=100, default='Sun, Tue', blank=True)
    status = models.CharField(max_length=50, default='Confirmed')

    def __str__(self):
        return f"{self.course_code} -> {self.teacher} ({self.batch})"


class AIConfiguration(models.Model):
    primary_provider = models.CharField(max_length=50, default='gemini')
    primary_model = models.CharField(max_length=100, default='gemini-1.5-pro')
    gemini_api_key = models.CharField(max_length=255, blank=True, default='')
    openai_api_key = models.CharField(max_length=255, blank=True, default='')
    daily_quota_per_teacher = models.IntegerField(default=50)
    similarity_threshold = models.IntegerField(default=15)
    enable_safety_guard = models.BooleanField(default=True)
    temperature = models.FloatField(default=0.4)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AI Config ({self.primary_provider} - {self.primary_model})"


class SemesterArchive(models.Model):
    batch_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    semester = models.CharField(max_length=50)  # e.g. "1st Semester", "2nd Semester", etc.
    academic_year = models.CharField(max_length=50, blank=True, default='')
    total_students = models.IntegerField(default=0)
    average_gpa = models.FloatField(default=0.0)
    average_attendance = models.FloatField(default=0.0)
    archived_at = models.DateTimeField(auto_now_add=True)
    is_graduate_batch = models.BooleanField(default=False)
    status = models.CharField(max_length=50, default='Archived')  # "Archived" or "Graduated"

    class Meta:
        ordering = ['-archived_at', 'batch_name', 'semester']
        unique_together = ('batch_name', 'semester')

    def __str__(self):
        return f"{self.batch_name} - {self.semester} ({self.department})"


class StudentSemesterRecord(models.Model):
    archive = models.ForeignKey(SemesterArchive, on_delete=models.CASCADE, related_name='records')
    student = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    student_name = models.CharField(max_length=200)
    student_uid = models.CharField(max_length=50)  # Institutional Student ID (e.g. STU-2024-001)
    email = models.CharField(max_length=200, blank=True)
    registration_no = models.CharField(max_length=100, blank=True)
    section = models.CharField(max_length=50, blank=True, default='A')
    attendance_pct = models.FloatField(default=85.0)
    mid_marks = models.FloatField(default=25.0)
    final_marks = models.FloatField(default=45.0)
    semester_gpa = models.FloatField(default=3.75)
    cumulative_cgpa = models.FloatField(default=3.75)
    grade = models.CharField(max_length=10, blank=True, default='A')
    remarks = models.CharField(max_length=100, blank=True, default='Promoted')

    class Meta:
        ordering = ['student_uid']

    def __str__(self):
        return f"{self.student_name} ({self.student_uid}) - {self.archive.semester}"


class SystemSetting(models.Model):
    student_email_format = models.CharField(max_length=150, default='@diit.edu.bd')
    teacher_email_format = models.CharField(max_length=150, default='@diit.edu.bd')
    university_name = models.CharField(max_length=200, default='QGenix International University')
    short_code = models.CharField(max_length=50, default='QIU')
    contact_email = models.CharField(max_length=150, default='support@qgenix.edu')
    academic_year = models.CharField(max_length=50, default='2026-2027')
    current_term = models.CharField(max_length=50, default='Spring 2026')
    maintenance_mode = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"System Setting (Student: {self.student_email_format}, Teacher: {self.teacher_email_format})"




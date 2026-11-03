# =========================================================================================
# accounts/models.py — Custom User Model & Role-Based Access Hierarchy
# -----------------------------------------------------------------------------------------
# Bengali Note:
# RBAC security: verifies user roles and denies unauthorized access with 403
# =========================================================================================

from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # RBAC security: verifies user roles and denies unauthorized access with 403
    ROLE_CHOICES = (
        ('ADMIN', 'System Administrator'),
        ('TEACHER', 'Faculty / Teacher'),
        ('STUDENT', 'Enrolled Student'),
    )

    # RBAC security: verifies user roles and denies unauthorized access with 403
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='STUDENT',
        help_text="Designates the system access level and dashboard routing."
    )

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

    batch = models.CharField(max_length=50, blank=True, null=True)
    section = models.CharField(max_length=20, blank=True, default='A', help_text="e.g. A, B, C")
    semester = models.CharField(max_length=50, blank=True, null=True, default='', help_text="Current Enrolled Semester, e.g. '2nd Semester'")
    registration_no = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="University Registration Number (e.g. REG-2022-001)"
    )
    cgpa = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, blank=True, null=True)

    designation = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Professor, Assistant Professor, Lecturer")

    profile_picture = models.TextField(blank=True, null=True, help_text="Optimized base64 avatar or image URL")

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
    total_expected = models.IntegerField(default=0)
    batch = models.CharField(max_length=100, blank=True, default='')
    semester = models.CharField(max_length=100, blank=True, default='')
    expected_students = models.IntegerField(default=0)
    status = models.CharField(max_length=50, default='Scheduled')
    is_published = models.BooleanField(default=False)
    routine = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    @property
    def computed_status(self):
        from datetime import date
        today_str = date.today().strftime('%Y-%m-%d')
        if self.end_date and self.end_date < today_str:
            return 'Completed'
        if self.is_published:
            return 'Active'
        return 'Scheduled'

    def save(self, *args, **kwargs):
        if self.expected_students and not self.total_expected:
            self.total_expected = self.expected_students
        elif self.total_expected and not self.expected_students:
            self.expected_students = self.total_expected
        self.status = self.computed_status
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class GradingScaleRule(models.Model):
    grade = models.CharField(max_length=20)
    min_marks = models.IntegerField(default=0)
    max_marks = models.IntegerField(default=100)
    gpa = models.FloatField(default=4.0)
    remarks = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        ordering = ['-min_marks']

    def __str__(self):
        return f"{self.grade} ({self.min_marks}% - {self.max_marks}%, GPA: {self.gpa})"


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


class StudentExamResult(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='exam_results', null=True, blank=True)
    student_uid = models.CharField(max_length=50) # Institutional ID or username
    student_name = models.CharField(max_length=150)
    batch = models.CharField(max_length=100) # e.g. Batch 2027 - 2028
    semester = models.CharField(max_length=50) # e.g. 2nd Semester
    course_code = models.CharField(max_length=50) # e.g. CSE-301
    course_title = models.CharField(max_length=200) # e.g. Advanced Data Structures
    exam_name = models.CharField(max_length=150) # e.g. Mid Term Exam
    obtained_marks = models.FloatField(default=0.0)
    max_marks = models.FloatField(default=100.0)
    percentage = models.FloatField(default=0.0)
    grade = models.CharField(max_length=10, default='F')
    gpa = models.FloatField(default=0.0)
    is_published = models.BooleanField(default=False)
    submitted_by = models.CharField(max_length=150, blank=True, default='')
    submitted_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student_name} - {self.course_code} ({self.batch}, {self.semester}): {self.grade} ({self.gpa})"


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
    required_attendance_limit = models.FloatField(default=75.0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"System Setting (Student: {self.student_email_format}, Teacher: {self.teacher_email_format})"


class BiometricShiftPolicy(models.Model):
    standard_check_in = models.CharField(max_length=20, default='09:00 AM')
    grace_period_mins = models.IntegerField(default=15)
    standard_check_out = models.CharField(max_length=20, default='05:00 PM')
    half_day_hours = models.FloatField(default=4.5)
    full_day_hours = models.FloatField(default=8.0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Shift Policy (In: {self.standard_check_in} +{self.grace_period_mins}m, Out: {self.standard_check_out})"


class FacultyBiometricLog(models.Model):
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='biometric_logs')
    date = models.CharField(max_length=50) # e.g. "2026-10-24" or "Oct 24, 2026"
    check_in = models.CharField(max_length=20, default='08:45 AM')
    check_out = models.CharField(max_length=20, default='04:35 PM')
    terminal = models.CharField(max_length=100, default='Gate 1 - RFID Terminal A')
    duration = models.CharField(max_length=50, default='7h 50m')
    status = models.CharField(max_length=50, default='Present') # Present, Late Entry, Half Day, Holiday
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.teacher.username} - {self.date}: {self.status} (In: {self.check_in}, Out: {self.check_out})"


class FacultyTimesheetEntry(models.Model):
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='timesheet_entries')
    date = models.CharField(max_length=50) # e.g. "2026-10-28"
    task_title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='Lecture / Theory')
    start_time = models.CharField(max_length=20, default='10:00 AM')
    end_time = models.CharField(max_length=20, default='11:30 AM')
    hours_spent = models.FloatField(default=1.5)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=50, default='Completed') # Completed, In Progress
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.teacher.username} - {self.date}: {self.task_title} ({self.hours_spent}h)"


class FacultyLeaveQuota(models.Model):
    teacher = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='leave_quota')
    academic_year = models.CharField(max_length=50, default='2026-2027')
    casual_quota = models.IntegerField(default=15)
    casual_taken = models.IntegerField(default=3)
    medical_quota = models.IntegerField(default=15)
    medical_taken = models.IntegerField(default=1)
    academic_duty_quota = models.IntegerField(default=10)
    academic_duty_taken = models.IntegerField(default=2)
    earned_quota = models.IntegerField(default=10)
    earned_taken = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def total_quota(self):
        return self.casual_quota + self.medical_quota + self.academic_duty_quota + self.earned_quota

    def total_taken(self):
        return self.casual_taken + self.medical_taken + self.academic_duty_taken + self.earned_taken

    def total_remaining(self):
        return self.total_quota() - self.total_taken()

    def __str__(self):
        return f"{self.teacher.username} Leave Quota ({self.total_remaining()} Remaining)"


class FacultyLeaveRecord(models.Model):
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='leave_records')
    leave_type = models.CharField(max_length=50, default='Casual Leave') # Casual Leave, Medical Leave, Academic Duty, Earned Leave
    start_date = models.CharField(max_length=50) # e.g. "2026-10-10"
    end_date = models.CharField(max_length=50)   # e.g. "2026-10-12"
    days = models.IntegerField(default=1)
    reason = models.TextField()
    approved_by = models.CharField(max_length=150, default='Dean of Academic Affairs')
    status = models.CharField(max_length=50, default='Approved') # Approved, Pending, Rejected
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.teacher.username} - {self.leave_type} ({self.days} days): {self.status}"


class FacultySyllabusProgress(models.Model):
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='syllabus_progress')
    course_code = models.CharField(max_length=30)
    course_title = models.CharField(max_length=200, blank=True)
    batch = models.CharField(max_length=100)
    section = models.CharField(max_length=50, default='Sec A')
    progress_percentage = models.IntegerField(default=68)
    completed_topics = models.IntegerField(default=14)
    total_topics = models.IntegerField(default=20)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('teacher', 'course_code', 'batch', 'section')

    def __str__(self):
        return f"{self.teacher.username} - {self.course_code} ({self.batch} {self.section}): {self.progress_percentage}%"


class ClassAttendance(models.Model):
    batch = models.CharField(max_length=100)  # e.g. "Batch 2022 - 2023"
    section = models.CharField(max_length=50, default='A')  # e.g. "Sec A" or "A"
    department = models.CharField(max_length=50, default='CSE')
    semester = models.CharField(max_length=50, blank=True, default='5th Semester')  # e.g. "5th Semester"
    course_title = models.CharField(max_length=200)  # e.g. "Database Management Systems"
    course_code = models.CharField(max_length=50, blank=True, default='')  # e.g. "CSE-301"
    teacher = models.CharField(max_length=150)  # e.g. "Dr. Asaduzzaman" or teacher's full name
    teacher_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='taken_attendances')
    date = models.CharField(max_length=50, blank=True)  # e.g. "2026-10-25"
    total_students = models.IntegerField(default=0)
    present_count = models.IntegerField(default=0)
    absent_count = models.IntegerField(default=0)
    late_count = models.IntegerField(default=0)
    average_attendance = models.FloatField(default=0.0)  # Percentage, e.g. 93.3%
    student_records = models.JSONField(default=list, blank=True)  # [{id, name, status, regNo, student_id}]
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.course_title} - {self.batch} ({self.section}) - {self.teacher} [{self.present_count}/{self.total_students}]"


class AIQuestionPaper(models.Model):
    paper_id = models.CharField(max_length=50, unique=True)  # e.g. 'Q-9801'
    course = models.CharField(max_length=200)  # e.g. 'CSE-315: AI & Machine Learning'
    teacher = models.CharField(max_length=150)  # e.g. 'Dr. Asaduzzaman'
    questions_count = models.IntegerField(default=25)
    difficulty = models.CharField(max_length=50, default='Medium')  # Easy, Medium, Hard
    similarity_score = models.FloatField(default=2.1)  # % similarity to previous exams
    originality_score = models.FloatField(default=97.9)  # % originality
    tokens_consumed = models.IntegerField(default=1250)
    estimated_cost = models.DecimalField(max_digits=6, decimal_places=4, default=0.0000)
    status = models.CharField(max_length=50, default='Approved')  # Pending Review, Approved, Revision Requested
    sample_question = models.TextField(blank=True)
    generated_on = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.paper_id} - {self.course} ({self.questions_count} questions)"


class AITokenUsageLog(models.Model):
    paper = models.ForeignKey(AIQuestionPaper, on_delete=models.SET_NULL, null=True, blank=True, related_name='token_logs')
    provider = models.CharField(max_length=50, default='gemini')
    model_name = models.CharField(max_length=100, default='gemini-1.5-pro')
    tokens_consumed = models.IntegerField(default=0)
    is_throttle_violation = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.model_name}: {self.tokens_consumed} tokens at {self.timestamp}"


class TeacherCourseResource(models.Model):
    """
    Teacher Course Study Materials, Books, Notes, and Slides (PDF, DOCX, PPTX).
    Stored in a dedicated database table 'teacher_course_resources'.
    """
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='course_resources', null=True, blank=True)
    title = models.CharField(max_length=255)
    course_code = models.CharField(max_length=50, blank=True, default='GEN-101')
    course_title = models.CharField(max_length=255, blank=True, default='General Course Materials')
    file = models.FileField(upload_to='course_resources/%Y/%m/', null=True, blank=True)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20, default='PDF') # PDF, DOCX, DOC, PPTX, PPT
    file_size = models.CharField(max_length=50, blank=True, default='1.5 MB')
    file_url = models.TextField(blank=True, default='')
    file_data = models.TextField(blank=True, default='', help_text="Base64 Data URL or file content for direct fullscreen viewing")
    description = models.TextField(blank=True, default='')
    page_count = models.IntegerField(default=1, help_text="Total number of pages or slides in document")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teacher_course_resources'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.file_name} ({self.course_code}) - {self.teacher.username if self.teacher else 'Faculty'}"



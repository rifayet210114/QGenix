# =========================================================================================
# accounts/serializers.py — User & Authentication Serializers
# -----------------------------------------------------------------------------------------
# Bengali Note:
# এই সিরিয়ালাইজারে JWT টোকেন কাস্টমাইজেশন এবং ব্যবহারকারীর ডাটা সিরিয়ালাইজ করা হয়েছে:
# ১. CustomTokenObtainPairSerializer: লগইন করার পর টোকেনের সাথে ইউজারের রোল (ADMIN, TEACHER, STUDENT),
#    নাম, ইমেইল এবং ডিপার্টমেন্ট রেসপন্সে পাঠায়।
# ২. UserSerializer: ইউজার প্রোফাইলের ডাটা পড়ার জন্য।
# ৩. UserCreateUpdateSerializer: নতুন ইউজার তৈরি ও সম্পাদনার জন্য।
# =========================================================================================

from django.db import models
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customizes the JWT Token response to include user identity and role.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to the JWT payload
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        return token

    def validate(self, attrs):
        # Bengali Note: ইউজার প্রাতিষ্ঠানিক ইমেইল, স্টুডেন্ট আইডি অথবা ইউজারনেম যেকোনো ফরম্যাটে দিলে তা খুঁজে বের করে লগইন নিশ্চিত করে
        username_or_email = attrs.get('username', '').strip()
        matched_user = None

        if username_or_email:
            # 1. Direct exact / case-insensitive matches
            matched_user = CustomUser.objects.filter(
                models.Q(email__iexact=username_or_email) |
                models.Q(institutional_id__iexact=username_or_email) |
                models.Q(username__iexact=username_or_email)
            ).first()

            # 2. If not matched and has '@'
            if not matched_user and '@' in username_or_email:
                local_part, domain = username_or_email.split('@', 1)
                clean_local = local_part.replace('_', '').replace('.', '').replace('-', '')
                
                # Check if local_part or stripped local_part matches institutional_id or username
                matched_user = CustomUser.objects.filter(
                    models.Q(institutional_id__iexact=local_part) |
                    models.Q(institutional_id__iexact=clean_local) |
                    models.Q(username__iexact=local_part)
                ).first()

                # Check if stripping underscores/punctuation from email matches
                if not matched_user:
                    for u in CustomUser.objects.all():
                        if u.email and '@' in u.email:
                            u_local, u_domain = u.email.split('@', 1)
                            u_clean = u_local.replace('_', '').replace('.', '').replace('-', '')
                            if (clean_local.lower() == u_clean.lower() or 
                                (u.institutional_id and u.institutional_id.lower() in local_part.lower())) and (domain.lower() == u_domain.lower()):
                                matched_user = u
                                break

            # 3. If not matched and NO '@'
            if not matched_user and '@' not in username_or_email:
                clean_input = username_or_email.replace('_', '').replace('.', '').replace('-', '')
                matched_user = CustomUser.objects.filter(
                    models.Q(institutional_id__iexact=username_or_email) |
                    models.Q(institutional_id__iexact=clean_input) |
                    models.Q(email__istartswith=f"{username_or_email}@") |
                    models.Q(email__istartswith=f"{clean_input}@")
                ).first()

                if not matched_user:
                    for u in CustomUser.objects.all():
                        if u.email and '@' in u.email:
                            u_local = u.email.split('@', 1)[0]
                            u_clean = u_local.replace('_', '').replace('.', '').replace('-', '')
                            if clean_input.lower() == u_clean.lower():
                                matched_user = u
                                break

        if matched_user:
            attrs['username'] = matched_user.username

        data = super().validate(attrs)
        # Add user profile metadata directly in login response JSON
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
            'department': self.user.department,
            'institutional_id': self.user.institutional_id,
            'registration_no': self.user.registration_no,
            'batch': self.user.batch,
            'section': self.user.section,
            'cgpa': f"{self.user.get_dynamic_cgpa():.2f}",
            'designation': self.user.designation,
            'profile_picture': self.user.profile_picture or ''
        }
        return data

class UserSerializer(serializers.ModelSerializer):
    dynamic_cgpa = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'department', 'phone_number', 'institutional_id', 
            'registration_no', 'batch', 'section', 'cgpa', 'dynamic_cgpa', 
            'designation', 'profile_picture', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']

    def get_dynamic_cgpa(self, obj):
        return f"{obj.get_dynamic_cgpa():.2f}"

class UserCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name', 
            'role', 'department', 'phone_number', 'institutional_id', 
            'registration_no', 'batch', 'section', 'cgpa', 'designation', 
            'profile_picture', 'is_active'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_password('qgenix2026') # Default initial password
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class StudentRegistrationSerializer(serializers.Serializer):
    """
    Serializer for public Student self-registration.
    Enforces DIIT email formatting: firstname_classid@diit.edu.bd
    """
    first_name = serializers.CharField(max_length=50, required=True)
    last_name = serializers.CharField(max_length=50, required=True)
    class_id = serializers.CharField(max_length=50, required=True)
    department = serializers.CharField(max_length=50, required=True)
    batch = serializers.CharField(max_length=50, required=False, default="Batch 2024")
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6, required=True)
    email = serializers.EmailField(required=False)

    def validate(self, data):
        first_name = data.get('first_name', '').strip().lower().replace(' ', '')
        class_id = data.get('class_id', '').strip()
        
        # Expected institutional format from SystemSetting
        from .models import SystemSetting
        setting = SystemSetting.objects.first()
        req_format = setting.student_email_format if setting else '@diit.edu.bd'
        req_format = (req_format or '@diit.edu.bd').strip().lower()
        domain_suffix = req_format if req_format.startswith('@') else f"@{req_format.split('@')[-1]}"

        expected_email = f"{first_name}_{class_id}{domain_suffix}"
        provided_email = data.get('email', '').strip().lower()

        if provided_email:
            if not provided_email.endswith(domain_suffix):
                raise serializers.ValidationError({"email": f"Student email must follow the required format: {domain_suffix}"})
            data['final_email'] = provided_email
        else:
            data['final_email'] = expected_email

        expected_username = f"{first_name}_{class_id}"
        data['final_username'] = expected_username

        # Check existing duplicates
        if CustomUser.objects.filter(username=expected_username).exists():
            raise serializers.ValidationError({"class_id": f"A student with ID {class_id} is already registered."})
        if CustomUser.objects.filter(email=data['final_email']).exists():
            raise serializers.ValidationError({"email": f"Email {data['final_email']} is already registered."})
        if CustomUser.objects.filter(institutional_id=class_id).exists():
            raise serializers.ValidationError({"class_id": f"Institutional ID {class_id} already exists."})

        return data

    def create(self, validated_data):
        user = CustomUser(
            username=validated_data['final_username'],
            email=validated_data['final_email'],
            first_name=validated_data['first_name'].strip(),
            last_name=validated_data['last_name'].strip(),
            institutional_id=validated_data['class_id'].strip(),
            department=validated_data['department'],
            batch=validated_data.get('batch', 'Batch 2024'),
            phone_number=validated_data.get('phone_number', ''),
            role='STUDENT',
            is_active=True
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


from .models import Department, Course, Batch, ExamSession, Notice, AuditLog, ClassRoutine, CourseAllocation, AIConfiguration, SemesterArchive, StudentSemesterRecord, SystemSetting

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class ExamSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamSession
        fields = '__all__'

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'

class ClassRoutineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassRoutine
        fields = '__all__'

class CourseAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseAllocation
        fields = '__all__'

class AIConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConfiguration
        fields = '__all__'

class StudentSemesterRecordSerializer(serializers.ModelSerializer):
    student_id = serializers.CharField(source='student_uid')

    class Meta:
        model = StudentSemesterRecord
        fields = [
            'id', 'student_id', 'student_name', 'email', 'registration_no',
            'section', 'attendance_pct', 'mid_marks', 'final_marks',
            'semester_gpa', 'cumulative_cgpa', 'grade', 'remarks'
        ]

class SemesterArchiveSerializer(serializers.ModelSerializer):
    records = StudentSemesterRecordSerializer(many=True, read_only=True)
    records_count = serializers.IntegerField(source='records.count', read_only=True)

    class Meta:
        model = SemesterArchive
        fields = [
            'id', 'batch_name', 'department', 'semester', 'academic_year',
            'total_students', 'average_gpa', 'average_attendance', 'archived_at',
            'is_graduate_batch', 'status', 'records', 'records_count'
        ]




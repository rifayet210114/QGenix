"""
Django settings for qgenix_server project.

Bengali Note:
এই ফাইলে Django ব্যাকএন্ডের প্রধান কনফিগারেশন সেট করা হয়েছে:
১. কাস্টম ইউজার মডেল (accounts.CustomUser) সেট করা হয়েছে।
২. Django REST Framework (DRF) এবং SimpleJWT অথেনটিকেশন কনফিগার করা হয়েছে।
৩. CORS Headers কনফিগার করা হয়েছে যাতে Vite Frontend (localhost:5173) নির্বিঘ্নে এপিআই অ্যাক্সেস করতে পারে।
"""

from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-sh+@8oc=qv^z4)ico2tfr+4b2%i5n(kky!pv^bd!d*m*=e_geb'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Libraries (তৃতীয় পক্ষের লাইব্রেরি)
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local Apps (কাস্টম অ্যাপস)
    'accounts',
]

# Custom User Model (কাস্টম ইউজার মডেল যাতে রোল ও প্রোফাইল ডাটা যুক্ত থাকে)
AUTH_USER_MODEL = 'accounts.CustomUser'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # CORS middleware must be at the very top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'qgenix_server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'qgenix_server.wsgi.application'

# Database configuration (SQLite for fast local development)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dhaka'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =========================================================================================
# Django REST Framework (DRF) Configuration
# =========================================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# =========================================================================================
# SimpleJWT Configuration (JWT টোকেনের মেয়াদ ও সিকিউরিটি পলিসি)
# =========================================================================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1), # 1 day for smooth dev experience
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# =========================================================================================
# CORS Configuration (ফ্রন্টএন্ড পোর্ট 5173 থেকে রিকোয়েস্ট অনুমতি)
# =========================================================================================
CORS_ALLOW_ALL_ORIGINS = True # Enabled for local full-stack pair development
CORS_ALLOW_CREDENTIALS = True

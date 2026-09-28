"""
Django settings for qgenix_server project.

Bengali Note:
এই ফাইলে Django ব্যাকএন্ডের প্রধান কনফিগারেশন সেট করা হয়েছে।
Production + Local উভয় environment এ কাজ করে।
"""

import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# =========================================================================================
# Security (Production: Environment Variables থেকে পড়া হয়)
# =========================================================================================
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-sh+@8oc=qv^z4)ico2tfr+4b2%i5n(kky!pv^bd!d*m*=e_geb')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*', '.railway.app', '.up.railway.app', 'localhost', '127.0.0.1']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party Libraries
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local Apps
    'accounts',
]

# Custom User Model
AUTH_USER_MODEL = 'accounts.CustomUser'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',        # CORS: must be at top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',    # WhiteNoise: static files for production
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

# =========================================================================================
# Database (SQLite - Railway Volume Mount দিয়ে persistent রাখা হবে)
# =========================================================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator' },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator' },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dhaka'
USE_I18N = True
USE_TZ = True

# =========================================================================================
# Static Files (WhiteNoise দিয়ে production-এ serve হবে)
# =========================================================================================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

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
# SimpleJWT Configuration
# =========================================================================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# =========================================================================================
# CORS Configuration
# Railway backend + Vercel frontend + local dev সব allow
# =========================================================================================
CORS_ALLOW_ALL_ORIGINS = True   # Deploy হলে False করো এবং নিচে আসল URLs দাও
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://qgenix.vercel.app",   # Vercel deploy এর পরে আসল URL দিয়ে replace করো
]
CORS_ALLOW_CREDENTIALS = True

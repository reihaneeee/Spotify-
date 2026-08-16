"""
Django settings for the Spotify-clone phase-2 backend.

Owned by: Phase 2, parts 3.1 (models & CRUD), 3.2 (subscriptions), 3.3 (access levels).
Other teammates plug their apps (uploads polish, payments, reporting) into this same
project -- see README.md at the repo root for the exact app boundaries.
"""
import os
from datetime import timedelta
from pathlib import Path

DEBUG = os.environ.get('DJANGO_DEBUG', '1') == '1'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')


BASE_DIR = Path(__file__).resolve().parent.parent

ZARINPAL_MERCHANT_ID = os.environ.get("ZARINPAL_MERCHANT_ID")
print("ZARINPAL_MERCHANT_ID =", ZARINPAL_MERCHANT_ID)

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    # local apps
    "accounts",
    "subscriptions",
    "catalog",
    "playlists",
    "notifications",
    'drf_spectacular',                  # For Swagger
    "payments", 
    "reports",
    "tickets",
]

# New Settings for drf-spectacular
SPECTACULAR_SETTINGS = {
    'TITLE': 'Spotify Clone API',
    'DESCRIPTION': 'Complete API documentation for the Spotify Clone project - Phase 2 (with JWT)',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    # این بخش باعث می‌شود دکمه Authorize از نوع Bearer Token (JWT) باشد
    'SECURITY': [{'BearerAuth': []}],
    'COMPONENT_SPLIT_REQUEST': True,

    'TAGS': {
        'auth': 'Authentication & Users',
        'catalog': 'Music Catalog',
        'playlists': 'Playlists',
        'subscriptions': 'Subscriptions & Payments',
        'notifications': 'Notifications',
        'reports': 'Reports & Analytics',
    },
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "spotify_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "spotify_backend.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Tehran"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    "PAGE_SIZE": 20,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=6),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=14),
    "ROTATE_REFRESH_TOKENS": True,
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True

# Free/basic tier limits used as a seed default for subscriptions.SubscriptionPlan
# (kept here only as a documented fallback; the source of truth is the DB row so
# admins can change prices/limits without touching code -- see spec rule #4/#8).
DEFAULT_PLAN_SEED = {
    "basic": {"price_monthly": 0, "max_playlists": 6, "daily_stream_limit": 60},
    "silver": {"price_monthly": 59000, "max_playlists": 100, "daily_stream_limit": None},
    "gold": {"price_monthly": 99000, "max_playlists": None, "daily_stream_limit": None},
}

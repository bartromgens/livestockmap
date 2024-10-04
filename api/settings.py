"""
Django settings for api project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-5q2f)5c56h7#4h8y!5__)+(hv)#n6p6y56+_o1+qp=hf+8g41r"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "building",
    "api",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.gzip.GZipMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "api.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly"
    ]
}

# corsheaders
CORS_ORIGIN_ALLOW_ALL = True

# Application settings
KVK_SCRAPE_SLEEP_SEC = 0.8

###########
# LOGGING #
###########

# Directory of the logfiles
LOG_DIR = os.path.join(BASE_DIR, "log")

# Max. logfile size
LOGFILE_MAXSIZE = 10 * 1024 * 1024

# Number of old log files that are stored before they are deleted
# see https://docs.python.org/3/library/logging.handlers.html#rotatingfilehandler
LOGFILE_BACKUP_COUNT = 3

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[%(asctime)s] %(levelname)s [%(name)s::%(funcName)s() (%(lineno)s)]: %(message)s",
            "datefmt": "%d/%b/%Y %H:%M:%S",
        },
    },
    "filters": {
        "require_debug_true": {
            "()": "django.utils.log.RequireDebugTrue",
        },
        "require_debug_false": {
            "()": "django.utils.log.RequireDebugFalse",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "filters": ["require_debug_true"],
            "formatter": "verbose",
        },
        "file_django": {
            "level": "ERROR",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOG_DIR, "django.log"),
            "maxBytes": LOGFILE_MAXSIZE,
            "backupCount": LOGFILE_BACKUP_COUNT,
            "formatter": "verbose",
        },
        "file_error": {
            "level": "ERROR",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOG_DIR, "error.log"),
            "maxBytes": LOGFILE_MAXSIZE,
            "backupCount": LOGFILE_BACKUP_COUNT,
            "formatter": "verbose",
        },
        "file_debug": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOG_DIR, "debug.log"),
            "maxBytes": LOGFILE_MAXSIZE,
            "backupCount": LOGFILE_BACKUP_COUNT,
            "formatter": "verbose",
        },
    },
    "loggers": {
        "": {
            "handlers": ["file_error", "console"],
            "propagate": True,
            "level": "ERROR",
        },
        "django": {
            "handlers": ["file_django", "console"],
            "propagate": True,
            "level": "ERROR",
        },
        "api": {
            "handlers": ["file_debug", "file_error", "console"],
            "propagate": False,
            "level": "DEBUG",
        },
        "building": {
            "handlers": ["file_debug", "file_error", "console"],
            "propagate": False,
            "level": "DEBUG",
        },
        "company": {
            "handlers": ["file_debug", "file_error", "console"],
            "propagate": False,
            "level": "DEBUG",
        },
        "osm": {
            "handlers": ["file_debug", "file_error", "console"],
            "propagate": False,
            "level": "DEBUG",
        },
    },
}

# Local settings
# Allow any settings to be defined in settings_local.py which should be
# ignored in your version control system allowing for settings to be
# defined per machine.
try:
    from api.settings_local import *
except ImportError:
    print("settings_local.py not found")

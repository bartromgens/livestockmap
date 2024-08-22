DEBUG = False

SECRET_KEY = ""

STATIC_ROOT = ""
STATIC_URL = "static/"

ALLOWED_HOSTS = []

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": "livestockmap",
        "USER": "livestockmap",
        "PASSWORD": "livestockmap",
        "HOST": "127.0.0.1",
        "PORT": "",
    }
}

from django.contrib.auth.backends import ModelBackend

from .models import Artisan


class PhoneAuthBackend(ModelBackend):
    def authenticate(self, request, phone=None, password=None, **kwargs):
        if not phone or not password:
            return None

        user = Artisan.objects.filter(phone=phone).first()
        if user and user.check_password(password) and user.is_active:
            return user
        return None

    def get_user(self, user_id):
        return Artisan.objects.filter(pk=user_id).first()

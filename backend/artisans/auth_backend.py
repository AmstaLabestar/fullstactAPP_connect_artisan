from django.contrib.auth.backends import ModelBackend
from .models import Artisan

class PhoneAuthBackend(ModelBackend):
    def authenticate(self, request, phone=None, password=None, **kwargs):
        try:
            user = Artisan.objects.get(phone=phone)
        except Artisan.DoesNotExist:
            return None

        if user.check_password(password):
            return user
        return None

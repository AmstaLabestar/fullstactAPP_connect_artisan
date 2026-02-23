from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from .models import Artisan, Realisation


def generate_test_image(name="test.jpg"):
    file_buffer = BytesIO()
    image = Image.new("RGB", (10, 10), "white")
    image.save(file_buffer, format="JPEG")
    file_buffer.seek(0)

    return SimpleUploadedFile(
        name,
        file_buffer.read(),
        content_type="image/jpeg",
    )


class RealisationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Artisan.objects.create_user(
            phone="770000001",
            username="artisan1",
            ville="Dakar",
            password="StrongPassword123!",
        )

    def test_authenticated_user_can_create_realisation_with_image(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "titre": "Pose carrelage",
            "description": "Renovation complete",
            "image": generate_test_image(),
            "is_available": True,
        }

        response = self.client.post("/api/mes-realisations/", data=payload, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Realisation.objects.count(), 1)

    def test_public_list_hides_unavailable_realisations(self):
        Realisation.objects.create(
            artisan=self.user,
            titre="Public",
            image=generate_test_image("public.jpg"),
            is_available=True,
        )
        Realisation.objects.create(
            artisan=self.user,
            titre="Prive",
            image=generate_test_image("prive.jpg"),
            is_available=False,
        )

        response = self.client.get("/api/realisations/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["titre"], "Public")


class LikeToggleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Artisan.objects.create_user(
            phone="770000002",
            username="artisan2",
            ville="Dakar",
            password="StrongPassword123!",
        )
        self.realisation = Realisation.objects.create(
            artisan=self.user,
            titre="Escalier",
            image=generate_test_image("escalier.jpg"),
            is_available=True,
        )

    def test_anonymous_like_toggle(self):
        first_response = self.client.post(f"/api/realisations/{self.realisation.id}/like/")
        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)

        second_response = self.client.post(f"/api/realisations/{self.realisation.id}/like/")
        self.assertEqual(second_response.status_code, status.HTTP_200_OK)

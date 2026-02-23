from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from .models import Artisan, Commentaire, Realisation


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


class CommentaireApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Artisan.objects.create_user(
            phone="770000010",
            username="artisan-comments",
            ville="Dakar",
            password="StrongPassword123!",
        )
        self.other_user = Artisan.objects.create_user(
            phone="770000011",
            username="artisan-other",
            ville="Dakar",
            password="StrongPassword123!",
        )
        self.realisation = Realisation.objects.create(
            artisan=self.user,
            titre="Test commentaire",
            image=generate_test_image("comment.jpg"),
            is_available=True,
        )

    def test_anonymous_can_create_comment_without_pseudo(self):
        payload = {"texte": "Super travail"}
        response = self.client.post(
            f"/api/realisations/{self.realisation.id}/commentaires/", data=payload
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Commentaire.objects.count(), 1)
        self.assertEqual(Commentaire.objects.first().auteur_nom, "Visiteur")
        self.assertIsNone(Commentaire.objects.first().user)

    def test_anonymous_comment_with_custom_pseudo_is_accepted(self):
        payload = {"auteur_nom": "Client rapide", "texte": "Sans pseudo"}
        response = self.client.post(
            f"/api/realisations/{self.realisation.id}/commentaires/", data=payload
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["auteur_nom"], "Client rapide")

    def test_authenticated_comment_uses_account_username(self):
        self.client.force_authenticate(user=self.user)
        payload = {"auteur_nom": "Faux Nom", "texte": "Je commente"}
        response = self.client.post(
            f"/api/realisations/{self.realisation.id}/commentaires/", data=payload
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["auteur_nom"], self.user.username)
        self.assertEqual(response.data["user_id"], self.user.id)

    def test_comment_list_is_paginated_by_ten(self):
        for index in range(12):
            Commentaire.objects.create(
                realisation=self.realisation,
                auteur_nom=f"Visiteur {index}",
                texte=f"Commentaire {index}",
            )

        response = self.client.get(
            f"/api/realisations/{self.realisation.id}/commentaires/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 12)
        self.assertEqual(len(response.data["results"]), 10)
        self.assertIsNotNone(response.data["next"])

    def test_owner_can_update_and_delete_own_comment(self):
        comment = Commentaire.objects.create(
            realisation=self.realisation,
            user=self.user,
            auteur_nom=self.user.username,
            texte="Ancien texte",
        )
        self.client.force_authenticate(user=self.user)

        update_response = self.client.patch(
            f"/api/realisations/{self.realisation.id}/commentaires/{comment.id}/",
            data={"texte": "Nouveau texte"},
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        comment.refresh_from_db()
        self.assertEqual(comment.texte, "Nouveau texte")

        delete_response = self.client.delete(
            f"/api/realisations/{self.realisation.id}/commentaires/{comment.id}/"
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Commentaire.objects.filter(pk=comment.id).exists())

    def test_non_owner_cannot_update_comment(self):
        comment = Commentaire.objects.create(
            realisation=self.realisation,
            user=self.user,
            auteur_nom=self.user.username,
            texte="Texte prive",
        )
        self.client.force_authenticate(user=self.other_user)

        response = self.client.patch(
            f"/api/realisations/{self.realisation.id}/commentaires/{comment.id}/",
            data={"texte": "Hack"},
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

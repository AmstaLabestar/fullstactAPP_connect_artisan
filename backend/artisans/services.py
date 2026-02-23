from dataclasses import dataclass

from django.db import IntegrityError, transaction

from .models import CommentLike, Commentaire, Like, Realisation


@dataclass(frozen=True)
class ToggleLikeResult:
    liked: bool
    message: str


class RequestMetadataService:
    @staticmethod
    def get_client_ip(request):
        forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")


class LikeService:
    @staticmethod
    @transaction.atomic
    def toggle_like(
        *, realisation: Realisation, user, ip_address: str | None
    ) -> ToggleLikeResult:
        if user is None and not ip_address:
            return ToggleLikeResult(
                liked=False,
                message="Impossible d'identifier ce client pour enregistrer un like.",
            )

        query = Like.objects.select_for_update().filter(realisation=realisation)
        if user is not None:
            query = query.filter(user=user)
        else:
            query = query.filter(user__isnull=True, ip_address=ip_address)

        if query.exists():
            query.delete()
            return ToggleLikeResult(liked=False, message="Like supprime.")

        try:
            Like.objects.create(realisation=realisation, user=user, ip_address=ip_address)
        except IntegrityError:
            return ToggleLikeResult(
                liked=True, message="Vous avez deja like cette realisation."
            )

        return ToggleLikeResult(liked=True, message="Realisation likee.")


class CommentLikeService:
    @staticmethod
    @transaction.atomic
    def toggle_like(
        *, commentaire: Commentaire, user, ip_address: str | None
    ) -> ToggleLikeResult:
        if user is None and not ip_address:
            return ToggleLikeResult(
                liked=False,
                message="Impossible d'identifier ce client pour enregistrer un like.",
            )

        query = CommentLike.objects.select_for_update().filter(commentaire=commentaire)
        if user is not None:
            query = query.filter(user=user)
        else:
            query = query.filter(user__isnull=True, ip_address=ip_address)

        if query.exists():
            query.delete()
            return ToggleLikeResult(liked=False, message="Like supprime.")

        try:
            CommentLike.objects.create(
                commentaire=commentaire, user=user, ip_address=ip_address
            )
        except IntegrityError:
            return ToggleLikeResult(
                liked=True, message="Vous avez deja like ce commentaire."
            )

        return ToggleLikeResult(liked=True, message="Commentaire like.")

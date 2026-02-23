import logging

from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import Artisan, Realisation


logger = logging.getLogger(__name__)


def _delete_file(field_file):
    if not field_file:
        return
    try:
        field_file.delete(save=False)
    except Exception as exc:
        logger.warning("Impossible de supprimer le fichier '%s': %s", field_file.name, exc)


@receiver(pre_save, sender=Artisan)
def cleanup_old_artisan_photo(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    if old_instance.photo_profil and old_instance.photo_profil != instance.photo_profil:
        _delete_file(old_instance.photo_profil)


@receiver(post_delete, sender=Artisan)
def delete_artisan_photo_on_delete(sender, instance, **kwargs):
    _delete_file(instance.photo_profil)


@receiver(pre_save, sender=Realisation)
def cleanup_old_realisation_image(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_instance = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    if old_instance.image and old_instance.image != instance.image:
        _delete_file(old_instance.image)


@receiver(post_delete, sender=Realisation)
def delete_realisation_image_on_delete(sender, instance, **kwargs):
    _delete_file(instance.image)

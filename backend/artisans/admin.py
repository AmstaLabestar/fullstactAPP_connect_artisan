from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models import Count
from django.utils.html import format_html

from .models import Artisan, CommentLike, Commentaire, Like, Metier, Realisation


@admin.register(Metier)
class MetierAdmin(admin.ModelAdmin):
    list_display = ("nom", "artisans_count")
    search_fields = ("nom",)
    ordering = ("nom",)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_artisans_count=Count("artisans"))

    def artisans_count(self, obj):
        return getattr(obj, "_artisans_count", 0)

    artisans_count.short_description = "Nombre d'artisans"


@admin.register(Artisan)
class ArtisanAdmin(UserAdmin):
    list_display = (
        "username",
        "phone",
        "ville",
        "photo_preview",
        "metiers_display",
        "date_joined",
        "is_active",
    )
    list_filter = ("ville", "secteur", "metiers", "is_staff", "date_joined")
    search_fields = ("username", "phone", "email", "ville")
    ordering = ("-date_joined",)
    readonly_fields = ("last_login", "date_joined", "photo_preview_large")
    filter_horizontal = ("metiers", "groups", "user_permissions")
    fieldsets = (
        ("Information de connexion", {"fields": ("username", "phone", "password")}),
        (
            "Profil personnel",
            {"fields": ("photo_profil", "photo_preview_large", "ville", "secteur", "email")},
        ),
        ("Competences", {"fields": ("metiers",)}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("metiers")

    def photo_preview(self, obj):
        if not obj.photo_profil:
            return "Pas de photo"
        return format_html(
            '<img src="{}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />',
            obj.photo_profil.url,
        )

    photo_preview.short_description = "Photo"

    def photo_preview_large(self, obj):
        if not obj.photo_profil:
            return "Pas de photo"
        return format_html(
            '<img src="{}" style="max-height:200px;border-radius:10px;" />',
            obj.photo_profil.url,
        )

    photo_preview_large.short_description = "Apercu actuel"

    def metiers_display(self, obj):
        return ", ".join(metier.nom for metier in obj.metiers.all()) or "-"

    metiers_display.short_description = "Metiers"


class CommentaireInline(admin.TabularInline):
    model = Commentaire
    extra = 0
    readonly_fields = ("user", "created_at",)
    classes = ("collapse",)


class LikeInline(admin.TabularInline):
    model = Like
    extra = 0
    readonly_fields = ("user", "ip_address", "created_at")
    classes = ("collapse",)


class CommentLikeInline(admin.TabularInline):
    model = CommentLike
    extra = 0
    readonly_fields = ("user", "ip_address", "created_at")
    classes = ("collapse",)


@admin.register(Realisation)
class RealisationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "image_preview",
        "titre_display",
        "artisan",
        "created_at",
        "is_available",
        "likes_count",
        "comments_count",
    )
    list_display_links = ("id", "image_preview", "titre_display")
    list_filter = ("is_available", "created_at", "artisan__metiers")
    search_fields = ("titre", "description", "artisan__username", "artisan__phone")
    list_editable = ("is_available",)
    date_hierarchy = "created_at"
    readonly_fields = ("created_at",)
    inlines = [CommentaireInline, LikeInline]

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("artisan")
            .annotate(_likes_count=Count("likes"), _comments_count=Count("commentaires"))
        )

    def titre_display(self, obj):
        return obj.titre or "Sans titre"

    titre_display.short_description = "Titre"

    def image_preview(self, obj):
        if not obj.image:
            return "-"
        return format_html(
            '<img src="{}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;" />',
            obj.image.url,
        )

    image_preview.short_description = "Apercu"

    def likes_count(self, obj):
        return getattr(obj, "_likes_count", 0)

    likes_count.short_description = "Likes"

    def comments_count(self, obj):
        return getattr(obj, "_comments_count", 0)

    comments_count.short_description = "Commentaires"


@admin.register(Commentaire)
class CommentaireAdmin(admin.ModelAdmin):
    list_display = ("auteur_nom", "user", "realisation", "texte_short", "created_at")
    search_fields = ("auteur_nom", "texte", "realisation__titre")
    list_filter = ("created_at",)
    inlines = [CommentLikeInline]

    def texte_short(self, obj):
        return f"{obj.texte[:50]}..." if len(obj.texte) > 50 else obj.texte

    texte_short.short_description = "Contenu"


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("realisation", "user", "ip_address", "created_at")
    list_filter = ("created_at",)
    search_fields = ("realisation__titre", "user__username", "ip_address")

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ("commentaire", "user", "ip_address", "created_at")
    list_filter = ("created_at",)
    search_fields = ("commentaire__texte", "user__username", "ip_address")

    def has_change_permission(self, request, obj=None):
        return False

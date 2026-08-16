from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Follow, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ("email",)
    list_display = ("email", "username", "role", "artist_status", "is_staff")
    list_filter = ("role", "artist_status")
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Role", {"fields": ("role", "artist_status", "artist_rejection_reason")}),
        (
            "Profile",
            {
                "fields": (
                    "display_name", "artist_name", "bio", "birth_date",
                    "gender", "avatar", "portfolio_links", "accepted_privacy_policy",
                )
            },
        ),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "role", "password1", "password2")}),
    )
    search_fields = ("email", "username", "display_name", "artist_name")


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ("follower", "artist", "created_at")

from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("text", "recipient", "target_role", "is_read", "created_at")
    list_filter = ("target_role", "is_read")

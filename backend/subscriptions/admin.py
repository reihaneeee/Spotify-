from django.contrib import admin

from .models import SubscriptionPlan, UserSubscription


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ("tier", "price_monthly", "max_playlists", "daily_stream_limit")


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "is_active", "payment_status", "end_date")
    list_filter = ("plan", "is_active", "payment_status")

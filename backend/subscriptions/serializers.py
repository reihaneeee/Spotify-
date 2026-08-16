from rest_framework import serializers

from .models import SubscriptionPlan, UserSubscription


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = (
            "tier", "price_monthly", "max_playlists", "daily_stream_limit",
            "can_change_avatar", "can_download", "early_access", "can_view_stats",
        )
        read_only_fields = ("tier",)


class AdminPriceUpdateSerializer(serializers.ModelSerializer):
    """Spec 2.11.3: admin-only form with two numeric inputs (silver/gold
    price) and an 'update prices' button -- no code change required."""

    class Meta:
        model = SubscriptionPlan
        fields = ("price_monthly",)

    def validate(self, attrs):
        if self.instance.tier == SubscriptionPlan.Tier.BASIC:
            raise serializers.ValidationError("The basic tier is always free and cannot be priced.")
        return attrs


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)

    class Meta:
        model = UserSubscription
        fields = (
            "id", "plan", "billing_period_months", "price_paid",
            "start_date", "end_date", "is_active", "payment_status", "created_at",
        )
        read_only_fields = fields


class SubscribeSerializer(serializers.Serializer):
    """POST /api/subscriptions/subscribe/
    Creates a pending subscription for the requested tier + billing period.
    Payment confirmation (3.6, owned by another teammate) is expected to
    call POST /api/subscriptions/<id>/confirm-payment/ once the gateway
    callback fires; until then payment_status stays 'pending' and the
    subscription grants no access (see services.get_active_subscription)."""

    tier = serializers.ChoiceField(choices=SubscriptionPlan.Tier.choices)
    billing_period_months = serializers.ChoiceField(choices=UserSubscription.BILLING_PERIODS)

    def validate_tier(self, value):
        if value == SubscriptionPlan.Tier.BASIC:
            raise serializers.ValidationError("The basic tier does not require a subscription.")
        return value

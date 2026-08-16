from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.db import models
from django.utils import timezone


class SubscriptionPlan(models.Model):
    """Spec table 1 + rule 'pricing must be dynamic, no code change needed to
    change silver/gold prices'. One row per tier; admins edit price_monthly
    (and, if they ever need to, the feature flags) through the admin panel or
    the /api/subscriptions/plans/<tier>/ PATCH endpoint -- never through code.
    `None` on a limit field means unlimited.
    """

    class Tier(models.TextChoices):
        BASIC = "basic", "Basic (free)"
        SILVER = "silver", "Silver"
        GOLD = "gold", "Gold"

    tier = models.CharField(max_length=10, choices=Tier.choices, unique=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    max_playlists = models.PositiveIntegerField(null=True, blank=True)
    daily_stream_limit = models.PositiveIntegerField(null=True, blank=True)
    can_change_avatar = models.BooleanField(default=False)
    can_download = models.BooleanField(default=False)
    early_access = models.BooleanField(default=False)
    can_view_stats = models.BooleanField(default=False)

    def __str__(self):
        return self.get_tier_display()

    @property
    def is_unlimited_playlists(self):
        return self.max_playlists is None

    @property
    def is_unlimited_streams(self):
        return self.daily_stream_limit is None


class UserSubscription(models.Model):
    """A purchase/renewal record. The *current* plan for a user is whichever
    row is active and not expired -- see subscriptions.services. Keeping
    history (instead of one mutable field on User) is what lets 3.7's
    reporting look at past periods and what makes renewal logic (3.2) sane.
    """

    BILLING_PERIODS = (1, 3, 6, 12)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="subscriptions", on_delete=models.CASCADE
    )
    plan = models.ForeignKey(SubscriptionPlan, related_name="+", on_delete=models.PROTECT)
    billing_period_months = models.PositiveSmallIntegerField(
        choices=[(m, f"{m} month(s)") for m in BILLING_PERIODS]
    )
    price_paid = models.DecimalField(max_digits=10, decimal_places=0)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    # 3.6 (payment gateway) flips this on once the transaction is confirmed;
    # until then the subscription doesn't grant access.
    payment_status = models.CharField(
        max_length=12,
        choices=[("pending", "Pending"), ("paid", "Paid"), ("failed", "Failed")],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.end_date:
            self.end_date = self.start_date + relativedelta(months=self.billing_period_months)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user_id} - {self.plan.tier} until {self.end_date:%Y-%m-%d}"

    class Meta:
        ordering = ["-created_at"]

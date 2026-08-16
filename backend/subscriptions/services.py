from django.utils import timezone

from .models import SubscriptionPlan, UserSubscription

_BASIC_PLAN_CACHE = {}


def get_basic_plan():
    """The free tier always exists as a real row (seeded by the
    seed_subscription_plans management command) so 'no active subscription'
    and 'on the basic plan' are the same thing -- no special-casing needed
    anywhere else in the codebase."""
    if "plan" not in _BASIC_PLAN_CACHE:
        _BASIC_PLAN_CACHE["plan"], _ = SubscriptionPlan.objects.get_or_create(
            tier=SubscriptionPlan.Tier.BASIC,
            defaults={"price_monthly": 0, "max_playlists": 6, "daily_stream_limit": 60},
        )
    return _BASIC_PLAN_CACHE["plan"]


def get_active_subscription(user):
    """Returns the currently valid UserSubscription, or None if the user is
    on the free/basic tier."""
    return (
        UserSubscription.objects.filter(
            user=user, is_active=True, payment_status="paid", end_date__gte=timezone.now()
        )
        .select_related("plan")
        .order_by("-end_date")
        .first()
    )


def get_active_plan(user):
    sub = get_active_subscription(user)
    return sub.plan if sub else get_basic_plan()


def playlists_remaining(user):
    from playlists.models import Playlist

    plan = get_active_plan(user)
    if plan.is_unlimited_playlists:
        return None
    used = Playlist.objects.filter(owner=user).count()
    return max(plan.max_playlists - used, 0)


def daily_streams_remaining(user):
    from catalog.models import StreamLog

    plan = get_active_plan(user)
    if plan.is_unlimited_streams:
        return None
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    used_today = StreamLog.objects.filter(user=user, streamed_at__gte=today_start).count()
    return max(plan.daily_stream_limit - used_today, 0)

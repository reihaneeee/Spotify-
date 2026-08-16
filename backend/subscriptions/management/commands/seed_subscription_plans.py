from django.core.management.base import BaseCommand

from subscriptions.models import SubscriptionPlan

SEED = {
    "basic": dict(price_monthly=0, max_playlists=6, daily_stream_limit=60,
                  can_change_avatar=False, can_download=False, early_access=False, can_view_stats=False),
    "silver": dict(price_monthly=59000, max_playlists=100, daily_stream_limit=None,
                   can_change_avatar=True, can_download=True, early_access=False, can_view_stats=False),
    "gold": dict(price_monthly=99000, max_playlists=None, daily_stream_limit=None,
                 can_change_avatar=True, can_download=True, early_access=True, can_view_stats=True),
}


class Command(BaseCommand):
    help = "Seed the three subscription tiers described in the spec (table 1). Safe to re-run."

    def handle(self, *args, **options):
        for tier, fields in SEED.items():
            plan, created = SubscriptionPlan.objects.update_or_create(tier=tier, defaults=fields)
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'} plan: {plan}"))

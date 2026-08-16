from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import User


@receiver(pre_save, sender=User)
def notify_artist_status_change(sender, instance, **kwargs):
    """Spec 2.6 - artists get notified when support/admin approves or rejects
    their account. Whoever builds the approval endpoint (phase-1 parts 10/11)
    just needs to save() the User with the new artist_status; this signal
    takes care of the notification side so it isn't duplicated per-view."""
    if not instance.pk:
        return
    try:
        previous = User.objects.get(pk=instance.pk)
    except User.DoesNotExist:
        return

    if previous.artist_status == instance.artist_status:
        return
    if instance.artist_status not in (User.ArtistStatus.APPROVED, User.ArtistStatus.REJECTED):
        return

    from notifications.services import notify

    notify(
        recipient=instance,
        text=(
            "Verification Approved: your artist account has been accepted. You can now publish music!"
            if instance.artist_status == User.ArtistStatus.APPROVED
            else f"Verification Rejected: {instance.artist_rejection_reason or 'please review our platform policies.'}"
        ),
        link="/profile" if instance.artist_status == User.ArtistStatus.APPROVED else "/settings",
    )

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Album, Song


@receiver(post_save, sender=Song)
def notify_followers_of_new_single(sender, instance, created, **kwargs):
    """Spec 2.6: followers of an artist get notified when a new single/album
    drops, with enough payload for the frontend to offer direct playback."""
    if not created or instance.album_id:
        return  # album tracks are announced once, via the Album signal below
    _notify_followers(instance.artist, "single", instance)


@receiver(post_save, sender=Album)
def notify_followers_of_new_album(sender, instance, created, **kwargs):
    if not created:
        return
    _notify_followers(instance.artist, "album", instance)


def _notify_followers(artist, work_type, work):
    from accounts.models import Follow
    from notifications.services import notify

    followers = Follow.objects.filter(artist=artist).select_related("follower")
    label = "single" if work_type == "single" else "album"
    for follow in followers:
        notify(
            recipient=follow.follower,
            text=f'New Release: "{artist.public_name}" published a new {label} "{work.title}"!',
            work_type=work_type,
            work_data={"id": work.id, "title": work.title, "artist_name": artist.public_name},
            link=None if work_type == "single" else "/albums",
        )

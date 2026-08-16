from django.conf import settings
from django.db import models


class Playlist(models.Model):
    """Spec 2.7. Ownership is private -- a playlist only ever belongs to and
    is visible to its owner (plus staff, per 3.3)."""

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="playlists", on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    cover_image = models.ImageField(upload_to="covers/playlists/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.owner})"

    @property
    def song_count(self):
        return self.tracks.count()


class PlaylistTrack(models.Model):
    playlist = models.ForeignKey(Playlist, related_name="tracks", on_delete=models.CASCADE)
    song = models.ForeignKey("catalog.Song", related_name="in_playlists", on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("playlist", "song")
        ordering = ["added_at"]

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """Spec 2.6. Either `recipient` is set (a specific user), or `target_role`
    is set (a broadcast -- e.g. every support/admin gets pinged about a new
    artist signup). 'staff' covers both support and admin, matching the
    spec's rule that both roles receive ticket/verification alerts."""

    class TargetRole(models.TextChoices):
        LISTENER = "listener", "Listener"
        ARTIST = "artist", "Artist"
        STAFF = "staff", "Support & Admin"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="notifications", null=True, blank=True,
        on_delete=models.CASCADE,
    )
    target_role = models.CharField(max_length=10, choices=TargetRole.choices, null=True, blank=True)
    text = models.TextField()
    link = models.CharField(max_length=255, blank=True)
    work_type = models.CharField(max_length=10, blank=True)  # 'single' | 'album'
    work_data = models.JSONField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.text[:60]

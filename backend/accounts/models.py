from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    """Single user table for all four roles described in the spec (section 1):
    listener, artist, support, admin. Splitting these into separate tables would
    fight Django's auth system for no real benefit, so role-specific fields are
    kept nullable/blank and only make sense for their role (documented below).
    """

    class Role(models.TextChoices):
        LISTENER = "listener", "Listener"
        ARTIST = "artist", "Artist"
        SUPPORT = "support", "Support"
        ADMIN = "admin", "Admin"

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"
        PREFER_NOT_TO_SAY = "prefer_not_to_say", "Prefer not to say"

    class ArtistStatus(models.TextChoices):
        NOT_APPLICABLE = "n/a", "N/A"
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.LISTENER)

    # Listener + generic profile fields (spec 2.1 / 2.3)
    display_name = models.CharField(max_length=120, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=Gender.choices, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    accepted_privacy_policy = models.BooleanField(default=False)

    # Artist-only fields (spec 2.1 signup form / 2.4 / 2.10)
    artist_name = models.CharField(max_length=120, blank=True)
    bio = models.TextField(blank=True)
    portfolio_links = models.JSONField(default=list, blank=True)
    artist_status = models.CharField(
        max_length=16, choices=ArtistStatus.choices, default=ArtistStatus.NOT_APPLICABLE
    )
    artist_rejection_reason = models.TextField(blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    @property
    def is_verified_artist(self):
        return self.role == self.Role.ARTIST and self.artist_status == self.ArtistStatus.APPROVED

    @property
    def public_name(self):
        if self.role == self.Role.ARTIST:
            return self.artist_name or self.username
        return self.display_name or self.username

    @property
    def followers_count(self):
        return self.followers.count()

    @property
    def following_count(self):
        return self.following.count()

    # User preferences
    volume = models.FloatField(default=1.0)
    audio_quality = models.CharField(max_length=10, default="high")
    notifications_enabled = models.BooleanField(default=True)
    song_sort_by = models.CharField(max_length=50, default="newest")
    album_sort_by = models.CharField(max_length=50, default="newest")
    crossfade_enabled = models.BooleanField(default=False)
    repeat_mode = models.CharField(max_length=10, default="none")  # 'none', 'all', 'one'
    shuffle = models.BooleanField(default=False)


class Follow(models.Model):
    """A listener/user following an artist (spec 2.3 / 2.4)."""

    follower = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE)
    artist = models.ForeignKey(User, related_name="followers", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "artist")

    def __str__(self):
        return f"{self.follower_id} -> {self.artist_id}"

import os
from django.conf import settings
from django.db import models
from django.utils import timezone


class Album(models.Model):
    """Spec 2.8/2.10. Cover upload handling itself (the actual file-storage
    plumbing) is owned by phase-2 part 3.4; this model only defines the
    field the way 3.4 expects to fill it in."""

    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="albums", on_delete=models.CASCADE,
        limit_choices_to={"role": "artist"},
    )
    title = models.CharField(max_length=200)
    cover_image = models.ImageField(upload_to="covers/albums/", null=True, blank=True)
    genre = models.CharField(max_length=80, blank=True)
    release_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-release_date"]

    def __str__(self):
        return f"{self.title} - {self.artist}"

    @property
    def is_early_access(self):
        return self.release_date > timezone.localdate()

    @property
    def track_count(self):
        return self.songs.count()


class Song(models.Model):
    """Spec 2.8/2.9/2.10."""

    class Format(models.TextChoices):
        MP3 = "mp3", "MP3"
        WAV = "wav", "WAV"
        FLAC = "flac", "FLAC"

    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="songs", on_delete=models.CASCADE,
        limit_choices_to={"role": "artist"},
    )
    album = models.ForeignKey(
        Album, related_name="songs", null=True, blank=True, on_delete=models.SET_NULL
    )
    title = models.CharField(max_length=200)
    
    # ۳.۳ آپلود فایل‌های صوتی با پشتیبانی از دو کیفیت (High/Low Quality)
    audio_file = models.FileField(upload_to="songs/", null=True, blank=True, help_text="فایل اصلی / کیفیت بالا HQ (320kbps)")
    audio_file_low = models.FileField(upload_to="songs/low/", null=True, blank=True, help_text="فایل کیفیت پایین LQ (128kbps)")
    
    audio_format = models.CharField(max_length=8, choices=Format.choices, default=Format.MP3)
    cover_image = models.ImageField(upload_to="covers/songs/", null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    genre = models.CharField(max_length=80, blank=True)
    lyrics = models.TextField(blank=True)
    featured_artist_names = models.CharField(max_length=255, blank=True)
    release_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-release_date"]

    def __str__(self):
        return f"{self.title} - {self.artist}"

    @property
    def is_early_access(self):
        return self.release_date > timezone.localdate()

    @property
    def cover(self):
        """Falls back to the parent album cover, per common Spotify UX."""
        if self.cover_image:
            return self.cover_image
        if self.album and self.album.cover_image:
            return self.album.cover_image
        return None

    @property
    def play_count(self):
        return self.streams.exclude(user=self.artist).count()
    
    @property
    def unique_listeners_count(self):
        return self.streams.exclude(user=self.artist).values("user_id").distinct().count()


class StreamLog(models.Model):
    """One row per completed/started stream. Backs: the 60-plays/day free
    tier cap (3.2), the 'gold users see play/listener counts' feature
    (spec 2.8/2.9), and the monthly royalty report (3.7, another
    teammate's endpoint -- they aggregate this table, they don't recompute
    play counts on the frontend, per the spec's explicit warning in 3.7)."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="stream_logs", on_delete=models.CASCADE)
    song = models.ForeignKey(Song, related_name="streams", on_delete=models.CASCADE)
    streamed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["song", "streamed_at"]), models.Index(fields=["user", "streamed_at"])]


class UserPreference(models.Model):
    """
    ۳.۵ ذخیره پیش‌فرض‌ها و تنظیمات کاربران در بک‌اند
    هماهنگ‌سازی تنظیمات کاربر بین تمامی دستگاه‌ها
    """
    class AudioQuality(models.TextChoices):
        HIGH = "high", "High (320kbps)"
        LOW = "low", "Low (128kbps)"

    class RepeatMode(models.TextChoices):
        OFF = "off", "Off"
        ONE = "one", "Repeat One"
        ALL = "all", "Repeat All"

    class Theme(models.TextChoices):
        DARK = "dark", "Dark"
        LIGHT = "light", "Light"
        SYSTEM = "system", "System"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="preference",
    )
    audio_quality = models.CharField(
        max_length=10, choices=AudioQuality.choices, default=AudioQuality.HIGH
    )
    crossfade_enabled = models.BooleanField(default=False)
    crossfade_duration = models.PositiveIntegerField(default=5)  # مدت زمان Crossfade به ثانیه
    volume = models.FloatField(default=1.0)  # میزان صدا بین 0.0 تا 1.0
    autoplay = models.BooleanField(default=True)
    repeat_mode = models.CharField(
        max_length=10, choices=RepeatMode.choices, default=RepeatMode.OFF
    )
    shuffle_enabled = models.BooleanField(default=False)
    theme = models.CharField(
        max_length=10, choices=Theme.choices, default=Theme.DARK
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user}"
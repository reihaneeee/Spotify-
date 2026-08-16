# reports/models.py
from django.db import models
from django.conf import settings

class MonthlyArtistReport(models.Model):
    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name="monthly_reports"
    )
    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()  # 1-12
    unique_listeners = models.PositiveIntegerField(default=0)
    total_streams = models.PositiveIntegerField(default=0)
    calculated_reward = models.DecimalField(max_digits=15, decimal_places=0, default=0)
    is_settled = models.BooleanField(default=False)
    settled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('artist', 'year', 'month')
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.artist.public_name} - {self.year}/{self.month}"
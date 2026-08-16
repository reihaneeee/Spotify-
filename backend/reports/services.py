from django.db.models import Count, Q
from django.utils import timezone
from catalog.models import StreamLog, Song
from accounts.models import User
from .models import MonthlyArtistReport

REWARD_PER_STREAM = 50


def generate_monthly_report(year, month):
    """محاسبه و ذخیره گزارش ماهانه برای تمام هنرمندان"""
    start_date = timezone.datetime(year, month, 1, 0, 0, 0, tzinfo=timezone.get_current_timezone())
    if month == 12:
        end_date = timezone.datetime(year + 1, 1, 1, 0, 0, 0, tzinfo=timezone.get_current_timezone())
    else:
        end_date = timezone.datetime(year, month + 1, 1, 0, 0, 0, tzinfo=timezone.get_current_timezone())

    artists = User.objects.filter(role=User.Role.ARTIST)
    for artist in artists:
        artist_songs = Song.objects.filter(artist=artist)
        
        # استریم‌های این ماه (بدون استریم‌های خودِ هنرمند)
        streams_queryset = StreamLog.objects.filter(
            song__in=artist_songs,
            streamed_at__gte=start_date,
            streamed_at__lt=end_date
        ).exclude(user=artist)
        
        total_streams = streams_queryset.count()
        unique_listeners = streams_queryset.values('user').distinct().count()
        
        calculated_reward = total_streams * REWARD_PER_STREAM

        report, created = MonthlyArtistReport.objects.update_or_create(
            artist=artist,
            year=year,
            month=month,
            defaults={
                'total_streams': total_streams,
                'unique_listeners': unique_listeners,
                'calculated_reward': calculated_reward
            }
        )


def settle_artist_report(artist_id, year, month):
    """تسویه حساب یک هنرمند توسط ادمین"""
    try:
        report = MonthlyArtistReport.objects.get(artist_id=artist_id, year=year, month=month)
        report.is_settled = True
        report.settled_at = timezone.now()
        report.save()
        return True
    except MonthlyArtistReport.DoesNotExist:
        return False
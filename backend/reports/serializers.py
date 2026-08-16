# reports/serializers.py
from rest_framework import serializers
from .models import MonthlyArtistReport

class MonthlyArtistReportSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(source='artist.public_name', read_only=True)

    class Meta:
        model = MonthlyArtistReport
        fields = (
            'id', 'artist', 'artist_name', 'year', 'month', 
            'unique_listeners', 'total_streams', 'calculated_reward', 
            'is_settled', 'settled_at'
        )


class AdminDashboardStatsSerializer(serializers.Serializer):
    basic_users = serializers.IntegerField()
    silver_users = serializers.IntegerField()
    gold_users = serializers.IntegerField()
    revenue_this_month = serializers.DecimalField(max_digits=12, decimal_places=0)
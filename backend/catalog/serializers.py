from rest_framework import serializers
from accounts.serializers import UserPublicSerializer
from .models import Album, Song, UserPreference


class UserPreferenceSerializer(serializers.ModelSerializer):
    """سریالایزر دریافت و ویرایش پیش‌فرض‌های کاربر"""
    class Meta:
        model = UserPreference
        fields = (
            "audio_quality",
            "crossfade_enabled",
            "crossfade_duration",
            "volume",
            "autoplay",
            "repeat_mode",
            "shuffle_enabled",
            "theme",
        )


class SongSerializer(serializers.ModelSerializer):
    artist_detail = UserPublicSerializer(source="artist", read_only=True)
    album_title = serializers.CharField(source="album.title", read_only=True)
    play_count = serializers.IntegerField(read_only=True)
    unique_listeners_count = serializers.IntegerField(read_only=True)
    is_early_access = serializers.BooleanField(read_only=True)
    type = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = (
            "id", "title", "artist", "artist_detail", "album", "album_title",
            "audio_file", "audio_file_low", "audio_format", "cover_image", "duration_seconds",
            "genre", "lyrics", "featured_artist_names", "release_date",
            "is_early_access", "play_count", "unique_listeners_count", "created_at", "type",
        )
        read_only_fields = ("id", "artist", "created_at")

    def get_type(self, obj):
        return "single"

    def validate_album(self, album):
        request = self.context["request"]
        if album and album.artist_id != request.user.id and request.user.role not in ("support", "admin"):
            raise serializers.ValidationError("You can only add tracks to your own albums.")
        return album

    def create(self, validated_data):
        validated_data["artist"] = self.context["request"].user
        return super().create(validated_data)


class SongListSerializer(SongSerializer):
    """Slimmer payload for list views (archive/search, spec 2.8)."""

    class Meta(SongSerializer.Meta):
        fields = (
            "id", "title", "artist", "artist_detail", "album", "album_title",
            "audio_file", "audio_file_low", "cover_image", "duration_seconds", "release_date", "lyrics",
            "is_early_access", "play_count", "unique_listeners_count", "type",
        )


class AlbumSerializer(serializers.ModelSerializer):
    artist_detail = UserPublicSerializer(source="artist", read_only=True)
    track_count = serializers.IntegerField(read_only=True)
    is_early_access = serializers.BooleanField(read_only=True)
    tracks = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = (
            "id", "title", "artist", "artist_detail", "cover_image", "genre",
            "release_date", "is_early_access", "track_count", "tracks", "created_at", "type",
        )
        read_only_fields = ("id", "artist", "created_at")

    def get_type(self, obj):
        return "album"

    def get_tracks(self, obj):
        # پشتیبانی هوشمند و خودکار از هر دو حالت related_name='songs' یا related_name='song_set'
        songs_qs = getattr(obj, 'songs', None)
        if songs_qs is None:
            songs_qs = getattr(obj, 'song_set', None)
            
        if songs_qs is not None:
            return SongListSerializer(songs_qs.all(), many=True, context=self.context).data
        return []

    def create(self, validated_data):
        validated_data["artist"] = self.context["request"].user
        return super().create(validated_data)


class StreamResultSerializer(serializers.Serializer):
    play_count = serializers.IntegerField()
    daily_streams_remaining = serializers.IntegerField(allow_null=True)
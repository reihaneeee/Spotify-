from rest_framework import serializers

from catalog.models import Song
from catalog.serializers import SongListSerializer

from .models import Playlist, PlaylistTrack


class PlaylistSerializer(serializers.ModelSerializer):
    song_count = serializers.IntegerField(read_only=True)
    songs = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = ("id", "title", "cover_image", "song_count", "songs", "created_at")
        read_only_fields = ("id", "song_count", "songs", "created_at")

    def get_songs(self, obj):
        tracks = obj.tracks.select_related("song", "song__artist").order_by("added_at")
        return SongListSerializer([t.song for t in tracks], many=True).data

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)


class AddTrackSerializer(serializers.Serializer):
    song_id = serializers.PrimaryKeyRelatedField(queryset=Song.objects.all(), source="song")

    def create(self, validated_data):
        playlist = self.context["playlist"]
        track, _ = PlaylistTrack.objects.get_or_create(playlist=playlist, song=validated_data["song"])
        return track

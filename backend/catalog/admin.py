from django.contrib import admin

from .models import Album, Song, StreamLog


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ("title", "artist", "release_date")
    search_fields = ("title", "artist__artist_name")


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ("title", "artist", "album", "release_date")
    search_fields = ("title", "artist__artist_name")


@admin.register(StreamLog)
class StreamLogAdmin(admin.ModelAdmin):
    list_display = ("song", "user", "streamed_at")

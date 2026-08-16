from django.db.models import Count, Q, F
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema, OpenApiResponse, extend_schema_view

from subscriptions.permissions import WithinDailyStreamLimit
from subscriptions.services import daily_streams_remaining

from .models import Album, Song, StreamLog, UserPreference
from .permissions import IsOwningArtistOrReadOnly, visible_to
from .serializers import (
    AlbumSerializer, SongListSerializer, SongSerializer, 
    StreamResultSerializer, UserPreferenceSerializer
)


@extend_schema_view(
    list=extend_schema(tags=['Music Catalog']),
    retrieve=extend_schema(tags=['Music Catalog']),
    create=extend_schema(tags=['Music Catalog']),
    update=extend_schema(tags=['Music Catalog']),
    partial_update=extend_schema(tags=['Music Catalog']),
    destroy=extend_schema(tags=['Music Catalog']),
)
class AlbumViewSet(viewsets.ModelViewSet):
    """Spec 2.8/2.10 + 3.1 CRUD endpoints for the Album model."""

    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwningArtistOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["artist", "genre"]
    search_fields = ["title", "artist__artist_name", "artist__username"]
    ordering_fields = ["release_date", "title", "_play_count"]

    def get_queryset(self):
        # محاسبه تعداد پخش بدون احتساب استریم‌های خودِ هنرمند
        qs = Album.objects.select_related("artist").annotate(
            _play_count=Count("songs__streams", filter=~Q(songs__streams__user=F("artist")))
        )
        try:
            qs = qs.prefetch_related("songs")
        except Exception:
            qs = qs.prefetch_related("song_set")
            
        return qs.filter(visible_to(self.request.user)).distinct()


@extend_schema_view(
    list=extend_schema(tags=['Music Catalog']),
    retrieve=extend_schema(tags=['Music Catalog']),
    create=extend_schema(tags=['Music Catalog']),
    update=extend_schema(tags=['Music Catalog']),
    partial_update=extend_schema(tags=['Music Catalog']),
    destroy=extend_schema(tags=['Music Catalog']),
    stream=extend_schema(tags=['Music Catalog']),
)
class SongViewSet(viewsets.ModelViewSet):
    """Spec 2.8/2.9/2.10 + 3.1 CRUD endpoints for the Song model, plus the
    'stream' action that both phase-1 parts 2.8 (archive) and 2.9 (player)
    call every time a track actually plays."""

    permission_classes = [permissions.IsAuthenticated, IsOwningArtistOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["artist", "album", "genre"]
    search_fields = ["title", "artist__artist_name", "artist__username"]
    ordering_fields = ["release_date", "title", "_play_count"]

    def get_serializer_class(self):
        return SongListSerializer if self.action == "list" else SongSerializer

    def get_queryset(self):
        # محاسبه تعداد پخش بدون احتساب استریم‌های خودِ هنرمند
        qs = (
            Song.objects.select_related("artist", "album")
            .annotate(_play_count=Count("streams", filter=~Q(streams__user=F("artist"))))
        )
        return qs.filter(visible_to(self.request.user)).distinct()

    @extend_schema(
        description="ثبت یک استریم و اعمال محدودیت روزانه بر اساس اشتراک",
        responses={
            201: OpenApiResponse(description="Stream logged successfully", response=StreamResultSerializer),
            403: OpenApiResponse(description="Daily limit reached")
        }
    )
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, WithinDailyStreamLimit])
    def stream(self, request, pk=None):
        song = self.get_object()
        
        # اگر کاربر لاگین‌شده خودِ هنرمند باشد، استریم ثبت نمی‌شود
        if request.user != song.artist:
            StreamLog.objects.create(user=request.user, song=song)

        return Response(
            StreamResultSerializer(
                {
                    "play_count": song.play_count,  # استفاده از پراپرتی مدل جهت محاسبه دقیق
                    "daily_streams_remaining": daily_streams_remaining(request.user),
                }
            ).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=['User Preferences'])
class UserPreferenceView(generics.RetrieveUpdateAPIView):
    """
    Spec 3.5: دریافت و به‌روزرسانی تنظیمات پیش‌فرض کاربران جهت هماهنگی بین دستگاه‌ها
    """
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, _ = UserPreference.objects.get_or_create(user=self.request.user)
        return obj
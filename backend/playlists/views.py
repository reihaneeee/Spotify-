from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsOwner
from subscriptions.permissions import WithinPlaylistLimit
from subscriptions.services import playlists_remaining

from .models import Playlist, PlaylistTrack
from .serializers import AddTrackSerializer, PlaylistSerializer

from drf_spectacular.utils import extend_schema, OpenApiResponse, extend_schema_view

@extend_schema_view(
    list=extend_schema(tags=['Playlists']),
    retrieve=extend_schema(tags=['Playlists']),
    create=extend_schema(tags=['Playlists']),
    update=extend_schema(tags=['Playlists']),
    partial_update=extend_schema(tags=['Playlists']),
    destroy=extend_schema(tags=['Playlists']),
    add_track=extend_schema(tags=['Playlists']),
    remove_track=extend_schema(tags=['Playlists']),
)
class PlaylistViewSet(viewsets.ModelViewSet):
    """Spec 2.7 + 3.1/3.2: full CRUD, enforcing the tier-based playlist cap
    on creation (basic=6, silver=100, gold=unlimited)."""

    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated, WithinPlaylistLimit, IsOwner]

    def get_queryset(self):
        # Playlists are strictly private to their owner -- the spec never
        # lists them under the support/admin dashboard, unlike tickets or
        # artist approvals, so there is no staff bypass here (3.3 rule 1).
        qs = Playlist.objects.select_related("owner").prefetch_related("tracks__song")
        return qs.filter(owner=self.request.user)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if isinstance(response.data, dict) and "results" in response.data:
            response.data["playlists_remaining"] = playlists_remaining(request.user)
        return response

    @extend_schema(
        description="افزودن آهنگ به پلی‌لیست",
        request=AddTrackSerializer,
        responses={201: PlaylistSerializer}
    )

    @action(detail=True, methods=["post"], url_path="tracks")
    def add_track(self, request, pk=None):
        """POST /api/playlists/<id>/tracks/  {"song_id": <id>}"""
        playlist = self.get_object()
        serializer = AddTrackSerializer(data=request.data, context={"playlist": playlist})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PlaylistSerializer(playlist).data, status=status.HTTP_201_CREATED)

    @extend_schema(
        description="حذف آهنگ از پلی‌لیست (با استفاده از آیدی آهنگ)",
        responses={200: PlaylistSerializer}
    )
        
    @action(detail=True, methods=["delete"], url_path="tracks/(?P<song_id>[^/.]+)")
    def remove_track(self, request, pk=None, song_id=None):
        """DELETE /api/playlists/<id>/tracks/<song_id>/"""
        playlist = self.get_object()
        PlaylistTrack.objects.filter(playlist=playlist, song_id=song_id).delete()
        return Response(PlaylistSerializer(playlist).data)

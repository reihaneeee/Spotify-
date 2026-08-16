from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsOwningArtistOrReadOnly(BasePermission):
    """Spec 2.10 + 3.3: only the artist who owns a Song/Album (or staff) may
    create/update/delete it. Everyone authenticated can read (catalog
    browsing, spec 2.8, is not owner-restricted)."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "artist" and request.user.is_verified_artist)
            or (request.user and request.user.role in ("support", "admin"))
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.role in ("support", "admin"):
            return True
        return obj.artist_id == request.user.id


def visible_to(user):
    """Spec 2.2: 'gold users see an early-access section for new releases';
    everyone else simply doesn't see not-yet-released work (except the owning
    artist previewing their own catalog, and staff)."""
    from django.db.models import Q
    from django.utils import timezone

    from subscriptions.services import get_active_plan

    if user.role in ("support", "admin"):
        return Q()

    plan = get_active_plan(user)
    if plan.early_access:
        return Q()

    return Q(release_date__lte=timezone.localdate()) | Q(artist=user)

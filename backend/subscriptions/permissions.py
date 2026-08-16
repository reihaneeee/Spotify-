from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission

from .services import daily_streams_remaining, playlists_remaining


class WithinPlaylistLimit(BasePermission):
    """Spec 2.7 / 3.2: blocks POST /playlists/ once the user's subscription
    tier playlist cap is reached. GET/PATCH/DELETE are unaffected."""

    message = "Playlist limit reached for your subscription plan."

    def has_permission(self, request, view):
        # Only gate the "create a new playlist" action -- checking on
        # request.method alone would also block the add_track/remove_track
        # sub-actions, which are POST/DELETE on the same viewset but have
        # nothing to do with the playlist *count* limit.
        if getattr(view, "action", None) != "create":
            return True
        remaining = playlists_remaining(request.user)
        return remaining is None or remaining > 0


class WithinDailyStreamLimit(BasePermission):
    """Spec table 1 / 3.2: basic tier is capped at 60 streams/day. Applied
    only to the catalog 'stream' action, not to normal read/CRUD calls."""

    message = "Daily streaming limit reached for your subscription plan."

    def has_permission(self, request, view):
        remaining = daily_streams_remaining(request.user)
        return remaining is None or remaining > 0


def require_feature(user, feature_name, message):
    from .services import get_active_plan

    plan = get_active_plan(user)
    if not getattr(plan, feature_name, False):
        raise PermissionDenied(message)

"""
Shared access-control building blocks for phase 2 part 3.3 ("access level
management"). Every other app (catalog, playlists, subscriptions,
notifications) imports from here instead of re-inventing role checks, so the
two rules from the spec are enforced in exactly one place:

  1. No user may reach resources belonging to a user at the same or a higher
     privilege level than themselves (ROLE_LEVEL below).
  2. No user may reach a resource beyond what their subscription tier allows
     (see subscriptions.permissions for the tier-limit half of this rule).
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission

# Higher number = more privileged. Listener/artist are peers (both "level 0"):
# neither can manage the other's account. Support outranks listeners/artists
# but not other support/admin accounts; only admin outranks everyone.
ROLE_LEVEL = {
    "listener": 0,
    "artist": 0,
    "support": 1,
    "admin": 2,
}


def role_level(role):
    return ROLE_LEVEL.get(role, 0)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsSupportOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ("support", "admin")
        )


class IsArtist(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "artist")


class IsApprovedArtist(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "artist"
            and request.user.artist_status == "approved"
        )


class IsOwner(BasePermission):
    """Generic "you can only touch your own resource" check. Works for any
    model whose owning user is stored on one of the common field names."""

    owner_fields = ("owner", "user", "artist")

    def has_object_permission(self, request, view, obj):
        for field in self.owner_fields:
            if hasattr(obj, field):
                return getattr(obj, field + "_id", None) == request.user.id
        return False


class ReadOnlyOrIsOwner(IsOwner):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return super().has_object_permission(request, view, obj)


class NoAccessToEqualOrHigherRole(BasePermission):
    """Used on account-management endpoints (e.g. a support agent approving an
    artist, or an admin editing a support account). Blocks any attempt to
    touch a user whose role level is >= the requester's, unless the requester
    is admin (who sits at the top and manages everyone, including peers, by
    spec section 2.11)."""

    def has_object_permission(self, request, view, obj):
        requester = request.user
        if requester.role == "admin":
            return True
        if request.method in SAFE_METHODS:
            return role_level(obj.role) < role_level(requester.role) or obj.id == requester.id
        return role_level(obj.role) < role_level(requester.role)

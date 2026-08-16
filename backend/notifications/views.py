from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer

from drf_spectacular.utils import extend_schema, OpenApiResponse, extend_schema_view


@extend_schema_view(
    list=extend_schema(tags=['Notifications']),
    retrieve=extend_schema(tags=['Notifications']),
    mark_read=extend_schema(tags=['Notifications']),
    mark_all_read=extend_schema(tags=['Notifications']),
    destroy=extend_schema(tags=['Notifications'])
)
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Spec 2.6. list/retrieve/mark-read/mark-all-read/delete for the
    notifications panel used by every role."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role_filter = Q(target_role=user.role)
        if user.role in ("support", "admin"):
            role_filter |= Q(target_role=Notification.TargetRole.STAFF)
        return Notification.objects.filter(Q(recipient=user) | (Q(recipient__isnull=True) & role_filter))

    @extend_schema(
        description="علامت‌گذاری یک اعلان به‌عنوان خوانده‌شده",
        responses={200: NotificationSerializer}
    )

    @action(detail=True, methods=["post"], url_path="read")
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notif).data)

    @extend_schema(
        description="علامت‌گذاری همه اعلان‌ها به‌عنوان خوانده‌شده",
        responses={200: OpenApiResponse(description="All notifications marked as read")}
    )
    
    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({"detail": "All notifications marked as read."})

    def destroy(self, request, *args, **kwargs):
        # ReadOnlyModelViewSet has no destroy by default; spec 2.6 needs a
        # per-card "delete notification" button, so we add DELETE explicitly.
        notif = self.get_object()
        notif.delete()
        return Response(status=204)

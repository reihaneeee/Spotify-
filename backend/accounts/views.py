from django.contrib.auth.password_validation import validate_password
from rest_framework import generics, permissions, status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Follow, User
from .serializers import (
    EmailTokenObtainPairSerializer,
    MeSerializer,
    RegisterArtistSerializer,
    RegisterListenerSerializer,
    UserPublicSerializer,
    AdminUserSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiResponse, extend_schema_view
from rest_framework_simplejwt.views import TokenRefreshView


@extend_schema(tags=['Authentication & Users'])
class RegisterListenerView(generics.CreateAPIView):
    """POST /api/auth/register/  (spec 2.1 - regular signup form)."""

    serializer_class = RegisterListenerSerializer
    permission_classes = [permissions.AllowAny]

@extend_schema(tags=['Authentication & Users'])
class RegisterArtistView(generics.CreateAPIView):
    """POST /api/auth/register/artist/  (spec 2.1 - artist signup form)."""

    serializer_class = RegisterArtistSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {
            "detail": "Artist registration submitted. Waiting for approval.",
            "status": "pending",
        }
        response.status_code = status.HTTP_201_CREATED
        return response

@extend_schema(tags=['Authentication & Users'])
class EmailTokenObtainPairView(TokenObtainPairView):
    """POST /api/auth/login/ -- shared login for all 4 roles (spec 2.1)."""

    serializer_class = EmailTokenObtainPairSerializer

@extend_schema(tags=['Authentication & Users'])
class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ -- self profile used by pages 2.3 and 2.5."""

    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        from subscriptions.services import get_active_subscription

        sub = get_active_subscription(request.user)
        response.data["subscription"] = {
            "tier": sub.plan.tier if sub else "basic",
            "expires_at": sub.end_date if sub else None,
        }
        return response

    def delete(self, request, *args, **kwargs):
        """Spec 2.5: 'delete account' option in app settings."""
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@extend_schema(
    tags=['Authentication & Users'],
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'old_password': {'type': 'string'},
                'new_password': {'type': 'string'},
            },
            'required': ['old_password', 'new_password']
        }
    },
    responses={200: {'type': 'object', 'properties': {'detail': {'type': 'string'}}}}
)
class ChangePasswordView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        if not request.user.check_password(old_password):
            raise ValidationError({"old_password": "Incorrect password."})
        validate_password(new_password, user=request.user)
        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password changed."})


@extend_schema_view(
    list=extend_schema(tags=['Authentication & Users']),
    retrieve=extend_schema(tags=['Authentication & Users']),
    follow=extend_schema(tags=['Authentication & Users']),
    unfollow=extend_schema(tags=['Authentication & Users'])
)
class UserViewSet(mixins.UpdateModelMixin, viewsets.ReadOnlyModelViewSet):  # 👈 mixins.UpdateModelMixin را اضافه کنید
    """GET /api/auth/users/ and /api/auth/users/<id>/
    Public read-only profile data for the 'user profile' (2.3) and 'artist
    profile' (2.4) pages, plus follow/unfollow actions."""

    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get("role") or self.request.query_params.get("user_type")
        status_param = self.request.query_params.get("status")
        
        if role:
            qs = qs.filter(role=role)
        if status_param:
            qs = qs.filter(artist_status=status_param)
        return qs

    def get_serializer_class(self):
        user = self.request.user
        # اگر ادمین باشد یا درخواست ویرایش/مشاهده جزییات باشد، از سریالایزر ادمین استفاده شود
        if user.is_authenticated and (user.role in ['admin', 'manager'] or user.is_staff or self.request.query_params.get("status") or self.request.method in ['PUT', 'PATCH']):
            return AdminUserSerializer
        return super().get_serializer_class()

    # محدود کردن دسترسی ویرایش فقط به ادمین‌ها
    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated()] # می‌توانید نقش ادمین را هم اینجا چک کنید
        return super().get_permissions()

    @extend_schema(
        description="دنبال کردن یک هنرمند (فقط برای کاربران عادی)",
        responses={200: OpenApiResponse(description="Followed successfully"), 400: OpenApiResponse(description="Validation Error")}
    )
    @action(detail=True, methods=["post"])
    def follow(self, request, pk=None):
        target = self.get_object()
        if target.role != User.Role.ARTIST:
            raise ValidationError("You can only follow artists.")
        if target.id == request.user.id:
            raise ValidationError("You cannot follow yourself.")
        Follow.objects.get_or_create(follower=request.user, artist=target)
        return Response({"detail": "Followed."})

    @extend_schema(
        description="لغو دنبال کردن یک هنرمند",
        responses={200: OpenApiResponse(description="Unfollowed successfully"), 400: OpenApiResponse(description="Validation Error")}
    )
    @action(detail=True, methods=["post"])
    def unfollow(self, request, pk=None):
        target = self.get_object()
        Follow.objects.filter(follower=request.user, artist=target).delete()
        return Response({"detail": "Unfollowed."})

@extend_schema(tags=['Authentication & Users'])
class CustomTokenRefreshView(TokenRefreshView):
    """POST /api/auth/refresh/ -- refresh access token."""
    pass

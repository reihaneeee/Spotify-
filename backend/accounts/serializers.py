from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Follow, User


class RegisterListenerSerializer(serializers.ModelSerializer):
    """Spec 2.1: display name, email, password (+confirmation), birth date,
    gender, and privacy-policy acceptance."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "email", "password", "password_confirm", "display_name",
            "birth_date", "gender", "accepted_privacy_policy",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        if not attrs.get("accepted_privacy_policy"):
            raise serializers.ValidationError(
                {"accepted_privacy_policy": "You must accept the privacy policy."}
            )
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(role=User.Role.LISTENER, **validated_data)


class RegisterArtistSerializer(serializers.ModelSerializer):
    """Spec 2.1: email, password, artist name, and a portfolio -> goes into the
    'pending approval' state until a support agent or admin reviews it
    (spec 2.11.1)."""

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("email", "password", "artist_name", "portfolio_links", "bio")

    def create(self, validated_data):
        return User.objects.create_user(
            role=User.Role.ARTIST,
            artist_status=User.ArtistStatus.PENDING,
            **validated_data,
        )


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Shared login endpoint for all four roles (spec 2.1)."""

    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserPublicSerializer(self.user).data
        return data


class UserPublicSerializer(serializers.ModelSerializer):
    """What anyone is allowed to see about another user: safe for the
    'artist profile' (2.4) and 'user profile' (2.3) pages."""

    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "username", "role", "display_name", "artist_name",
            "public_name", "bio", "avatar", "followers_count",
            "following_count", "is_verified_artist", "is_following",
        )
        read_only_fields = fields

    def get_is_following(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=request.user, artist=obj).exists()

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", "email", "username", "role", "display_name", "artist_name",
            "bio", "avatar", "portfolio_links", "artist_status", "date_joined"
        )

class MeSerializer(serializers.ModelSerializer):
    """Full self-profile, used by the 'user profile' edit form (2.3) and
    'app settings' page (2.5). current_plan / daily_streams_used are
    computed by the subscriptions app and merged in the view."""

    class Meta:
        model = User
        fields = (
            "id", "email", "username", "role", "display_name", "artist_name",
            "bio", "birth_date", "gender", "avatar", "portfolio_links",
            "artist_status", "artist_rejection_reason", "followers_count",
            "following_count", "date_joined",
            "volume", "audio_quality", "notifications_enabled",
            "song_sort_by", "album_sort_by",
            "crossfade_enabled", "repeat_mode", "shuffle", # <-- فیلدهای جدید
        )
        read_only_fields = (
            "id", "email", "username", "role", "artist_status",
            "artist_rejection_reason", "followers_count", "following_count",
            "date_joined",
        )

    def validate_avatar(self, value):
        user = self.instance
        if value and user is not None:
            # Allow artists to update avatar regardless of subscription plan
            if user.role == User.Role.ARTIST:
                return value

            from subscriptions.services import get_active_plan

            plan = get_active_plan(user)
            if not plan.can_change_avatar:
                raise serializers.ValidationError(
                    "Your subscription plan does not allow changing the profile picture."
                )
        return value
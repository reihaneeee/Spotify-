from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

router = DefaultRouter()
router.register("users", views.UserViewSet, basename="user")

urlpatterns = [
    path("register/", views.RegisterListenerView.as_view(), name="register-listener"),
    path("register/artist/", views.RegisterArtistView.as_view(), name="register-artist"),
    path("login/", views.EmailTokenObtainPairView.as_view(), name="login"),
    #path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("refresh/", views.CustomTokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.MeView.as_view(), name="me"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    path("", include(router.urls)),
]

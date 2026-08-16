from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("songs", views.SongViewSet, basename="song")
router.register("albums", views.AlbumViewSet, basename="album")

urlpatterns = [
    # ۳.۵ Endpoint دریافت و ذخیره تنظیمات پیش‌فرض کاربر
    path("preferences/", views.UserPreferenceView.as_view(), name="user-preferences"),
] + router.urls
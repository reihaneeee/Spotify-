from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("", views.PlaylistViewSet, basename="playlist")

urlpatterns = router.urls

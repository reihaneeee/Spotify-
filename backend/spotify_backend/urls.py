from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework import permissions

from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/subscriptions/", include("subscriptions.urls")),
    path("api/catalog/", include("catalog.urls")),
    path("api/playlists/", include("playlists.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/tickets/", include("tickets.urls")),
    # Part 6.3 and 7.3
    path("api/payments/", include("payments.urls")), 
    path("api/reports/", include("reports.urls")),

    # For Swagger
    #path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    #path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('swagger/schema/', SpectacularAPIView.as_view(), name='schema'),
    # مسیر UI Swagger
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # مسیر ReDoc
    path('redoc/', SpectacularSwaggerView.as_view(url_name='schema', template_name='redoc.html'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

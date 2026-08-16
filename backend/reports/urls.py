# reports/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # هنرمند
    path('artist/', views.ArtistReportView.as_view(), name='artist-reports'),
    path('artist/overview/', views.ArtistOverviewStatsView.as_view(), name='artist-overview'),
    # ادمین
    path('admin/', views.AdminReportListView.as_view(), name='admin-reports'),
    path('admin/stats/', views.AdminDashboardStatsView.as_view(), name='admin-stats'),
    path('admin/settle/<int:artist_id>/', views.AdminSettleView.as_view(), name='admin-settle'),
    path('admin/generate/', views.GenerateMonthlyReportView.as_view(), name='admin-generate'),
]
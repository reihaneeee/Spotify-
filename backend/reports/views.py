# reports/views.py
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from django.utils import timezone

from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer, extend_schema, OpenApiParameter

from accounts.permissions import IsAdmin, IsApprovedArtist
from accounts.models import User
from subscriptions.models import UserSubscription
from .models import MonthlyArtistReport
from .services import settle_artist_report, generate_monthly_report
from .serializers import MonthlyArtistReportSerializer, AdminDashboardStatsSerializer

from django.db.models import Q, Sum
from catalog.models import StreamLog, Song
# --- برای هنرمند ---
@extend_schema(tags=['Reports & Analytics'])
class ArtistReportView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsApprovedArtist]
    serializer_class = MonthlyArtistReportSerializer

    def get_queryset(self):
        # فقط گزارش‌های هنرمند خودش را برگردان
        return MonthlyArtistReport.objects.filter(artist=self.request.user).order_by('-year', '-month')


# --- برای ادمین ---
@extend_schema(tags=['Reports & Analytics'])
class AdminReportListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    serializer_class = MonthlyArtistReportSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter(name='year', type=int, description='سال (مثلاً 2026)', required=False),
            OpenApiParameter(name='month', type=int, description='ماه (۱ تا ۱۲)', required=False),
        ]
    )
    def get(self, request, *args, **kwargs):
        now = timezone.now()
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        try:
            year = int(year) if year else now.year
            month = int(month) if month else now.month
        except (ValueError, TypeError):
            year, month = now.year, now.month

        # ۱. محاسبه آمار ماه جاری
        generate_monthly_report(year, month)

        # ۲. دریافت گزارش‌هایی که حداقل یک استریم داشته‌اند
        queryset = MonthlyArtistReport.objects.filter(
            year=year,
            month=month,
            total_streams__gt=0
        )

        # ۳. اعمال فیلتر تایید بر اساس فیلدهای واقعی موجود در مدل User
        user_field_names = [f.name for f in User._meta.get_fields()]

        if 'artist_status' in user_field_names:
            queryset = queryset.filter(artist__artist_status='approved')
        elif 'status' in user_field_names:
            queryset = queryset.filter(artist__status='approved')

        queryset = queryset.select_related('artist').order_by('artist__artist_name')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


@extend_schema(tags=['Reports & Analytics'])
class AdminSettleView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    @extend_schema(
        description="تسویه حساب یک هنرمند برای ماه مشخص (فقط ادمین)",
        request=inline_serializer(
            name="SettleRequest",
            fields={
                'year': serializers.IntegerField(),
                'month': serializers.IntegerField(min_value=1, max_value=12),
            }
        ),
        responses={
            200: OpenApiResponse(description="Settled successfully"),
            404: OpenApiResponse(description="Report not found")
        }
    )

    def post(self, request, artist_id):
        year = request.data.get('year')
        month = request.data.get('month')
        
        if not year or not month:
            return Response({"error": "Year and month are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        success = settle_artist_report(artist_id, int(year), int(month))
        if success:
            return Response({"message": "Settled successfully."})
        return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(tags=['Reports & Analytics'])
class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        # کاربرانی که اشتراک فعال نقره‌ای یا طلایی دارند
        silver_gold_user_ids = UserSubscription.objects.filter(
            is_active=True, 
            payment_status='paid'
        ).filter(Q(plan__tier='silver') | Q(plan__tier='gold')).values_list('user_id', flat=True).distinct()

        # تعداد کاربران با اشتراک نقره‌ای
        silver_users_count = UserSubscription.objects.filter(
            is_active=True, 
            payment_status='paid', 
            plan__tier='silver'
        ).values('user').distinct().count()

        # تعداد کاربران با اشتراک طلایی
        gold_users_count = UserSubscription.objects.filter(
            is_active=True, 
            payment_status='paid', 
            plan__tier='gold'
        ).values('user').distinct().count()

        # کاربران Basic: تمام کاربرانی که اشتراک نقره‌ای یا طلایی ندارند
        basic_users_count = User.objects.exclude(id__in=silver_gold_user_ids).count()

        # درآمد ماه جاری (فقط اشتراک‌های غیر Basic)
        current_month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0)
        revenue_this_month = UserSubscription.objects.filter(
            created_at__gte=current_month_start,
            payment_status='paid'
        ).exclude(plan__tier='basic').aggregate(total=Sum('price_paid'))['total'] or 0

        data = {
            'basic_users': basic_users_count,
            'silver_users': silver_users_count,
            'gold_users': gold_users_count,
            'revenue_this_month': revenue_this_month
        }

        serializer = AdminDashboardStatsSerializer(data)
        return Response(serializer.data)


@extend_schema(tags=['Reports & Analytics'])
# این ویو برای محاسبه ماهانه توسط مدیر صدا زده می‌شود (یا می‌توان با کرون‌جاب خودکار کرد)
class GenerateMonthlyReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    @extend_schema(
        description="تولید دستی گزارش ماهانه برای همه هنرمندان (فقط ادمین)",
        request=inline_serializer(
            name="GenerateReportRequest",
            fields={
                'year': serializers.IntegerField(),
                'month': serializers.IntegerField(min_value=1, max_value=12),
            }
        ),
        responses={
            200: OpenApiResponse(description="Report generated successfully"),
            400: OpenApiResponse(description="Bad Request")
        }
    )
    
    def post(self, request):
        year = request.data.get('year')
        month = request.data.get('month')
        if not year or not month:
            return Response({"error": "Year and month required."}, status=status.HTTP_400_BAD_REQUEST)
        
        generate_monthly_report(int(year), int(month))
        return Response({"message": f"Report for {year}/{month} generated."})

@extend_schema(tags=['Reports & Analytics'])
class ArtistOverviewStatsView(APIView):
    """دریافت آمار لحظه‌ای کل کاتالوگ هنرمند (تعداد کل استریم‌ها و شنوندگان یکتا)"""
    permission_classes = [permissions.IsAuthenticated, IsApprovedArtist]

    def get(self, request):
        artist = request.user
        artist_songs = Song.objects.filter(artist=artist)
        
        # استریم‌های کل آثار هنرمند بدون احتساب خودش
        valid_streams = StreamLog.objects.filter(song__in=artist_songs).exclude(user=artist)
        
        total_streams = valid_streams.count()
        # تعداد کاربران یکتایی که حداقل یک بار به یکی از آهنگ‌های این هنرمند گوش داده‌اند
        unique_listeners = valid_streams.values('user_id').distinct().count()
        
        return Response({
            "total_streams": total_streams,
            "unique_listeners": unique_listeners
        })
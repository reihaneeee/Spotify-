# subscriptions/views.py
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin

from .models import SubscriptionPlan, UserSubscription
from .serializers import (
    AdminPriceUpdateSerializer,
    SubscribeSerializer,
    SubscriptionPlanSerializer,
    UserSubscriptionSerializer,
)
from .services import get_active_subscription

from drf_spectacular.utils import extend_schema, OpenApiResponse, extend_schema_view, inline_serializer


@extend_schema_view(
    list=extend_schema(tags=['Subscriptions & Plans']),
    retrieve=extend_schema(tags=['Subscriptions & Plans']),
    price=extend_schema(tags=['Subscriptions & Plans']),
)
class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/subscriptions/plans/ -- public price table (spec table 1)."""

    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        description="تغییر قیمت اشتراک توسط ادمین (پویا)",
        request=AdminPriceUpdateSerializer,
        responses={200: SubscriptionPlanSerializer}
    )
    @action(detail=True, methods=["patch"], permission_classes=[IsAdmin])
    def price(self, request, pk=None):
        """PATCH /api/subscriptions/plans/<tier>/price/ (admin only, spec
        2.11.3 'update prices' button)."""
        plan = self.get_object()
        serializer = AdminPriceUpdateSerializer(plan, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(SubscriptionPlanSerializer(plan).data)

    def get_object(self):
        return SubscriptionPlan.objects.get(tier=self.kwargs["pk"])


@extend_schema(tags=['Subscriptions & Plans'])
class AdminDynamicPricingView(APIView):
    """GET & POST /api/subscriptions/admin/pricing/
    مدیریت همزمان قیمت اشتراک‌های نقره‌ای و طلایی (Dynamic Pricing Control)
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    @extend_schema(
        description="دریافت قیمت‌های فعلی اشتراک Silver و Gold",
        responses={
            200: inline_serializer(
                name="GetPricingResponse",
                fields={
                    'silver_price': serializers.IntegerField(),
                    'gold_price': serializers.IntegerField(),
                }
            )
        }
    )
    def get(self, request):
        silver_plan = SubscriptionPlan.objects.filter(tier='silver').first()
        gold_plan = SubscriptionPlan.objects.filter(tier='gold').first()

        return Response({
            "silver_price": silver_plan.price_monthly if silver_plan else 0,
            "gold_price": gold_plan.price_monthly if gold_plan else 0,
        })

    @extend_schema(
        description="ثبت و اعمال همزمان قیمت‌های جدید برای اشتراک Silver و Gold",
        request=inline_serializer(
            name="UpdateDynamicPricingRequest",
            fields={
                'silver_price': serializers.DecimalField(max_digits=10, decimal_places=0, required=False),
                'gold_price': serializers.DecimalField(max_digits=10, decimal_places=0, required=False),
            }
        ),
        responses={200: OpenApiResponse(description="Prices updated successfully")}
    )
    def post(self, request):
        silver_price = request.data.get("silver_price")
        gold_price = request.data.get("gold_price")

        if silver_price is not None:
            SubscriptionPlan.objects.filter(tier="silver").update(price_monthly=silver_price)

        if gold_price is not None:
            SubscriptionPlan.objects.filter(tier="gold").update(price_monthly=gold_price)

        silver_plan = SubscriptionPlan.objects.filter(tier='silver').first()
        gold_plan = SubscriptionPlan.objects.filter(tier='gold').first()

        return Response({
            "message": "قیمت‌های جدید با موفقیت اعمال شدند.",
            "silver_price": silver_plan.price_monthly if silver_plan else 0,
            "gold_price": gold_plan.price_monthly if gold_plan else 0,
        }, status=status.HTTP_200_OK)


@extend_schema(tags=['Subscriptions & Plans'])
class MySubscriptionView(generics.GenericAPIView):
    """GET /api/subscriptions/my/ -- used by the 'app settings' page (2.5) to
    show the current plan and by the frontend to compute UI limits without
    duplicating the pricing table."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sub = get_active_subscription(request.user)
        if sub:
            return Response(UserSubscriptionSerializer(sub).data)
        from .services import get_basic_plan

        return Response(
            {
                "plan": SubscriptionPlanSerializer(get_basic_plan()).data,
                "is_active": True,
                "end_date": None,
            }
        )


@extend_schema(tags=['Subscriptions & Plans'])
class SubscribeView(generics.GenericAPIView):
    """POST /api/subscriptions/subscribe/ (spec 3.2 + 3.6 handoff point)."""

    serializer_class = SubscribeSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        description="ایجاد اشتراک جدید (به حالت انتظار پرداخت)",
        request=SubscribeSerializer,
        responses={201: OpenApiResponse(description="Subscription created"), 400: OpenApiResponse(description="Bad Request")}
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tier = serializer.validated_data["tier"]
        months = serializer.validated_data["billing_period_months"]
        plan = SubscriptionPlan.objects.get(tier=tier)
        price = plan.price_monthly * months

        # Deactivate any previous subscription so only one is ever "current".
        UserSubscription.objects.filter(user=request.user, is_active=True).update(is_active=False)

        sub = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            billing_period_months=months,
            price_paid=price,
            payment_status="pending",
        )
        return Response(
            {
                "subscription": UserSubscriptionSerializer(sub).data,
                "detail": "Subscription created; awaiting payment confirmation.",
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=['Subscriptions & Plans'])
class ConfirmPaymentView(generics.GenericAPIView):
    """POST /api/subscriptions/<id>/confirm-payment/
    Placeholder hook for whoever wires up 3.6 (payment gateway): call this
    once the gateway confirms the transaction succeeded."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        from dateutil.relativedelta import relativedelta

        sub = UserSubscription.objects.get(pk=pk, user=request.user)
        sub.payment_status = request.data.get("status", "paid")
        if sub.payment_status == "paid":
            sub.start_date = timezone.now()
            sub.end_date = sub.start_date + relativedelta(months=sub.billing_period_months)
            sub.is_active = True
        sub.save()
        return Response(UserSubscriptionSerializer(sub).data)
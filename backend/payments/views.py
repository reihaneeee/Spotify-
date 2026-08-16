# payments/views.py
from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import redirect

from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer

from subscriptions.models import SubscriptionPlan, UserSubscription
from .models import Transaction
from .services import PaymentGateway

@extend_schema(tags=['Payments'])
class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        description="شروع فرآیند پرداخت و دریافت لینک درگاه زرین‌پال",
        request=inline_serializer(
            name="PaymentRequest",
            fields={
                'tier': serializers.ChoiceField(choices=['silver', 'gold']),
                'billing_period_months': serializers.ChoiceField(choices=[1, 3, 6, 12]),
            }
        ),
        responses={
            200: OpenApiResponse(description="Returns payment_url and authority"),
            400: OpenApiResponse(description="Bad Request")
        }
    )
    def post(self, request):
        tier = request.data.get("tier")
        months = request.data.get("billing_period_months")

        if not tier or not months:
            return Response({"error": "Tier and billing period are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = SubscriptionPlan.objects.get(tier=tier)
            amount = plan.price_monthly * int(months)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Invalid tier."}, status=status.HTTP_404_NOT_FOUND)

        # ۱. ایجاد اشتراک با وضعیت pending
        sub = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            billing_period_months=int(months),
            price_paid=amount,
            payment_status="pending"
        )

        # ۲. ایجاد تراکنش
        transaction = Transaction.objects.create(
            user_subscription=sub,
            amount=amount
        )

        # ۳. ذخیره کردن ID تراکنش در یک متغیر قبل از استفاده (رفع خطای transaction_id undefined)
        transaction_id = transaction.id

        # ۴. شروع فرآیند پرداخت با زرین‌پال
        gateway = PaymentGateway()
        callback_url = f"http://localhost:8000/api/payments/callback/{transaction_id}/"
        result = gateway.request_payment(amount, f"اشتراک {plan.tier}", callback_url)

        if result["success"]:
            transaction.authority = result["authority"]
            transaction.save()
            return Response({
                "payment_url": result["payment_url"],
                "authority": result["authority"],
                "transaction_id": transaction_id
            })
        else:
            return Response({"error": result["message"]}, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(tags=['Payments'])
class PaymentCallbackView(APIView):
    permission_classes = []  # عمومی است چون درگاه به این آدرس می‌آید

    def get(self, request, transaction_id):
        authority = request.GET.get("Authority")
        status_param = request.GET.get("Status")

        try:
            transaction = Transaction.objects.get(id=transaction_id)
        except Transaction.DoesNotExist:
            return redirect(f"http://localhost:5173/subscription-result?status=failed&message=TransactionNotFound")

        # ۵. تایید پرداخت با زرین‌پال
        gateway = PaymentGateway()
        result = gateway.verify_payment(authority, transaction.amount)

        if status_param == "OK" and result["success"]:
            transaction.status = Transaction.Status.PAID
            transaction.save()

            # تایید اشتراک کاربر
            sub = transaction.user_subscription
            sub.payment_status = "paid"
            sub.is_active = True
            sub.save()

            # بستن اشتراک‌های قدیمی
            UserSubscription.objects.filter(user=sub.user, is_active=True).exclude(id=sub.id).update(is_active=False)

            return redirect(f"http://localhost:5173/subscription-result?status=success&ref_id={result['ref_id']}")
        else:
            transaction.status = Transaction.Status.FAILED
            transaction.save()
            return redirect(f"http://localhost:5173/subscription-result?status=failed&message={result.get('message', '')}")
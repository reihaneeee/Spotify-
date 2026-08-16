from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .views import AdminDynamicPricingView, SubscriptionPlanViewSet, MySubscriptionView, SubscribeView, ConfirmPaymentView

router = DefaultRouter()
router.register("plans", views.SubscriptionPlanViewSet, basename="plan")

urlpatterns = [
    path("my/", views.MySubscriptionView.as_view(), name="my-subscription"),
    path("subscribe/", views.SubscribeView.as_view(), name="subscribe"),
    path("<int:pk>/confirm-payment/", views.ConfirmPaymentView.as_view(), name="confirm-payment"),
    path('admin/pricing/', AdminDynamicPricingView.as_view(), name='admin-dynamic-pricing'),
    path("", include(router.urls)),
]

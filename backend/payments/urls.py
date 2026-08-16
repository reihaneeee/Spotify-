# payments/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreatePaymentView.as_view(), name='create-payment'),
    path('callback/<int:transaction_id>/', views.PaymentCallbackView.as_view(), name='payment-callback'),
]
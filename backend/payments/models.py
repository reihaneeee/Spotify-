# payments/models.py
from django.db import models
from django.conf import settings

class Transaction(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    user_subscription = models.ForeignKey(
        "subscriptions.UserSubscription", 
        on_delete=models.CASCADE,
        related_name="transactions"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=0)
    authority = models.CharField(max_length=255, blank=True, null=True)  # مرجع درگاه
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transaction {self.id} - {self.status}"
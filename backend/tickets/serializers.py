from rest_framework import serializers
from .models import Ticket, TicketMessage

class TicketMessageSerializer(serializers.ModelSerializer):
    sender_type = serializers.SerializerMethodField()

    class Meta:
        model = TicketMessage
        fields = ['id', 'sender', 'sender_type', 'text', 'created_at']
        read_only_fields = ['id', 'sender', 'sender_type', 'created_at']

    def get_sender_type(self, obj):
        user = obj.sender
        if user.is_staff or getattr(user, 'role', '') in ['admin', 'manager', 'support']:
            return 'support'
        return 'user'

class TicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = ['id', 'user', 'user_name', 'subject', 'status', 'created_at', 'updated_at', 'messages']
        read_only_fields = ['id', 'user', 'user_name', 'created_at', 'updated_at', 'messages']

    def get_user_name(self, obj):
        return obj.user.email or obj.user.username or f"User #{obj.user.id}"
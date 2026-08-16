from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Ticket, TicketMessage
from .serializers import TicketSerializer

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', '') in ['admin', 'manager', 'support']:
            return Ticket.objects.all().order_by('-updated_at')
        return Ticket.objects.filter(user=user).order_by('-updated_at')

    def perform_create(self, serializer):
        ticket = serializer.save(user=self.request.user)
        message_text = self.request.data.get('message', '')
        if message_text:
            TicketMessage.objects.create(ticket=ticket, sender=self.request.user, text=message_text)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        text = request.data.get('text') or request.data.get('message')
        if not text:
            return Response({'error': 'Message text is required'}, status=status.HTTP_400_BAD_REQUEST)

        TicketMessage.objects.create(ticket=ticket, sender=request.user, text=text)

        if request.user.is_staff or getattr(request.user, 'role', '') in ['admin', 'manager', 'support']:
            ticket.status = 'replied'
        else:
            ticket.status = 'open'
        ticket.save()

        return Response(TicketSerializer(ticket).data)

    @action(detail=True, methods=['patch'])
    def close(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'closed'
        ticket.save()
        return Response(TicketSerializer(ticket).data)
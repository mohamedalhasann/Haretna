from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from django.shortcuts import get_object_or_404

from ..models import Event, Pledge, Issue
from .event_serializers import EventSerializer, PledgeSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    serializer_class = EventSerializer
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.action in ['create', 'join', 'pledge']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        event = self.get_object()
        user = request.user
        event.volunteers.add(user)
        event.save()
        return Response(self.get_serializer(event).data)

    @action(detail=True, methods=['post'])
    def pledge(self, request, pk=None):
        event = self.get_object()
        item = request.data.get('item')
        qty = int(request.data.get('quantity', 1))
        pledge = Pledge.objects.create(event=event, user=request.user, item=item, quantity=qty)
        return Response(PledgeSerializer(pledge).data, status=status.HTTP_201_CREATED)

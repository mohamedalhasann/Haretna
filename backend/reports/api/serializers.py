from rest_framework import serializers
from ..models import Issue, Event, Pledge


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'issue', 'organizer', 'title', 'date', 'location', 'volunteers_needed']


class PledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pledge
        fields = ['id', 'event', 'user', 'item', 'quantity', 'created_at']

from ..models import Issue


class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ['id', 'title', 'category', 'neighborhood', 'description', 'status', 'adopted_by', 'supplies', 'volunteers', 'reported_at', 'adopted_at']
        read_only_fields = ['id', 'reported_at', 'adopted_at']

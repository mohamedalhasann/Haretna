from rest_framework import serializers
from ..models import Event, Pledge
from django.contrib.auth.models import User


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class PledgeSerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)

    class Meta:
        model = Pledge
        fields = ['id', 'user', 'item', 'quantity', 'created_at']


class EventSerializer(serializers.ModelSerializer):
    organizer = UserShortSerializer(read_only=True)
    volunteers = UserShortSerializer(many=True, read_only=True)
    pledges = PledgeSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'issue', 'organizer', 'title', 'description', 'date', 'location', 'volunteers_needed', 'volunteers', 'pledges', 'created_at']

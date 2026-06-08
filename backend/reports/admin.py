from django.contrib import admin
from .models import Issue
from .models import Profile, Event, Pledge


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'neighborhood', 'status', 'reported_at')
    list_filter = ('status', 'category', 'neighborhood')
    search_fields = ('title', 'description', 'neighborhood', 'adopted_by')


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_organizer')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'issue', 'organizer', 'date', 'volunteers_needed')
    list_filter = ('date',)


@admin.register(Pledge)
class PledgeAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'item', 'quantity', 'created_at')

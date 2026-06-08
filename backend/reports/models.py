from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Issue(models.Model):
    CATEGORY_CHOICES = [
        ('Cleanup', 'Cleanup'),
        ('Painting', 'Painting'),
        ('Planting', 'Planting'),
        ('Maintenance', 'Maintenance'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Adopted', 'Adopted'),
        ('Closed', 'Closed'),
    ]

    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    neighborhood = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    adopted_by = models.CharField(max_length=200, blank=True)
    supplies = models.TextField(blank=True, help_text='One supply per line')
    volunteers = models.TextField(blank=True, help_text='Comma separated volunteer names')
    reported_at = models.DateTimeField(auto_now_add=True)
    adopted_at = models.DateTimeField(null=True, blank=True)

    def supplies_list(self):
        return [s.strip() for s in self.supplies.splitlines() if s.strip()]

    def volunteers_list(self):
        return [v.strip() for v in self.volunteers.split(',') if v.strip()]

    def __str__(self):
        return f"{self.title} ({self.neighborhood})"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    is_organizer = models.BooleanField(default=False)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


class Event(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='events')
    organizer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='organized_events')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    volunteers_needed = models.PositiveIntegerField(default=0)
    volunteers = models.ManyToManyField(User, related_name='events_joined', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} on {self.date.date()}"


class Pledge(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='pledges')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    item = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.item} for {self.event.title}"

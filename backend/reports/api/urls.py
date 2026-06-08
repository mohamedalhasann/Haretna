from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import IssueViewSet
from .event_views import EventViewSet
from .auth_views import RegisterView
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
router.register(r'issues', IssueViewSet, basename='issue')
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='api-register'),
    path('auth/login/', obtain_auth_token, name='api-login'),
]

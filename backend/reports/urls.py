from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('', views.index, name='index'),
    path('report/', views.report_issue, name='report'),
    path('adopt/<int:pk>/', views.adopt_issue, name='adopt'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
]

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('reports.api.urls')),
    path('', include('reports.urls')),
]

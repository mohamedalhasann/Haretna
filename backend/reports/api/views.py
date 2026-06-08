from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone

from ..models import Issue
from .serializers import IssueSerializer


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all().order_by('-reported_at')
    serializer_class = IssueSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'])
    def adopt(self, request, pk=None):
        issue = self.get_object()
        adopter = request.data.get('adopter', '').strip()
        if not adopter:
            return Response({'detail': 'adopter required'}, status=status.HTTP_400_BAD_REQUEST)
        issue.status = 'Adopted'
        issue.adopted_by = adopter
        issue.adopted_at = timezone.now()
        if issue.volunteers:
            issue.volunteers = issue.volunteers + ', ' + adopter
        else:
            issue.volunteers = adopter
        issue.save()
        return Response(self.get_serializer(issue).data)

    @action(detail=False, methods=['get'])
    def call_to_action(self, request):
        cutoff = timezone.now() - timezone.timedelta(days=14)
        qs = Issue.objects.filter(status='Open', reported_at__lt=cutoff).order_by('-reported_at')
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

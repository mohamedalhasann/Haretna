from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.utils import timezone
from django.db import models

from .models import Issue
from .forms import IssueForm


def index(request):
    issues = Issue.objects.order_by('-reported_at')
    return render(request, 'reports/issues_list.html', {'issues': issues})


def report_issue(request):
    if request.method == 'POST':
        form = IssueForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect(reverse('reports:index'))
    else:
        form = IssueForm()
    return render(request, 'reports/report_issue.html', {'form': form})


def adopt_issue(request, pk):
    issue = get_object_or_404(Issue, pk=pk)
    if request.method == 'POST':
        adopter = request.POST.get('adopter', '').strip()
        if adopter:
            issue.status = 'Adopted'
            issue.adopted_by = adopter
            issue.adopted_at = timezone.now()
            if issue.volunteers:
                # append
                issue.volunteers = issue.volunteers + ', ' + adopter
            else:
                issue.volunteers = adopter
            issue.save()
    return redirect(reverse('reports:index'))


def leaderboard(request):
    qs = Issue.objects.values('neighborhood').order_by().annotate(count=models.Count('id'))
    # fallback simple computation
    neighborhoods = {}
    for i in Issue.objects.all():
        neighborhoods[i.neighborhood] = neighborhoods.get(i.neighborhood, 0) + 1
    lines = sorted(neighborhoods.items(), key=lambda t: t[1], reverse=True)
    return render(request, 'reports/leaderboard.html', {'leaderboard': lines})

from django import forms
from .models import Issue


class IssueForm(forms.ModelForm):
    class Meta:
        model = Issue
        fields = ['title', 'category', 'neighborhood', 'description', 'supplies']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
            'supplies': forms.Textarea(attrs={'rows': 3}),
        }

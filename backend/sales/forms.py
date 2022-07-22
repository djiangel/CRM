from django.forms import ModelForm, PasswordInput
from .models import UserProfile

class UserProfileForm(ModelForm):
    class Meta:
        model = UserProfile
        fields = ['user','department','salesAccount','contact_number','email','email_password','profile_picture']
        widgets = {
            'email_password': PasswordInput(),
        }
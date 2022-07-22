from django.contrib import admin

# Register your models here.
from .models import *

class LoginAdmin(admin.ModelAdmin):
    readonly_fields = ('login_IP','login_datetime','login_username', 'status' , 'user_agent_info')
    def has_add_permission(self, request, obj=None):
        return False

admin.site.register(UserLoginActivity,LoginAdmin)
from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class UserLoginActivity(models.Model):

    LOGIN_STATUS = (('SUCCESS', 'Success'),
                           ('FAILED', 'Failed'))
    login_IP = models.GenericIPAddressField(null=True, blank=True , editable=False)
    login_datetime = models.DateTimeField(auto_now=True, editable=False)
    login_username = models.CharField(max_length=40, null=True, blank=True , editable=False)
    status = models.CharField(max_length=10, default='SUCCESS', choices=LOGIN_STATUS, null=True, blank=True, editable=False)
    user_agent_info = models.CharField(max_length=255 , editable=False)

    class Meta:
        app_label = 'auth'
        verbose_name = 'User Login Activity'
        verbose_name_plural = 'User Login Activities'

    def __str__(self):
        return  "User: " + self.user_agent_info + " ------- " + "Login Date: " + str(self.login_datetime) + " --------- " + "Status: " +  self.status 


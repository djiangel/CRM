from django.dispatch import receiver
from django.db.models import signals
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken,BlacklistedToken
from django.contrib.auth.models import User
from sales.models import SalesExtra
from django.contrib.auth.signals import user_logged_in

@receiver(signals.pre_save, sender=User)
def revoke_tokens(sender, instance, update_fields, **kwargs):
    if not instance._state.adding: #instance._state.adding gives true if object is being created for the first time
        existing_user = User.objects.get(pk=instance.pk)
        if instance.password != existing_user.password or instance.email != existing_user.email or instance.username != existing_user.username:
            
        # If any of these params have changed, blacklist the tokens
            outstanding_tokens = OutstandingToken.objects.filter(user__pk=instance.pk)
            # Not checking for expiry date as cron is supposed to flush the expired tokens
            # using manage.py flushexpiredtokens. But if You are not using cron, 
            # then you can add another filter that expiry_date__gt=datetime.datetime.now()
            from sales.tasks import send_mail_task
            email = str(SalesExtra.objects.get(user=existing_user.id).outlook_address)
            send_mail_task.delay(email,'Your password has changed!')

            for out_token in outstanding_tokens:
                if hasattr(out_token, 'blacklistedtoken'):
                    # Token already blacklisted. Skip
                    continue
                    BlacklistedToken.objects.create(token=out_token)


@receiver(user_login_failed)
def log_user_logged_in_failed(sender, credentials, request, **kwargs):
    try:
        user_agent_info = request.META.get('HTTP_USER_AGENT', '<unknown>')[:255],
        user_login_activity_log = UserLoginActivity(login_IP=get_client_ip(request),
                                                    login_username=credentials['username'],
                                                    user_agent_info=user_agent_info,
                                                    status=UserLoginActivity.FAILED)
        user_login_activity_log.save()
    except Exception as e:
        # log the error
        error_log.error("log_user_logged_in request: %s, error: %s" % (request, e))
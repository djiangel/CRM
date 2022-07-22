from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import Permission, Group , User
from django.contrib.auth import user_logged_in
from authentication.models import UserLoginActivity
from sales.api.serializers import UserProfileImageOnlySerializer
from django.db import connection
from sales.models import Company

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class GroupDto(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class GroupPermDto(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name' , 'permissions']
        depth = 2

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['groups'] = GroupDto(user.groups.all(),many=True).data
        token['userprofile'] = user.userprofile.id
        token['profile_picture'] = UserProfileImageOnlySerializer(user.userprofile,many=False).data
        token['email_service'] = user.userprofile.email_service
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user_agent_info = self.context['request'].META.get('HTTP_USER_AGENT', '<unknown>')[:255],
        user_login_activity_log = UserLoginActivity(login_IP=get_client_ip(self.context['request']),
                                                    login_username=self.user.username,
                                                    user_agent_info=self.user,
                                                    status="SUCCESS")
        user_login_activity_log.save()
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        return data

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = { 
            'password': {'write_only': True}
        }

    def save(self):
        print(User.objects.all())
        if len(User.objects.all()) <= 5:
            user = User(username=self.validated_data['username'])
            password = self.validated_data['password']
            user.set_password(password)
            user.save()
            return user
        else:
            raise serializers.ValidationError({'username': 'Exceeded max number of users'})



from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import permissions
from .serializers import MyTokenObtainPairSerializer , ChangePasswordSerializer , GroupPermDto, UserSerializer
from authentication.models import UserLoginActivity
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db import connection
from sales.models import Company, UserProfile
from backend.utils import bootstrap
from datetime import date
from dateutil.relativedelta import *
from rest_framework_api_key.permissions import HasAPIKey

class TokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UpdatePassword(APIView):
    """
    An endpoint for changing password.
    """
    permission_classes = (permissions.IsAuthenticated, )

    def get_object(self, queryset=None):
        return self.request.user

    def put(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            old_password = serializer.data.get("old_password")
            if not self.object.check_password(old_password):
                return Response({"message": ["Wrong password."]}, 
                                status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            new_password = serializer.data.get("new_password")
            response = {
                    'status': 'success',
                    'code': status.HTTP_200_OK,
                    'message': 'Password updated successfully',
                    'data': [str(self.object.username),str(new_password)]
                }
            print(self.object.check_password(serializer.data.get('new_password')))
            return Response(response)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutAndBlacklistRefreshTokenForUserView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserPermissions(APIView):
    authentication_classes = ()

    def get(self, request):
        try:
            user = request.user
            userGroupPermissionList = user.groups.all()
            return Response(GroupPermDto(userGroupPermissionList,many=True).data,status=status.HTTP_200_OK)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

def create_tenant(name, paid_until, on_trial, count, original):
    try:
        company = Company(schema_name=name, name=name, paid_until=paid_until, on_trial=on_trial)
        company.save()
        return company.schema_name
    except Exception as e:
        print(e)
        return create_tenant(original + str(count), paid_until, on_trial, count + 1, original)

class SchemaView(APIView):
    permission_classes = [HasAPIKey]

    def post(self, request):
        #print(request.data)
        try:
            date_add = request.data['count'] 
            if request.data['interval'] == 'year':
                paid_until = date.today() + relativedelta(years=+request.data['count'], days=+1)
            elif request.data['interval'] == 'month':
                paid_until = date.today() + relativedelta(months=+request.data['count'], days=+1)
            else:
                count = int(request.data['count']) + 1
                paid_until = date.today() + relativedelta(days=+count)

            if request.data['interval'] == 'day':
                schema_name = create_tenant(request.data['schema_name'], paid_until, True, 0, request.data['schema_name'])
            else:
                schema_name = create_tenant(request.data['schema_name'], paid_until, False, 0, request.data['schema_name'])

            return Response(schema_name)

        except Exception as e:
            print(e)
            return Response('error')

class SchemaBootstrap(APIView):

    def post(self, request):
        data = bootstrap(request.data['trial'])
        print(data)
        return Response(data)
        
class SignUpView(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request):
        # Reads application/json and returns a response
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                return Response('')

            else:
                print('error')
                print(serializer.errors)
                return Response(serializer.errors)

        except Exception as e:
            print(e)
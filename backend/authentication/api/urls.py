from django.urls import path

from .views import (LogoutAndBlacklistRefreshTokenForUserView,
					TokenObtainPairView,UpdatePassword,UserPermissions, SchemaView, SchemaBootstrap, SignUpView)
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt import views as jwt_views
from django.conf.urls import url, include



urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('token/changepassword/', UpdatePassword.as_view(), name='update_password'),
    path('blacklist/', LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='blacklist'),
    path('get_group_perm_list/', UserPermissions.as_view(), name='userperm'),
    path('schema/', SchemaView.as_view(), name='schema'),
    path('schema-bootstrap/', SchemaBootstrap.as_view(), name='schema-bootstrap'),
    path('sign-up/', SignUpView.as_view(), name='sign-up')
]
from channels.auth import AuthMiddlewareStack
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs
import re
from jwt import decode as jwt_decode
from channels.db import database_sync_to_async
from django.db import close_old_connections
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken
from django.conf import settings
from django.contrib.auth import get_user_model


@database_sync_to_async
def get_user(decoded_data):
    try:
        user = get_user_model().objects.get(id=decoded_data["user_id"])
        return user
    except:

        return AnonymousUser()

class TokenAuthMiddleware:

    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return TokenAuthMiddlewareInstance(scope, self)

class TokenAuthMiddlewareInstance:
    def __init__(self, scope, middleware):
        self.middleware = middleware
        self.scope = dict(scope)
        self.inner = self.middleware.inner

    async def __call__(self, receive, send):
        close_old_connections()
        token = parse_qs(self.scope["query_string"].decode("utf8"))["token"][0]
        try:
            # This will automatically validate the token and raise an error if token is invalid
            UntypedToken(token)
        except (InvalidToken, TokenError) as e:
            # Token is invalid
            return None
        else:
            #  Then token is valid, decode it
            decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            if decoded_data:
                self.scope["user"] = await get_user(decoded_data)

            inner = self.inner(self.scope)
            return await inner(receive, send) 

        return self.inner(dict(scope, user=user))


TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))
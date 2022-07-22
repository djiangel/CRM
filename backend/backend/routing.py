from django.urls import path

from channels.http import AsgiHandler
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from sales.consumers import NotificationConsumer
from .token_auth import TokenAuthMiddleware

application = ProtocolTypeRouter({
    "websocket": TokenAuthMiddleware(
        URLRouter([
            path("", NotificationConsumer),
            path("project/all", NotificationConsumer),
            path("project/detail/<pk>", NotificationConsumer),
            path("customer/all", NotificationConsumer),
            path("customer/detail/<pk>", NotificationConsumer),
            path("vendor/all", NotificationConsumer),
            path("vendor/detail/<pk>", NotificationConsumer),
            path("vendor/all", NotificationConsumer),
            path("ticket/detail/<pk>", NotificationConsumer),
            path("ticket/all", NotificationConsumer),
            path("item/detail/<pk>", NotificationConsumer),
            path("item/all", NotificationConsumer),
            path("changepassword", NotificationConsumer),
            path("workflows/view/<pk>", NotificationConsumer),
            path("workflows", NotificationConsumer),
            path("workflow/automations", NotificationConsumer),
            path("workflow/automations/<pk>", NotificationConsumer),
            path("workflow/states", NotificationConsumer),
            path("personalcalendar", NotificationConsumer),
            path("email", NotificationConsumer),
            path("userprofile/<pk>", NotificationConsumer),
            path("quotation/all", NotificationConsumer),
            path("adminsettings", NotificationConsumer),
        ]),
    ),

})
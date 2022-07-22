import asyncio
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
import asyncio
from .models import Notifications 
from django.template.loader import render_to_string
from channels.db import database_sync_to_async
from django.db import close_old_connections
 
class NotificationConsumer (AsyncJsonWebsocketConsumer):
    async def connect (self):
        close_old_connections()
        user = self.scope["user"]
        if not user.is_anonymous:
            await self.accept()
            #connects the user to his/her websocket channel
            group_name = "notifications_{}".format(str(user))
            await self.channel_layer.group_add(group_name, self.channel_name)
 
 
    async def disconnect (self, code):
        close_old_connections()
        user = self.scope["user"]
        if not user.is_anonymous:
            #Notifications
            notifications_group_name = "notifications_{}".format(str(user))
            await self.channel_layer.group_discard(notifications_group_name, self.channel_name)
 
 
 
    async def receive(self, text_data):
        pass
        #I don't use websocket.send in this case.. But this is where you'd listen to stuff coming from the user.
 
 
    #This is where we receive the data from the post-save in models.py.  It gets sent as Json through websockets and will be parsed by JS.
    async def user_notification (self, event):
        close_old_connections()
        await self.send_json({
            'event': 'notification',
            'data': {
                'event_type': 'notification',
                'id': event['id'],
                'title': event['title'],
                'datetime': event['datetime'],
                'read': event['read'],
                'extra': event['extra'],
                'object_url': event['object_url'],
            }
        })
 
    #These things are hugely important, or your websockets will stop working after a while for no reason.
    #EVERYHING that hits the database has to be wrapped with database_sync_to_async.
    #Don't do querysets in your code above, no .filter(), .get(), etc.  In this example, do "employee = await self.get_employee(user)"
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from sales.models import *
from .serializers import *
from rest_framework import viewsets
from drf_multiple_model.views import ObjectMultipleModelAPIView
from river.models import TransitionApproval
from django.db.models import Count, F, Sum, Q
from django.db.models.functions import TruncMonth, TruncQuarter, TruncYear
from rest_framework.response import Response
from datetime import timedelta, datetime, date
import calendar
from dateutil.relativedelta import *
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.decorators import action
# PERMISSIONS
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from difflib import SequenceMatcher
from rest_framework_api_key.permissions import HasAPIKey
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from djmoney.settings import CURRENCY_CHOICES
import json


class NotificationTypeCreateView(CreateAPIView):
    """
    View to create a notification object when
    a new object is created or updated.
    """

    def post(self, request, *args, **kwargs):
        """
        Creates a new notification based on data sent to API.
        Targets comes in as a list of ids. If 'all' was specified,
        function will query out all avaialable users in DB.  
        """
        title = request.data['title']
        if request.data['targets'] == ['all']:
            targets = UserProfile.objects.all()
        else:
            targets = UserProfile.objects.filter(
                pk__in=request.data['targets'])
        object_url = request.data['object_url']
        extra = request.data['extra']
        action = request.data['action']
        for target in targets:
            Notifications.objects.create(
                target=target.user,
                extra=extra,
                object_url=object_url,
                title=title,
                action=action,
            )
        return Response('', status=HTTP_200_OK)


class NotificationsObtainView(viewsets.ModelViewSet):
    serializer_class = NotificationsSerializer

    def get_list_queryset(self):
        return Notifications.objects.filter(target=self.request.user).order_by("-datetime")[:20]

    def list(self, request):
        queryset = self.get_list_queryset()
        serializer = NotificationsSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        notification = Notifications.objects.get(id=pk)
        notification.read = True
        notification.save()
        return Response('', status=HTTP_200_OK)

    @action(detail=False, methods=['POST'], name='Read All')
    def readall(self, request, *args, **kwargs):
        for number in request.data['notifications']:
            notification = Notifications.objects.get(id=number['id'])
            if notification.read == False:
                notification.read = True
                notification.save()
        return Response('', status=HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='Read All')
    def getnext20notifications(self, request):
        page = int(request.query_params.get('page'))
        next_page = page + 1
        notifications = Notifications.objects.filter(
            target=1).order_by("-datetime")[page * 20: next_page * 20]
        return Response(NotificationsSerializer(notifications, many=True).data, status=HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='Counter')
    def counter(self, request, *args, **kwargs):
        return Response(Notifications.objects.filter(read=False).filter(target=request.user).count(), status=HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='Counter')
    def workflowcounter(self, request, *args, **kwargs):

        # To get the approvals for projects
        all_outstanding_projects = SalesProject.river.project_status.get_on_approval_objects(
            as_user=request.user)
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding_projects = all_outstanding_projects
        elif self.request.user.has_perm('sales.tier_2_oversight'):
            filtered_oustanding_projects = all_outstanding_projects.filter(
                sales_department__in=request.user.userprofile.department.all())
        else:
            filtered_oustanding_projects = all_outstanding_projects.filter(
                userProfile__in=[request.user.userprofile])

        # To get approvals for the customer
        all_outstanding_customers = CustomerInformation.river.customer_status.get_on_approval_objects(
            as_user=request.user)
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding_customers = all_outstanding_customers
        else:
            filtered_oustanding_customers = all_outstanding_customers.filter(
                salesDepartment__in=request.user.userprofile.department.all())

        # To get approvals for the vendor
        all_outstanding_vendors = VendorInformation.river.vendor_status.get_on_approval_objects(
            as_user=request.user)
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding_vendors = all_outstanding_vendors
        else:
            filtered_oustanding_vendors = all_outstanding_vendors.filter(
                salesDepartment__in=request.user.userprofile.department.all())

        # To get approvals for the tickets(more complex bc sales proj might be involved)
        all_outstanding_tickets = Ticket.river.ticket_status.get_on_approval_objects(
            as_user=request.user)
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding_tickets = all_outstanding_tickets
        elif self.request.user.has_perm('sales.tier_2_oversight'):
            filtered_oustanding_tickets = all_outstanding_tickets.filter(
                assigned_to__userprofile__department__in=request.user.userprofile.department.all())
        else:
            # tickets that have a project assigned , only retrieve tickets from project of whom the user is involved in:
            project_tickets = all_outstanding_tickets.filter(salesProject__isnull=False).filter(
                salesProject__userProfile__in=[request.user.userprofile])
            # tickets that have a customer assigned but no project assigned , retrieve tickets departmental level:
            customer_tickets = all_outstanding_tickets.filter(salesProject__isnull=True).filter(
                customerPoc__isnull=False).filter(assigned_to=request.user)
            filtered_oustanding_tickets = project_tickets | customer_tickets

        # To get the approvals for quotations
        all_outstanding_quotations = Quotation.river.quotation_status.get_on_approval_objects(
            as_user=request.user)
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding_quotations = all_outstanding_quotations
        elif self.request.user.has_perm('sales.tier_2_oversight'):
            filtered_oustanding_quotations = all_outstanding_quotations.filter(
                creator__userprofile__department__in=request.user.userprofile.department.all())
        else:
            filtered_oustanding_quotations = all_outstanding_quotations.filter(
                creator__userprofile__in=[request.user.userprofile])

        project_count = filtered_oustanding_projects.count()
        customer_count = filtered_oustanding_customers.count()
        vendor_count = filtered_oustanding_vendors.count()
        ticket_count = filtered_oustanding_tickets.count()
        quotation_count = filtered_oustanding_quotations.count()
        return Response({'project_count': project_count,
                         'customer_count': customer_count,
                         'vendor_count': vendor_count,
                         'quotation_count': quotation_count,
                         'ticket_count': ticket_count}, status=HTTP_200_OK)

class ActualStateViewSet(viewsets.ModelViewSet):
    serializer_class = ActualStateDetailSerializer
    queryset = ActualStateType.objects.all()

    def update(self, request, *args, **kwargs):
        print('hi')
        instance = self.get_object()
        partial = kwargs.pop('partial', False)
        serializer = ActualStateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response('')

    def create(self, request, *args, **kwargs):
        print(request.data)
        serializer = ActualStateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        #vendor = VendorInformation.objects.get(vendor_id=request.data['vendorInformation'])
        return Response('', status=status.HTTP_201_CREATED)


'''<------------------------Customer Permissions------------------------->'''


class CustomerVendorRetrievePermissions(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = UserProfile.objects.get(user=request.user)
        department = user.department
        for department in department.all():
            if obj.salesDepartment == department:
                return True
        return False


class CustomerUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_customerinformation')

    def has_object_permission(self, request, view, obj):
        user = UserProfile.objects.get(user=request.user)
        if obj.sap_code != None or obj.river.customer_status.on_final_state == True:
            return False
        return True


class CustomerCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_customerinformation')


'''<---------------------------------------------------------------------->'''


class CustomerInformationViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerInformationSerializer
    action_serializers = {
        'retrieve': CustomerInformationDetailSerializer,
        'create': CustomerInformationSerializer,
        'update': CustomerInformationSerializer,
        'list': CustomerInformationListSerializer
    }

    permission_classes_by_action = {
        'retrieve': [
            CustomerVendorRetrievePermissions, IsAuthenticated],
        'update': [
            CustomerUpdatePermissions, IsAuthenticated
        ],
        'partial_update': [
            CustomerUpdatePermissions, IsAuthenticated
        ],
        'create': [
            CustomerCreatePermissions, IsAuthenticated
        ],
    }

    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getinactivecustomers(self, request):
        user = UserProfile.objects.get(user=self.request.user)
        inactive_customers = []
        if self.request.user.has_perm('sales.tier_3_oversight'):
            available_customers = CustomerInformation.objects.all()
        else:
            available_customers = CustomerInformation.objects.filter(
                salesDepartment__in=self.request.user.userprofile.department.all())
        # this step is to sieve out only active projects
        for customer in available_customers:
            if customer.river.customer_status.on_final_state == True:
                inactive_customers.append(customer)
        user_perms = User.get_all_permissions(request.user)
        permission_list = ['sales.add_customerinformation']
        user_perms = User.get_all_permissions(request.user)
        return Response({'customers': CustomerInformationListSerializer(inactive_customers, many=True, context={'request': request}).data,
                         'permissions': {permission: True if permission in user_perms else False for permission in permission_list}
                         }, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = CustomerInformationSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(CustomerInformationDetailSerializer(instance, context={'request': request}).data)

    def create(self, request, *args, **kwargs):
        serializer = CustomerInformationSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(CustomerInformationDetailSerializer(serializer.instance, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        user = UserProfile.objects.get(user=self.request.user)
        if self.action == 'retrieve':
            projects = CustomerInformation.objects.all()
            return projects
        elif self.action == 'list':
            user = UserProfile.objects.get(user=self.request.user)
            active_customers = []
            if self.request.user.has_perm('sales.tier_3_oversight'):
                available_customers = CustomerInformation.objects.all()
            else:
                available_customers = CustomerInformation.objects.filter(
                    salesDepartment__in=self.request.user.userprofile.department.all())
            # this step is to sieve out only active customers
            for customer in available_customers:
                if customer.river.customer_status.on_final_state == False:
                    active_customers.append(customer)
            return active_customers
        else:
            return CustomerInformation.objects.all()

    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getapprovals(self, request):
        # To get approvals for the customer
        all_outstanding_customers = CustomerInformation.river.customer_status.get_on_approval_objects(
            as_user=request.user)
        # this second filter is to limit the queryset based on the user's access tier
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding_customers = all_outstanding_customers
        else:
            filtered_oustanding_customers = all_outstanding_customers.filter(
                salesDepartment__in=request.user.userprofile.department.all())
        return Response(CustomerInformationListSerializer(filtered_oustanding_customers, many=True, context={'request': request}).data)

    def get_permissions(self):
        print(self.permission_classes)
        try:
            # return permission_classes depending on action
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]

    def get_serializer_class(self):
        if hasattr(self, 'action_serializers'):
            return self.action_serializers.get(self.action, self.serializer_class)
        return super(SalesProjectViewSet, self).get_serializer_class()

'''<------------------------ POC Permissions------------------------->'''
class CustomerVendorPOCRetrievePermissions(BasePermission):
    def has_object_permission(self, request, view, obj):
        return False

class CustomerPOCUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_customerpoc')

class CustomerPOCCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_customerpoc')


'''<---------------------------------------------------------------------->'''

class CustomerPocViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerPocSerializer
    queryset = CustomerPoc.objects.all()

    permission_classes_by_action = {
        'retrieve': [
            CustomerVendorPOCRetrievePermissions, IsAuthenticated],
        'update': [
            CustomerPOCUpdatePermissions, IsAuthenticated
        ],
        'partial_update': [
            CustomerPOCUpdatePermissions, IsAuthenticated
        ],
        'create': [
            CustomerPOCCreatePermissions, IsAuthenticated
        ],
    }

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        partial = kwargs.pop('partial', False)
        serializer = CustomerPocSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(CustomerInformationDetailSerializer(instance.customerInformation, context={'request': request}).data)

    def create(self, request, *args, **kwargs):
        serializer = CustomerPocSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        customer = CustomerInformation.objects.get(
            customer_id=request.data['customerInformation'])
        return Response(CustomerInformationDetailSerializer(customer, context={'request': request}).data, status=status.HTTP_201_CREATED)
    
    def get_permissions(self):
        print(self.permission_classes)
        try:
            # return permission_classes depending on action
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]

class VendorPocViewSet(viewsets.ModelViewSet):
    serializer_class = VendorPocSerializer
    queryset = VendorPoc.objects.all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        partial = kwargs.pop('partial', False)
        serializer = VendorPocSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(VendorInformationDetailSerializer(instance.vendorInformation, context={'request': request}).data)

    def create(self, request, *args, **kwargs):
        serializer = VendorPocSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        vendor = VendorInformation.objects.get(
            vendor_id=request.data['vendorInformation'])
        return Response(VendorInformationDetailSerializer(vendor, context={'request': request}).data, status=status.HTTP_201_CREATED)




'''<------------------------Vendor Permissions------------------------->'''

class VendorUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_vendorinformation')

    def has_object_permission(self, request, view, obj):
        user = UserProfile.objects.get(user=request.user)
        if obj.sap_code != None or obj.river.vendor_status.on_final_state == True:
            return False
        return True


class VendorCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_vendorinformation')


'''<---------------------------------------------------------------------->'''


class VendorInformationViewSet(viewsets.ModelViewSet):
    serializer_class = VendorInformationSerializer
    action_serializers = {
        'retrieve': VendorInformationDetailSerializer,
        'create': VendorInformationSerializer,
        'update': VendorInformationSerializer,
        'list': VendorInformationListSerializer
    }

    permission_classes_by_action = {
        'retrieve': [
            CustomerVendorRetrievePermissions, IsAuthenticated],
        'update': [
            VendorUpdatePermissions, IsAuthenticated
        ],
        'partial_update': [
            VendorUpdatePermissions, IsAuthenticated
        ],
        'create': [
            VendorCreatePermissions, IsAuthenticated
        ],
    }


    @action(detail=False, methods=['GET'], name='getvendorapprovals')
    def getvendorapprovals(self, request):
        # To get approvals for the vendor
        all_outstanding_vendors = VendorInformation.river.vendor_status.get_on_approval_objects(
            as_user=request.user)
        # this second filter is to limit the queryset based on the user's access tier
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding_vendors = all_outstanding_vendors
        else:
            filtered_oustanding_vendors = all_outstanding_vendors.filter(
                salesDepartment__in=request.user.userprofile.department.all())
        return Response(VendorInformationListSerializer(filtered_oustanding_vendors, many=True, context={'request': request}).data,status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getinactivevendors(self, request):
        user = UserProfile.objects.get(user=self.request.user)
        inactive_vendors = []
        if self.request.user.has_perm('sales.tier_3_oversight'):
            available_vendors = VendorInformation.objects.all()
        else:
            available_vendors = VendorInformation.objects.filter(
                salesDepartment__in=self.request.user.userprofile.department.all())
        # this step is to sieve out only active projects
        for vendor in available_vendors:
            if vendor.river.vendor_status.on_final_state == True:
                inactive_vendors.append(vendor)
        user_perms = User.get_all_permissions(request.user)
        permission_list = ['sales.add_vendorinformation']
        user_perms = User.get_all_permissions(request.user)
        return Response({'vendor': VendorInformationListSerializer(inactive_vendors, many=True, context={'request': request}).data,
                         'permissions': {permission: True if permission in user_perms else False for permission in permission_list}
                         }, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = VendorInformationSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(VendorInformationDetailSerializer(instance, context={'request': request}).data)

    def create(self, request, *args, **kwargs):
        serializer = VendorInformationSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(VendorInformationDetailSerializer(serializer.instance, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        user = UserProfile.objects.get(user=self.request.user)
        if self.action == 'retrieve':
            projects = VendorInformation.objects.all()
            return projects
        elif self.action == 'list':
            user = UserProfile.objects.get(user=self.request.user)
            active_vendors = []
            if self.request.user.has_perm('sales.tier_3_oversight'):
                available_vendors = VendorInformation.objects.all()
            else:
                available_vendors = VendorInformation.objects.filter(
                    salesDepartment__in=self.request.user.userprofile.department.all())
            # this step is to sieve out only active customers
            for vendor in available_vendors:
                if vendor.river.vendor_status.on_final_state == False:
                    active_vendors.append(vendor)
            return active_vendors
        else:
            return VendorInformation.objects.all()


    def get_permissions(self):
        print(self.permission_classes)
        try:
            # return permission_classes depending on action
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]

    def get_serializer_class(self):
        if hasattr(self, 'action_serializers'):
            return self.action_serializers.get(self.action, self.serializer_class)
        return super(VendorInformationViewSet, self).get_serializer_class()


class SalesDepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = SalesDepartmentSerializer

    def get_queryset(self):
        user = UserProfile.objects.get(user=self.request.user)
        qs = SalesDepartment.objects.filter(users__in=[user])
        return qs

class CountryViewSet(viewsets.ModelViewSet):
    serializer_class = CountrySerializer
    queryset = Country.objects.all()


class LeadSourceViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSourceSerializer
    queryset = LeadSource.objects.all()

class LayoutViewSet(viewsets.ModelViewSet):
    serializer_class = LayoutSerializer
    queryset = UserProfile.objects.all()

'''<----------Project Pemissions defined here----------->'''


class SalesProjectPermissions(BasePermission):
    def has_object_permission(self, request, view, obj):
        userprofile = UserProfile.objects.get(user=request.user)
        if request.user.has_perm('sales.tier_3_oversight'):
            return True

        elif request.user.has_perm('sales.tier_2_oversight'):
            for department in userprofile.department.all():
                if obj.sales_department == department:
                    return True
        else:
            if userprofile in obj.userProfile.all():
                return True
        return False


class SalesProjectChangeUserPermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.can_change_project_user')


class SalesProjectUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_salesproject')

    def has_object_permission(self, request, view, obj):
        user = UserProfile.objects.get(user=request.user)
        if 'customerInformation' in request.data:
            if obj.requirements.exists() or obj.quotations.exists():
                return False
        if obj.river.project_status.on_final_state == True:
            return False
        return True


class SalesProjectCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_salesproject')


'''<------------------------------------------------------------>'''


class SalesProjectViewSet(viewsets.ModelViewSet):
    queryset = SalesProject.objects.all()
    action_serializers = {
        'retrieve': SalesProjectDetailSerializer,
        'create': SalesProjectSerializer,
        'update': SalesProjectSerializer,
        'partial_update': SalesProjectSerializer,
        'list': SalesProjectListSerializer,
        'getexternalusers': UserProfileSerializer,
    }

    permission_classes_by_action = {
        'retrieve': [
            SalesProjectPermissions, IsAuthenticated],
        'changeuser': [
            SalesProjectChangeUserPermissions, IsAuthenticated
        ],
        'update': [
            SalesProjectUpdatePermissions, IsAuthenticated
        ],
        'partial_update': [
            SalesProjectUpdatePermissions, IsAuthenticated
        ],
        'create': [
            SalesProjectCreatePermissions, IsAuthenticated
        ],
    }

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = SalesProjectSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(SalesProjectDetailSerializer(instance, context={'request': request}).data)

    def create(self, request, *args, **kwargs):
        serializer = SalesProjectSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(SalesProjectDetailSerializer(serializer.instance, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        user = UserProfile.objects.get(user=self.request.user)
        if self.action == 'retrieve':
            projects = SalesProject.objects.all()
            return projects
        elif self.action == 'list':
            user = UserProfile.objects.get(user=self.request.user)
            print('im here hehehe')
            user = UserProfile.objects.get(user=self.request.user)
            print('im ending hohoho')
            active_projects = []
            if self.request.user.has_perm('sales.tier_3_oversight'):
                available_projects = SalesProject.objects.all()
            elif self.request.user.has_perm('sales.tier_2_oversight'):
                available_projects = SalesProject.objects.filter(
                    sales_department__in=self.request.user.userprofile.department.all())
            else:
                available_projects = SalesProject.objects.filter(
                    userProfile__in=[self.request.user.userprofile])
            # this step is to sieve out only active projects
            for project in available_projects:
                if project.river.project_status.on_final_state == False:
                    active_projects.append(project)
            return active_projects
        else:
            return SalesProject.objects.all()

    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getapprovals(self, request):
        # this line of code grabs all projects that have an approval from the user's group , needs to be filtered based on perms.
        all_outstanding = SalesProject.river.project_status.get_on_approval_objects(
            as_user=request.user)
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding = all_outstanding
        elif self.request.user.has_perm('sales.tier_2_oversight'):
            filtered_oustanding = all_outstanding.filter(
                sales_department__in=request.user.userprofile.department.all())
        else:
            filtered_oustanding = all_outstanding.filter(
                userProfile__in=[request.user.userprofile])
        return Response(SalesProjectListSerializer(filtered_oustanding, many=True, context={'request': request}).data)

    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getinactiveprojects(self, request):
        user = UserProfile.objects.get(user=self.request.user)
        inactive_projects = []
        if self.request.user.has_perm('sales.tier_3_oversight'):
            available_projects = SalesProject.objects.all()
        elif self.request.user.has_perm('sales.tier_2_oversight'):
            available_projects = SalesProject.objects.filter(
                sales_department__in=self.request.user.userprofile.department.all())
        else:
            available_projects = SalesProject.objects.filter(
                userProfile__in=[self.request.user.userprofile])
        # this step is to sieve out only active projects
        for project in available_projects:
            if project.river.project_status.on_final_state == True:
                inactive_projects.append(project)
        permission_list = [
            'sales.add_salesproject']
        user_perms = User.get_all_permissions(request.user)
        return Response({'projects': SalesProjectListSerializer(inactive_projects, many=True, context={'request': request}).data,
                         'permissions': {permission: True if permission in user_perms else False for permission in permission_list}
                         }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getcurrencies(self, request):
        return Response(CURRENCY_CHOICES)

    @action(detail=True, methods=['GET'], name='getexternalusers')
    def getexternalusers(self, request,  pk=None):
        project = SalesProject.objects.get(sales_project_id=pk)
        team = project.userProfile.all().values('id')
        queryset = UserProfile.objects.exclude(id__in=team)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['GET'], name='getexternalcustomers')
    def getexternalcustomers(self, request,  pk=None):
        queryset = CustomerInformation.objects.exclude(salesproject__in=pk)
        print(queryset)
        serializer = ProjectCustomerSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['PUT'], name='transferproject')
    def transferproject(self, request,  pk=None):
        project = SalesProject.objects.get(sales_project_id=pk)
        if 'active_customers' in request.data:
            for customer in CustomerInformation.objects.filter(customer_id__in=request.data['active_customers']):
                customer.customer_id = None
                clonedCustomer = customer.save()
        if 'inactive_customers' in request.data:
            for customer in CustomerInformation.objects.filter(customer_id__in=request.data['inactive_customers']):
                customer.customer_id = None
                clonedCustomer = customer.save()
        if 'vendors' in request.data:
            for vendor in VendorInformation.objects.filter(vendor_id__in=request.data['vendors']):
                print(customer.customer_id)
                customer.customer_id = None
                clonedCustomer = customer.save()
                print(clonedCustomer.customer_id)
        project.userProfile.clear()
        project.userProfile.add(
            *UserProfile.objects.filter(id__in=request.data['team']))
        project.sales_department = SalesDepartment.objects.get(
            department_id=request.data['department'])
        project.save()
        return Response('', status=HTTP_200_OK)

    @action(detail=True, methods=['PUT'], name='updateuser')
    def changeuser(self, request,  pk=None):
        project = SalesProject.objects.get(sales_project_id=pk)
        user = UserProfile.objects.get(user=request.user)
        if project.river.project_status.on_final_state == True:
            return Response({'message': ['Sorry you cannot edit once the project is closed']}, status=HTTP_400_BAD_REQUEST)
        else:
            if request.data['type'] == 'REMOVE':
                removed_users = UserProfile.objects.filter(
                    pk__in=request.data['removed_users'])
                if project.userProfile.count() <= removed_users.count():
                    return Response({'message': ['Sorry you cannot remove all users']}, status=HTTP_400_BAD_REQUEST)
                else:
                    obj = SalesProjectM2M(
                        user=user, project=project, action='update')
                    obj.save()
                    project.userProfile.remove(*removed_users)
                    for user in removed_users:
                        Notifications.objects.create(
                            target=user.user,
                            extra='Users',
                            object_url='',
                            title='You have been removed from [ Project: ' + pk + ' ]',
                        )
                    for user in project.userProfile.all():
                        Notifications.objects.create(
                            target=user.user,
                            extra='Users',
                            object_url='',
                            title='[ Project: ' + pk + ' ] ' + 'The following users have been removed : {}'.format(', '.join(str(u.user.username) for u in removed_users)
                                                                                                                   )
                        )

                    for user in request.data['removed_users']:
                        obj.user_removed.add(user)
                    return Response(SalesProjectDetailSerializer(project, context={'request': request}).data, status=HTTP_200_OK)
            else:
                obj = SalesProjectM2M(
                    user=user, project=project, action='update')
                obj.save()
                added_users = UserProfile.objects.filter(
                    pk__in=request.data['added_users'])
                project.userProfile.add(*added_users)
                for user in added_users:
                    Notifications.objects.create(
                        target=user.user,
                        extra='Users',
                        object_url='',
                        title='You have been added to [ Project: ' + pk + ' ]',
                    )
                for user in project.userProfile.all():
                    Notifications.objects.create(
                        target=user.user,
                        extra='Users',
                        object_url='',
                        title='[ Project: ' + pk + ' ] ' + 'Please welcome the following user(s) : {}'.format(', '.join(str(u.user.username) for u in added_users)
                                                                                                              ))
                for user in request.data['added_users']:
                    obj.user_added.add(user)
                return Response(SalesProjectDetailSerializer(project, context={'request': request}).data, status=HTTP_200_OK)

    def get_serializer_class(self):
        if hasattr(self, 'action_serializers'):
            return self.action_serializers.get(self.action, self.serializer_class)
        return super(SalesProjectViewSet, self).get_serializer_class()

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            print([permission()
                   for permission in self.permission_classes_by_action[self.action]])
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]


class SalesNotationViewSet(viewsets.ModelViewSet):
    serializer_class = SalesNotationSerializer
    queryset = SalesNotation.objects.all()

    def create(self, request, *args, **kwargs):
        request.data['userProfile'] = UserProfile.objects.get(
            user=request.user).id
        serializer = SalesNotationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        project = serializer.instance.sales_project
        return Response(SalesProjectDetailSerializer(project, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        project = instance.sales_project
        self.perform_destroy(instance)
        return Response(SalesProjectDetailSerializer(project, context={'request': request}).data)


'''<----------Forecast revenue Pemissions defined here----------->'''


class ForecastUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_revenueforecast')

    def has_object_permission(self, request, view, obj):
        if obj.project.river.project_status.on_final_state == True:
            return False
        return True

class ForecastCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_revenueforecast')

'''<------------------------------------------------------------>'''

class RevenueForecastViewSet(viewsets.ModelViewSet):
    serializer_class = RevenueForecastSerializer
    queryset = RevenueForecast.objects.all()

    permission_classes_by_action = {
        'update': [
            ForecastUpdatePermissions, IsAuthenticated
        ],
        'partial_update': [
            ForecastUpdatePermissions, IsAuthenticated
        ],
        'create': [
            ForecastCreatePermissions, IsAuthenticated
        ],
    }
    def create(self, request, *args, **kwargs):
        serializer = RevenueForecastSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        project = serializer.instance.project
        return Response({
            'forecast_id': serializer.instance.forecast_id,
            'project' : SalesProjectDetailSerializer(project, context={'request': request}).data
             }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = RevenueForecastSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        project = instance.project
        return Response({
            'forecast_id': serializer.instance.forecast_id,
            'project' : SalesProjectDetailSerializer(project, context={'request': request}).data
             }, status=status.HTTP_201_CREATED)

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            print([permission()
                   for permission in self.permission_classes_by_action[self.action]])
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]



'''<----------Cust Requirements Pemissions defined here----------->'''


class RequirementUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_customerrequirement')

    def has_object_permission(self, request, view, obj):
        if obj.sales_project.river.project_status.on_final_state == True:
            return False
        return True


class RequirementCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_customerrequirement')


'''<------------------------------------------------------------>'''


class CustomerRequirementViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerRequirementSerializer
    queryset = CustomerRequirement.objects.all()

    def create(self, request, *args, **kwargs):
        project_instance = SalesProject.objects.get(
            sales_project_id=request.data['sales_project'])
        if project_instance.river.project_status.on_final_state == True:
            return Response({'message': ['Sorry you cant add requirements when project is closed']}, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = CustomerRequirementSerializer(
                data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            project = serializer.instance.sales_project
            return Response({'project': SalesProjectDetailSerializer(project, context={'request': request}).data,
                             'requirement_id': serializer.instance.customer_requirement_id}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = CustomerRequirementSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        project = instance.sales_project
        return Response(SalesProjectDetailSerializer(project, context={'request': request}).data, status=status.HTTP_201_CREATED)

    permission_classes_by_action = {
        'update': [
            RequirementUpdatePermissions, IsAuthenticated
        ],
        'partial_update': [
            RequirementUpdatePermissions, IsAuthenticated
        ],
        'create': [
            RequirementCreatePermissions, IsAuthenticated
        ],
    }

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            print([permission()
                   for permission in self.permission_classes_by_action[self.action]])
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]


'''<------------------Permissions for Quotations---------------------->'''
'''please test this out in the detail view...'''


class QuotationRetrievePermissions(BasePermission):
    def has_object_permission(self, request, view, obj):
        userprofile = UserProfile.objects.get(user=request.user)
        if request.user.has_perm('sales.tier_3_oversight'):
            return True
        elif request.user.has_perm('sales.tier_2_oversight'):
            for department in userprofile.department.all():
                if department in obj.creator.userprofile.department.all():
                    return True
        else:
            if obj.salesProject:
                if userprofile in obj.salesProject.userProfile.all():
                    return True
            else:
                if obj.creator == request.user:
                    return True
        return False


class QuotationUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_quotation')

    def has_object_permission(self, request, view, obj):
        if obj.river.quotation_status.on_final_state == True:
            return False
        return True


class QuotationCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_quotation')

class QuotationAssignPermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.assign_quotation_project')

class QuotationUnassignPermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.unassign_quotation_project')



'''<------------------------------------------------------------------>'''


class QuotationViewSet(viewsets.ModelViewSet):
    serializer_class = QuotationProjectSerializer
    queryset = Quotation.objects.all()


    permission_classes_by_action = {
        'retrieve': [
            QuotationRetrievePermissions, IsAuthenticated],

        'update': [
            QuotationUpdatePermissions, IsAuthenticated
        ],

        'partial_update': [
            QuotationUpdatePermissions, IsAuthenticated
        ],

        'create': [
            QuotationCreatePermissions, IsAuthenticated
        ],
        'assignproject': [
            QuotationAssignPermissions, IsAuthenticated
        ],
        'unassignproject': [
            QuotationUnassignPermissions, IsAuthenticated
        ],
        'assignfromcustomer': [
            QuotationAssignPermissions, IsAuthenticated
        ],
    }

    def create(self, request, *args, **kwargs):
        _mutable = request.data._mutable
        request.data._mutable = True
        request.data['creator'] = request.user.id
        items_data = request.data.pop('items')
        request.data._mutable = _mutable
        serializer = QuotationSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        items_data = json.loads(items_data[0])
        for item_data in items_data:
            item_data['block'] = BudgetBlock.objects.get(block_id=item_data['block'])
            QuotationItem.objects.create(
                **item_data, quotation=serializer.instance)
        if request.data['type'] == 'PROJECT':
            project = serializer.instance.salesProject
            return Response({'project': SalesProjectDetailSerializer(project, context={'request': request}).data,
                             'quotation_id': serializer.instance.quotation_id}, status=status.HTTP_201_CREATED)
        elif request.data['type'] == 'CUSTOMER':
            customer = serializer.instance.customer
            return Response(CustomerInformationDetailSerializer(customer, context={'request': request}).data,
                            status=status.HTTP_201_CREATED)
        else:
            if 'salesProject' in  request.data:
                targets = [target.id for target in serializer.instance.salesProject.userProfile.all()]
                return Response({
                    'user_list': targets,
                    'quotation':QuotationProjectSerializer(serializer.instance, context={'request': request}).data
                    },status=status.HTTP_201_CREATED)
            else:
                return Response(QuotationProjectSerializer(serializer.instance, context={'request': request}).data,
                                status=status.HTTP_201_CREATED)


    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getapprovals(self, request):
        user = request.user
        # To get the approvals for quotations
        all_outstanding_quotations = Quotation.river.quotation_status.get_on_approval_objects(
            as_user=user)
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding_quotations = all_outstanding_quotations
        elif self.request.user.has_perm('sales.tier_2_oversight'):
            filtered_oustanding_quotations = all_outstanding_quotations.filter(
                creator__userprofile__department__in=user.userprofile.department.all())
        else:
            # quotation that have a project assigned , only retrieve quotation from project of whom the user is involved in:
            project_quotations = all_outstanding_quotations.filter(
                salesProject__isnull=False).filter(salesProject__userProfile__in=[user.userprofile])
            # retrieve quotation that was created by him:
            customer_quotations = all_outstanding_quotations.filter(
                salesProject__isnull=True).filter(creator=user)
            filtered_oustanding_quotations = project_quotations | customer_quotations
        return Response(QuotationProjectSerializer(filtered_oustanding_quotations, many=True, context={'request': request}).data, status=HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getinactivequotations(self, request):
        user = request.user
        inactive_quotations = []
        if user.has_perm('sales.tier_3_oversight'):
            available_quotations = Quotation.objects.all()
        elif user.has_perm('sales.tier_2_oversight'):
            available_quotations = Quotation.objects.filter(
                creator__userprofile__department__in=user.userprofile.department.all())
        else:
            # quotation that have a project assigned , only retrieve quotation from project of whom the user is involved in:
            project_quotations = Quotation.objects.filter(salesProject__isnull=False).filter(
                salesProject__userProfile__in=[user.userprofile])
            # retrieve quotation that was created by him:
            customer_quotations = Quotation.objects.filter(
                salesProject__isnull=True).filter(creator=user)
            available_quotations = project_quotations | customer_quotations

        # this step is to sieve out only active tickets
        for quotation in available_quotations:
            if quotation.river.quotation_status.on_final_state == True:
                inactive_quotations.append(quotation)

        permission_list = [
            'sales.add_quotation']
        user_perms = User.get_all_permissions(request.user)
        return Response({'quotations': QuotationProjectSerializer(inactive_quotations, many=True, context={'request': request}).data,
                         'permissions': {permission: True if permission in user_perms else False for permission in permission_list}
                         }, status=status.HTTP_200_OK)

    def get_queryset(self):
        user = self.request.user
        if self.action == 'retrieve':
            quotations = Quotation.objects.all()
            return quotations
        elif self.action == 'list':
            active_quotations = []
            if user.has_perm('sales.tier_3_oversight'):
                available_quotations = Quotation.objects.all()
            elif user.has_perm('sales.tier_2_oversight'):
                available_quotations = Quotation.objects.filter(
                    creator__userprofile__department__in=user.userprofile.department.all())
            else:
                # quotation that have a project assigned , only retrieve quotation from project of whom the user is involved in:
                project_quotations = Quotation.objects.filter(salesProject__isnull=False).filter(
                    salesProject__userProfile__in=[user.userprofile])
                # retrieve quotation that was created by him:
                customer_quotations = Quotation.objects.filter(
                    salesProject__isnull=True).filter(creator=user)
                available_quotations = project_quotations | customer_quotations

            # this step is to sieve out only active tickets
            for quotation in available_quotations:
                if quotation.river.quotation_status.on_final_state == False:
                    active_quotations.append(quotation)
            return active_quotations
        else:
            return Quotation.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = QuotationSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if request.data['type'] == 'PROJECT':
            project = instance.salesProject
            return Response(SalesProjectDetailSerializer(project, context={'request': request}).data, status=status.HTTP_201_CREATED)
        elif request.data['type'] == 'CUSTOMER':
            customer = instance.customer
            return Response(CustomerInformationDetailSerializer(customer, context={'request': request}).data, status=status.HTTP_201_CREATED)
        else:
            return Response(QuotationProjectSerializer(instance, context={'request': request}).data,
                            status=status.HTTP_201_CREATED)

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]

    @action(detail=False, methods=['GET'])
    def unassignedquotation(self, request,  pk=None):
        project = self.request.query_params.get('project')
        qs = QuotationItem.objects.exclude(budgetblock__project=project).values_list(
            'quotation', flat=True).distinct()
        qs = Quotation.objects.exclude(
            quotation_id__in=qs).exclude(salesProject=project)
        serializer = QuotationProjectSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['PATCH'])
    def assignproject(self, request,  pk=None):
        project = SalesProject.objects.get(
            sales_project_id=self.request.query_params.get('project'))
        for pk in request.data:
            instance = Quotation.objects.get(quotation_id=pk)
            instance.salesProject = project
            if project in instance.unassigned_project.all():
                instance.unassigned_project.remove(project)
            instance.save()
        return Response(SalesProjectDetailSerializer(project, context={'request': request}).data)

    @action(detail=True, methods=['PATCH'])
    def unassignproject(self, request,  pk=None):
        project = SalesProject.objects.get(
            sales_project_id=self.request.query_params.get('project'))
        instance = self.get_object()
        serializer = QuotationSerializer(
            instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        instance.unassigned_project.add(project)
        return Response(SalesProjectDetailSerializer(project, context={'request': request}).data)

    @action(detail=True, methods=['PATCH'])
    def assignfromcustomer(self, request,  pk=None):
        instance = self.get_object()
        serializer = QuotationSerializer(
            instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        targets = SalesProject.objects.get(
            sales_project_id=request.data['salesProject']).userProfile.all()
        return Response({'customer': CustomerInformationDetailSerializer(instance.customer, context={'request': request}).data,
                         'targets': CustomerAuthororizedUserSerializer(targets, many=True).data}, status=HTTP_200_OK)

    @action(detail=True, methods=['PATCH'])
    def setinactive(self, request,  pk=None):
        instance = self.get_object()
        serializer = QuotationSerializer(
            instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if instance.salesProject:
            return Response(SalesProjectDetailSerializer(instance.salesProject, context={'request': request}).data)
        else:
            return Response(CustomerInformationDetailSerializer(instance.customer, context={'request': request}).data)


'''<--------------------------Quotation item perms--------------------------------->'''


class QuotationItemUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_quotationitem')


class QuotationItemCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_quotationitem')


'''<------------------------------------------------------------------>'''


class QuotationItemViewSet(viewsets.ModelViewSet):
    serializer_class = QuotationItemSerializer
    queryset = QuotationItem.objects.all()

    permission_classes_by_action = {
        'update': [
            QuotationItemUpdatePermissions, IsAuthenticated
        ],
        'partial_update': [
            QuotationItemUpdatePermissions, IsAuthenticated
        ],

        'create': [
            QuotationItemCreatePermissions, IsAuthenticated
        ],
    }

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.quotation.river.quotation_status.on_final_state == True:
            return Response({'message': ['Sorry you cannot add items when the quotation is closed']}, status=status.HTTP_201_CREATED)
        else:
            partial = kwargs.pop('partial', False)
            serializer = QuotationItemSerializer(
                instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            if request.data['type'] == 'PROJECT':
                return Response(SalesProjectDetailSerializer(instance.quotation.salesProject, context={'request': request}).data)
            elif request.data['type'] == 'CUSTOMER':
                return Response(CustomerInformationDetailSerializer(instance.quotation.customer, context={'request': request}).data, status=status.HTTP_201_CREATED)
            else:
                return Response(QuotationProjectSerializer(instance.quotation, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def create(self, request, *args, **kwargs):
        quotation = Quotation.objects.get(
            quotation_id=request.data['quotation'])
        if quotation.river.quotation_status.on_final_state == True:
            return Response({'message': ['Sorry you cannot add items when the quotation is closed']}, status=status.HTTP_201_CREATED)
        else:
            serializer = QuotationItemSerializer(
                data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            if request.data['type'] == 'PROJECT':
                project = SalesProject.objects.get(
                    sales_project_id=request.data['project'])
                return Response(SalesProjectDetailSerializer(project, context={'request': request}).data, status=status.HTTP_201_CREATED)
            elif request.data['type'] == 'CUSTOMER':
                customer = CustomerInformation.objects.get(
                    customer_id=request.data['customer'])
                return Response(CustomerInformationDetailSerializer(customer, context={'request': request}).data, status=status.HTTP_201_CREATED)
            else:
                return Response(QuotationProjectSerializer(quotation, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            print([permission()
                   for permission in self.permission_classes_by_action[self.action]])
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]


'''<--------------------------Quotation item perms--------------------------------->'''


class ItemUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_item')


class ItemCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_item')


'''<------------------------------------------------------------------>'''


class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    queryset = Item.objects.all()
    permission_classes_by_action = {
        'update': [
            ItemUpdatePermissions, IsAuthenticated
        ],
        'partial_update': [
            ItemUpdatePermissions, IsAuthenticated
        ],
        'create': [
            ItemCreatePermissions, IsAuthenticated
        ],
    }

    def list(self, request):
        queryset = self.get_queryset()
        permission_list = [
            'sales.add_item',
            'sales.recover_item']
        user_perms = User.get_all_permissions(request.user)
        items = Item.objects.all()
        return Response({'items': ItemSerializer(items, many=True).data,
                         'permissions': {permission: True if permission in user_perms else False for permission in permission_list}
                         }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['GET'], name='update')
    def detailpage(self, request,  pk=None):
        queryset = Item.objects.get(item_id=pk)
        serializer = ItemDetailSerializer(
            queryset, many=False,  context={'request': request})
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = ItemSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(ItemDetailSerializer(serializer.instance, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = ItemSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(ItemDetailSerializer(instance, context={'request': request}).data)

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            print([permission()
                   for permission in self.permission_classes_by_action[self.action]])
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]

'''<--------------------------Budget perms--------------------------------->'''


class BudgetRetrievePermissions(BasePermission):
    def has_object_permission(self, request, view, obj):
        userprofile = UserProfile.objects.get(user=request.user)
        if request.user.has_perm('sales.tier_3_oversight'):
            return True
        elif request.user.has_perm('sales.tier_2_oversight'):
            for department in userprofile.department.all():
                if department in obj.creator.userprofile.department.all():
                    return True
        else:
            if obj.project:
                if userprofile in obj.project.userProfile.all():
                    return True
            else:
                if obj.creator == request.user:
                    return True
        return False

class BudgetDeletePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.delete_budgetblock')

class BudgetUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_budgetblock')

class BudgetCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_budgetblock')


'''<------------------------------------------------------------------>'''


class BudgetBlockViewSet(viewsets.ModelViewSet):
    action_serializers = {
        'retrieve': BudgetBlockDetailSerializer,
        'create': BudgetBlockSerializer,
        'update': BudgetBlockSerializer,
        'list': BudgetBlockOptionsSerializer
    }

    permission_classes_by_action = {
        'retrieve': [
            BudgetRetrievePermissions, IsAuthenticated],

        'update': [
            BudgetUpdatePermissions, IsAuthenticated
        ],

        'partial_update': [
            BudgetUpdatePermissions, IsAuthenticated
        ],
        'create': [
            BudgetCreatePermissions, IsAuthenticated
        ],
        'delete': [
            BudgetDeletePermissions, IsAuthenticated
        ],
    }


    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getapprovals(self, request):
        user = request.user
        # To get the approvals for budget block
        all_outstanding_blocks = BudgetBlock.river.block_status.get_on_approval_objects(
            as_user=user)
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding_blocks = all_outstanding_blocks
        elif self.request.user.has_perm('sales.tier_2_oversight'):
            filtered_oustanding_blocks = all_outstanding_blocks.filter(
                creator__userprofile__department__in=user.userprofile.department.all())
        else:
            # budget block that have a project assigned , only retrieve budget block from project of whom the user is involved in:
            project_blocks = all_outstanding_blocks.filter(
                salesProject__isnull=False).filter(salesProject__userProfile__in=[user.userprofile])
            # retrieve block that was created by him:
            customer_blocks = all_outstanding_blocks.filter(
                salesProject__isnull=True).filter(creator=user)
            filtered_oustanding_blocks = project_blocks | customer_blocks
        return Response(BudgetBlockDetailSerializer(filtered_oustanding_blocks, many=True, context={'request': request}).data, status=HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getinactiveblock(self, request):
        user = request.user
        inactive_block = []
        if user.has_perm('sales.tier_3_oversight'):
            available_block = BudgetBlock.objects.all()
        elif user.has_perm('sales.tier_2_oversight'):
            available_block = BudgetBlock.objects.filter(
                creator__userprofile__department__in=user.userprofile.department.all())
        else:
            # block that have a project assigned , only retrieve block from project of whom the user is involved in:
            project_block = BudgetBlock.objects.filter(salesProject__isnull=False).filter(
                salesProject__userProfile__in=[user.userprofile])
            # retrieve block that was created by him:
            customer_block = BudgetBlock.objects.filter(
                salesProject__isnull=True).filter(creator=user)
            available_block = project_block | customer_block

        # this step is to sieve out only active tickets
        for block in available_block:
            if block.river.block_status.on_final_state == True:
                inactive_block.append(block)

        permission_list = [
            'sales.add_budgetblock']
        user_perms = User.get_all_permissions(request.user)
        return Response({'block': BudgetBlockDetailSerializer(inactive_block, many=True, context={'request': request}).data,
                         'permissions': {permission: True if permission in user_perms else False for permission in permission_list}
                         }, status=status.HTTP_200_OK)



    def get_queryset(self):
        user = self.request.user
        if self.action == 'retrieve':
            blocks = BudgetBlock.objects.all()
            return blocks
        elif self.action == 'list':
            active_blocks = []
            if user.has_perm('sales.tier_3_oversight'):
          
                available_blocks = BudgetBlock.objects.all()
            elif user.has_perm('sales.tier_2_oversight'):
 
                available_blocks = BudgetBlock.objects.filter(
                    creator__userprofile__department__in=user.userprofile.department.all())
            else:
    
                # block that have a project assigned , only retrieve quotation from project of whom the user is involved in:
                project_blocks = BudgetBlock.objects.filter(project__isnull=False).filter(
                    project__userProfile__in=[user.userprofile])
                # retrieve block that was created by him:
                customer_blocks = BudgetBlock.objects.filter(
                    project__isnull=True).filter(creator=user)
                available_blocks = project_blocks | customer_blocks

            # this step is to sieve out only active tickets
            for block in available_blocks:
                if block.river.block_status.on_final_state == False:
                    active_blocks.append(block)
            return active_blocks
        else:
            return BudgetBlock.objects.all()

    def create(self, request, *args, **kwargs):
        if 'project' in request.data and SalesProject.objects.get(sales_project_id=request.data['project']).river.project_status.on_final_state:
            return Response({'message': ['Sorry you cant add Budget Blocks when project is closed']}, status=status.HTTP_400_BAD_REQUEST)
        else:
            request.data['creator'] = request.user.id
            serializer = BudgetBlockSerializer(
                data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            project = serializer.instance.project
            if request.data['type'] == 'PROJECT':
                return Response({
                    'project': SalesProjectDetailSerializer(project, context={'request': request}).data,
                    'block_id': serializer.instance.block_id}, status=status.HTTP_201_CREATED)
            else:
                return Response(BudgetBlockDetailSerializer(serializer.instance, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if instance.project and instance.project.river.project_status.on_final_state == True:
            return Response({'message': ['Sorry you cant update Budget Blocks when project is closed']}, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = BudgetBlockSerializer(
                instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            project = instance.project
            if request.data['type'] == 'PROJECT':
                return Response(SalesProjectDetailSerializer(project, context={'request': request}).data)
            else:   
                return Response(BudgetBlockDetailSerializer(instance, context={'request': request}).data)

    @action(detail=True, methods=['PATCH'])
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.project.river.project_status.on_final_state == True:
            return Response({'message': ['Sorry you cant delete Budget Blocks when project is closed']}, status=status.HTTP_400_BAD_REQUEST)
        else:
            project = instance.project
            print(instance)
            print(QuotationItem.objects.filter(block=instance))
            if QuotationItem.objects.filter(block=instance).exists():
                return Response(status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = BudgetBlockSerializer(
                    instance, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response(SalesProjectDetailSerializer(project, context={'request': request}).data)

    @action(detail=False, methods=['GET'])
    def projectblock(self, request,  pk=None):
        project = SalesProject.objects.get(
            sales_project_id=self.request.query_params.get('project'))
        date = self.request.query_params.get('date')
        query = Q(project=project)
        if date != None:
            query &= Q(start_date__lte=date, end_date__gte=date)
        qs = BudgetBlock.objects.filter(query)
        serializer = BudgetBlockOptionsSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def spotblock(self, request,  pk=None):
        date = self.request.query_params.get('date')
        qs = BudgetBlock.objects.filter(project=None, start_date__lte=date, end_date__gte=date)
        serializer = BudgetBlockOptionsSerializer(qs, many=True)
        return Response(serializer.data)

    def get_serializer_class(self):
        if hasattr(self, 'action_serializers'):
            return self.action_serializers.get(self.action, self.serializer_class)
        return super(SalesProjectViewSet, self).get_serializer_class()

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            print([permission()
                   for permission in self.permission_classes_by_action[self.action]])
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]


'''<---------------------Permissions For Competitor Items------------------------->'''


class CompetitorItemUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_competitoritem')


class CompetitorItemCreatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_competitoritem')


'''<------------------------------------------------------------------->'''


class CompetitorItemViewSet(viewsets.ModelViewSet):
    serializer_class = CompetitorItemSerializer
    queryset = CompetitorItem.objects.all()
    permission_classes_by_action = {
        'update': [
            CompetitorItemUpdatePermissions
        ],
        'partial_update': [
            CompetitorItemUpdatePermissions, IsAuthenticated
        ],
        'create': [
            CompetitorItemCreatePermissions, IsAuthenticated
        ]
    }

    def create(self, request, *args, **kwargs):
        item = Item.objects.get(item_id=request.data['item'])
        serializer = CompetitorItemSerializer(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(ItemDetailSerializer(item, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = CompetitorItemSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        #item = Item.objects.get(item_id=request.query_params.get('item'))
        return Response(ItemDetailSerializer(instance.item, context={'request': request}).data)

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            print([permission()
                   for permission in self.permission_classes_by_action[self.action]])
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]


'''<---------------------Permissions For Ticket------------------------->'''


class TicketRetrievePermissions(BasePermission):
    '''Retrieve permissions. This is where i will do the check to see if poc infomration has been updated'''
    def has_object_permission(self, request, view, obj):
        if obj.phone == None:
            obj.phone = obj.customerPoc.number

        if obj.email == None:
            obj.email = obj.customerPoc.email
        obj.save()

        userprofile = UserProfile.objects.get(user=request.user)
        if obj.assigned_to == None:
            return True
        else:
            if request.user.has_perm('sales.tier_3_oversight'):
                return True
            elif request.user.has_perm('sales.tier__oversight'):
                for department in userprofile.department.all():
                    if department in obj.assigned_to.userprofile.department.all():
                        return True
            else:
                if obj.salesProject:
                    if userprofile in obj.salesProject.userProfile.all():
                        return True
                else:
                    if request.user == obj.assigned_to:
                        return True
            return False


class TicketCreatePermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_ticket')


class TicketUpdatePermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_ticket')

    def has_object_permission(self, request, view, obj):
        if obj.river.ticket_status.on_final_state == True:
            return False
        return True


class TicketAssignExistingProjectPermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.can_assign_ticket_project')


class TicketAssignExistingCustomerPermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.can_assign_ticket_customer')


class TicketAssignNewProjectPermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_salesproject')


class TicketAssignNewCustomerPermissions(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_customerinformation')


class TicketChangeCustomerPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.can_change_ticket_customer')


class TicketChangeProjectPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.can_change_ticket_project')


'''<-------------------------------------------------------------------->'''


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    action_serializers = {
        'retrieve': TicketDetailSerializer,
        'list': TicketSerializer,
        'create': TicketCreateSerializer,
        'update': TicketUpdateSerializer,
    }

    permission_classes_by_action = {
        'retrieve': [
            TicketRetrievePermissions, IsAuthenticated],
        'update': [
            TicketUpdatePermissions
        ],
        'partial_update': [
            TicketUpdatePermissions, IsAuthenticated
        ],
        'create': [
            TicketCreatePermission, IsAuthenticated
        ],
        'assignnewcustomer': [
            TicketAssignNewCustomerPermissions, IsAuthenticated
        ],
        'assignexistingcustomer': [
            TicketAssignExistingCustomerPermissions, IsAuthenticated
        ],
        'assignnewproject': [
            TicketAssignNewProjectPermissions, IsAuthenticated
        ],
        'assignexistingproject': [
            TicketAssignExistingProjectPermissions, IsAuthenticated
        ],
        'changecustomer': [
            TicketChangeCustomerPermission, IsAuthenticated
        ],
        'changeproject': [
            TicketChangeProjectPermission, IsAuthenticated
        ],
    }

    def get_queryset(self):
        user = self.request.user
        if self.action == 'retrieve':
            tickets = Ticket.objects.all()
            return tickets
        elif self.action == 'list':
            active_tickets = []
            if user.has_perm('sales.tier_3_oversight'):
                available_tickets = Ticket.objects.all()
            elif user.has_perm('sales.tier_2_oversight'):
                available_tickets = Ticket.objects.filter(
                    assigned_to__userprofile__department__in=user.userprofile.department.all())
            else:
                # tickets that have a project assigned , only retrieve tickets from project of whom the user is involved in:
                project_tickets = Ticket.objects.filter(salesProject__isnull=False).filter(
                    salesProject__userProfile__in=[user.userprofile])
                # tickets that have a customer assigned but no project assigned , retrieve tickets that was created by him:
                customer_tickets = Ticket.objects.filter(salesProject__isnull=True).filter(
                    customerPoc__isnull=False).filter(assigned_to=user)
                unassigned_tickets = Ticket.objects.filter(
                    assigned_to__isnull=True)
                available_tickets = project_tickets | customer_tickets | unassigned_tickets

            # this step is to sieve out only active tickets
            for ticket in available_tickets:
                if ticket.river.ticket_status.on_final_state == False:
                    active_tickets.append(ticket)
            return active_tickets
        else:
            return Ticket.objects.all()

    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getapprovals(self, request):
        # To get approvals for the tickets(more complex bc sales proj might be involved)
        all_outstanding_tickets = Ticket.river.ticket_status.get_on_approval_objects(
            as_user=request.user)
        if self.request.user.has_perm('sales.tier_3_oversight'):
            filtered_oustanding_tickets = all_outstanding_tickets
        elif self.request.user.has_perm('sales.tier_2_oversight'):
            filtered_oustanding_tickets = all_outstanding_tickets.filter(
                assigned_to__userprofile__department__in=request.user.userprofile.department.all())
        else:
            # tickets that have a project assigned , only retrieve tickets from project of whom the user is involved in:
            project_tickets = all_outstanding_tickets.filter(salesProject__isnull=False).filter(
                salesProject__userProfile__in=[request.user.userprofile])
            # tickets that have a customer assigned but no project assigned , retrieve tickets departmental level:
            customer_tickets = all_outstanding_tickets.filter(salesProject__isnull=True).filter(
                customerPoc__isnull=False).filter(assigned_to=request.user)
            filtered_oustanding_tickets = project_tickets | customer_tickets
        return Response(TicketSerializer(filtered_oustanding_tickets, many=True, context={'request': request}).data, status=HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='getcurrencies')
    def getinactivetickets(self, request):
        user = request.user
        inactive_tickets = []
        if user.has_perm('sales.tier_3_oversight'):
            available_tickets = Ticket.objects.all()
        elif user.has_perm('sales.tier_2_oversight'):
            available_tickets = Ticket.objects.filter(
                assigned_to__userprofile__department__in=user.userprofile.department.all())
        else:
            # tickets that have a project assigned , only retrieve tickets from project of whom the user is involved in:
            project_tickets = Ticket.objects.filter(salesProject__isnull=False).filter(
                salesProject__userProfile__in=[user.userprofile])
            # tickets that have a customer assigned but no project assigned , retrieve tickets that was created by him:
            customer_tickets = Ticket.objects.filter(salesProject__isnull=True).filter(
                customerPoc__isnull=False).filter(assigned_to=user)
            available_tickets = project_tickets | customer_tickets

        # this step is to sieve out only active tickets
        for ticket in available_tickets:
            if ticket.river.ticket_status.on_final_state == True:
                inactive_tickets.append(ticket)

        permission_list = ['sales.add_ticket']
        user_perms = User.get_all_permissions(request.user)
        return Response({'tickets': TicketSerializer(inactive_tickets, many=True, context={'request': request}).data,
                         'permissions': {permission: True if permission in user_perms else False for permission in permission_list}
                         }, status=status.HTTP_200_OK)

    def update(self, request,  *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = TicketDetailSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        if instance.source == 'others':
            self.perform_update(serializer)
            return Response(TicketDetailSerializer(instance, context={'request': request}).data, status=HTTP_200_OK)
        else:
            return Response({'message': ['Sorry but you can\'t change the contents written by the customer']}, status=HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'], name='assignproject')
    def assignexistingproject(self, request):
        ticket = Ticket.objects.get(id=request.data['ticket'])
        if ticket.salesProject == None:
            project = SalesProject.objects.get(
                sales_project_id=request.data['salesProject'])
            ticket.salesProject = project
            ticket.save()
            return Response(TicketDetailSerializer(ticket, context={'request': request}).data, status=HTTP_200_OK)
        else:
            return Response({'message': ['Someone already assigned a project!']}, status=HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'], name='createproject')
    def assignnewproject(self, request):
        ticket = Ticket.objects.get(id=request.data['ticket'])
        if ticket.salesProject == None:
            create_project_request = SalesProjectSerializer(
                data=request.data, context={'request': request})
            if create_project_request.is_valid():
                project = create_project_request.save()
                ticket.salesProject = project
                ticket.save()
                return Response(TicketDetailSerializer(ticket, context={'request': request}).data, status=HTTP_200_OK)
            else:
                return Response(create_project_request.errors, status=HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': ['Someone already assigned a project!']}, status=HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'], name='assigncustomer')
    def assignexistingcustomer(self, request):
        ticket = Ticket.objects.get(id=request.data['ticket'])
        if ticket.customerPoc == None:
            customer = CustomerInformation.objects.get(
                customer_id=request.data['customerInformation'])
            # Checking if the POC is alr in database , this is based on phone -> then email
            email = request.data['email']
            phone = request.data['phone']
            for poc in customer.pocs.all():
                if SequenceMatcher(a=poc.email, b=email).ratio() > 0.95:
                    ticket.customerPoc = poc
                    ticket.save()
                    return Response(TicketDetailSerializer(ticket, context={'request': request}).data, status=HTTP_200_OK)
                elif SequenceMatcher(a=poc.number, b=phone).ratio() > 0.95:
                    ticket.customerPoc = poc
                    ticket.save()
                    return Response(TicketDetailSerializer(ticket, context={'request': request}).data, status=HTTP_200_OK)

            poc = CustomerPoc.objects.create(
                name=request.data['name'],
                email=request.data['email'],
                number=request.data['phone'],
                customerInformation=customer
            )
            ticket.customerPoc = poc
            ticket.save()
            return Response(TicketDetailSerializer(ticket, context={'request': request}).data, status=HTTP_200_OK)
        else:
            return Response({'message': ['Someone already assigned a customer!']}, status=HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'], name='assigncustomer')
    def assignnewcustomer(self, request):
        create_customer_request = CustomerInformationSerializer(
            data=request.data, context={'request': request})
        if create_customer_request.is_valid():
            customer = create_customer_request.save()
            ticket = Ticket.objects.get(id=request.data['ticket'])
            poc = CustomerPoc.objects.get(customerInformation=customer)
            ticket.customerPoc = poc
            ticket.save()
            return Response(TicketDetailSerializer(ticket, context={'request': request}).data, status=HTTP_200_OK)
        else:
            print(create_customer_request.errors)
            return Response(create_customer_request.errors, status=HTTP_400_BAD_REQUEST)

    # reason why u can just change is that underlying reason for change is that POC is in wrong place.
    @action(detail=False, methods=['POST'], name='changecustomer')
    def changecustomer(self, request):
        ticket = Ticket.objects.get(id=request.data['ticket'])
        newCustomerInformation = CustomerInformation.objects.get(
            customer_id=request.data['customerInformation'])
        poc = ticket.customerPoc
        poc.customerInformation = newCustomerInformation
        poc.save()
        return Response(TicketDetailSerializer(ticket, context={'request': request}).data, status=HTTP_200_OK)

    # reason why u can just change is that underlying reason for change is that POC is in wrong place.
    @action(detail=False, methods=['POST'], name='changecustomer')
    def changeproject(self, request):
        ticket = Ticket.objects.get(id=request.data['ticket'])
        if 'salesProject' in request.data:
            newProject = SalesProject.objects.get(
                sales_project_id=request.data['salesProject'])
            ticket.salesProject = newProject
            ticket.save()
            return Response(TicketDetailSerializer(ticket, context={'request': request}).data, status=HTTP_200_OK)
        else:
            ticket.salesProject = None
            ticket.save()
            return Response(TicketDetailSerializer(ticket, context={'request': request}).data, status=HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='getpoc')
    def getpoc(self, request):
        queryset = CustomerPoc.objects.all()
        serializer = TicketcustomerPoc
        return Response(serializer(queryset, many=True).data, status=HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='getsalesproject')
    def getsalesproject(self, request):
        customer_id = request.query_params.get('customer_infomation')
        queryset = SalesProject.objects.filter(
            customerInformation=customer_id)
        serializer = SalesProjectListSerializer
        return Response(serializer(queryset, many=True,  context={'request': request}).data, status=HTTP_200_OK)

    def create(self, request):
        request.data['name'] = CustomerPoc.objects.get(
            poc_id=request.data['customerPoc']).name
        request.data['email'] = CustomerPoc.objects.get(
            poc_id=request.data['customerPoc']).email
        request.data['phone'] = CustomerPoc.objects.get(
            poc_id=request.data['customerPoc']).number
        request.data['assigned_to'] = request.user.id
        create_ticket_request = TicketCreateSerializer(data=request.data)
        if create_ticket_request.is_valid():
            ticket = create_ticket_request.save()
            return Response(TicketDetailSerializer(ticket, context={'request': request}).data, status=HTTP_200_OK)
        else:
            return Response(create_ticket_request.errors, status=HTTP_400_BAD_REQUEST)

    # todo
    @action(detail=False, methods=['POST'], name='createfromemail')
    def createfromemail(self, request):
        print(request.data)
        if 'customerPoc' in request.data.keys():
            customerpocobject = CustomerPoc.objects.get(
                poc_id=request.data['customerPoc'])
            ticket = Ticket(name=request.data['name'],
                                email=request.data['email'],
                                phone=request.data['phone'],
                                source=request.data['source'],
                                nature=request.data['nature'],
                                priority=request.data['priority'],
                                title=request.data['title'],
                                content=request.data['content'],
                                assignedEmail=assignedemail,
                                customerPoc=customerpocobject,
                                assigned_to=request.user)
            ticket.save()

        elif 'salesProject' in request.data.keys():
            salesprojectobject = SalesProject.objects.get(
                sales_project_id=request.data['salesProject'])
            customerpoc = CustomerPoc.objects.filter(
                customerInformation=salesprojectobject.customerInformation)
            matchedPoc = None
            for poc in customerpoc:
                pocemail = poc.email.strip().lower()
                requestemail = request.data['email'].strip().lower()
                if SequenceMatcher(a=pocemail, b=requestemail).ratio() > 0.90:
                    matchedPoc = poc
                    break

                else:
                    pass

            if matchedPoc == None:
                CustomerPoc.objects.create(email=request.data['email'].strip().lower(),
                                           name=request.data['name'],
                                           number=request.data['phone'],
                                           customerInformation=salesprojectobject.customerInformation)
                poc = CustomerPoc.objects.get(
                    email=request.data['email'].strip().lower())
                ticket = Ticket(name=request.data['name'],
                                    email=request.data['email'],
                                    phone=request.data['phone'],
                                    source=request.data['source'],
                                    nature=request.data['nature'],
                                    priority=request.data['priority'],
                                    title=request.data['title'],
                                    content=request.data['content'],
                                    assignedEmail=assignedemail,
                                    salesProject=salesprojectobject,
                                    customerPoc=poc,
                                    assigned_to=request.user)
                ticket.save()
            
            else:
                ticket = Ticket(name=request.data['name'],
                                email=request.data['email'],
                                phone=request.data['phone'],
                                source=request.data['source'],
                                nature=request.data['nature'],
                                priority=request.data['priority'],
                                title=request.data['title'],
                                content=request.data['content'],
                                salesProject=salesprojectobject,
                                customerPoc=matchedPoc,
                                assigned_to=request.user)
                ticket.save()
        
        elif 'ticket' in request.data.keys():
            print('inside here')
            ticket = Ticket.objects.get(id=request.data['ticket'])
            print(ticket)
            print(ticket.id)
        
        else:
            ticket = Ticket(name=request.data['name'],
                                email=request.data['email'],
                                phone=request.data['phone'],
                                source=request.data['source'],
                                nature=request.data['nature'],
                                priority=request.data['priority'],
                                title=request.data['title'],
                                content=request.data['content'],
                                assignedEmail=assignedemail,
                                assigned_to=request.user)
            ticket.save()

        '''
        Todo , place the logic for extracting the title, content , name from the email
        Change sequenceMatcher to remove space and capitalization
        '''
       # create_ticket_request = TicketCreateSerializer(data=request.data)
       # if create_ticket_request.is_valid():
            #'''ticket = create_ticket_request.save()'''
        return Response(ticket.id, status=HTTP_200_OK)
        #else:
            #return Response(create_ticket_request.errors, ticket.id, status=HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if hasattr(self, 'action_serializers'):
            return self.action_serializers.get(self.action, self.serializer_class)
        return super(TicketViewSet, self).get_serializer_class()

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            print([permission()
                   for permission in self.permission_classes_by_action[self.action]])
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]


class TicketCMSApi(CreateAPIView):
    permission_classes = [HasAPIKey]
    """
    View to create a ticket object when recieve post request
    from CMS
    """

    def post(self, request, *args, **kwargs):
        print(request.data)
        email = request.data['email']
        phone = request.data['phone']
        for poc in CustomerPoc.objects.all():
            if SequenceMatcher(a=poc.email, b=email).ratio() > 0.90:
                request.data['customerPoc'] = poc.poc_id
            elif SequenceMatcher(a=poc.number, b=phone).ratio() > 0.90:
                request.data['customerPoc'] = poc.poc_id
        request.data['source'] = 'website'
        create_ticket_request = TicketCreateSerializer(data=request.data)
        if create_ticket_request.is_valid():
            ticket = create_ticket_request.save()
            for user in User.objects.all():
                Notifications.objects.create(
                    target=user,
                    extra='Ticket',
                    object_url='/ticket/detail/' + str(ticket.pk),
                    title='There\'s a new unassigned Ticket',
                )

            return Response('', status=HTTP_200_OK)
        else:
            print(create_ticket_request.errors)
            return Response(create_ticket_request.errors, status=HTTP_400_BAD_REQUEST)


class MailAPI(APIView):
    def get(self, request):
        mails = TaggedMail.objects.all()
        serializer = TaggedMailSerializer(mails, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TaggedMailSerializer(data=request.data)
        print(request.data) 

        if serializer.is_valid():
            info = serializer.data
            salesprojectid = serializer.data.get('tagged_project')
            salesproject = SalesProject.objects.get(id=salesprojectid)
            mailid = serializer.data.get('mailid')
            savethis = TaggedMail(mailid=mailid,
                                  body=serializer.data.get('body'),
                                  date=serializer.data.get('date'),
                                  subject=serializer.data.get('subject'),
                                  email=serializer.data.get('email'),
                                  tagged_project=salesproject)
            savethis.save()
            return Response(serializer.data)

        else:
            obj = TaggedMail.objects.get(mailid=serializer.data.get('mailid'))
            salesprojectid = serializer.data.get('tagged_project')
            salesproject = SalesProject.objects.get(id=salesprojectid)
            obj.tagged_project = salesproject
            obj.save()
            print('updated')
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


'''<---------------------Permissions For Userprofile------------------------->'''


class UserProfileRetrievePermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class UserProfileUpdatePermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


'''<-------------------------------------------------------------------->'''


class UserProfileViewSet(viewsets.ModelViewSet):
    '''API viewset for UserProfile Page'''
    queryset = UserProfile.objects.all()
    action_serializers = {
        'retrieve': UserProfileSerializer,
        'list': UserProfileListSerializer,
        'create': UserProfileListSerializer,
    }

    permission_classes_by_action = {
        'retrieve': [
            UserProfileRetrievePermission, IsAuthenticated],
        'update': [
            UserProfileUpdatePermission, IsAuthenticated
        ],
        'partial_update': [
            UserProfileUpdatePermission, IsAuthenticated
        ],
    }

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        print(serializer.data)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        print(request.data)
        instance = self.get_object()
        serializer = UserProfileSerializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if 'username' in request.data:
            user = request.user
            user.username = request.data['username']
            user.save()
        instance = self.get_object()
        print(instance.profile_picture.url)
        print(UserProfileSerializer(instance).data)
        return Response(UserProfileSerializer(instance).data)

    '''Gets the the users from other departments.'''
    @action(detail=True, methods=['GET'], name='getotherusers')
    def getotherusers(self, request, pk=None):
        next_department = SalesDepartment.objects.get(department_id=pk)
        print(next_department)
        otherusers = UserProfile.objects.filter(department=next_department)
        return Response(UserProfileSerializer(otherusers, many=True).data, status=HTTP_200_OK)

    @action(detail=False, methods=['PATCH'], name='savelayout')
    def savelayout(self, request, pk=None):
        print(type(request.data))
        print(len(request.data))
        print(request.data)
        user = UserProfile.objects.get(user=request.user)
        serializer = UserProfileSerializer(
        user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(LayoutSerializer(user).data, status=HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='getlayout')
    def getlayout(self, request, pk=None):
        user = UserProfile.objects.get(user=request.user)
        return Response(LayoutSerializer(user).data, status=HTTP_200_OK)

    def get_serializer_class(self):
        if hasattr(self, 'action_serializers'):
            print(self.action)
            return self.action_serializers.get(self.action, self.serializer_class)
        return super(UserProfileViewSet, self).get_serializer_class()

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            print([permission()
                   for permission in self.permission_classes_by_action[self.action]])
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]


'''<---------------------Permissions For Ticket------------------------->'''


class TaskRetrievePermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return False


class TaskCreatePermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.add_tasks')


class TaskUpdatePermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('sales.change_tasks')


'''<-------------------------------------------------------------------->'''


class TaskViewSet(viewsets.ModelViewSet):
    '''API viewset for Tasks , to be used in Calendar'''
    queryset = Tasks.objects.all()
    serializer_class = TaskSerializer
    permission_classes_by_action = {
        'retrieve': [
            TaskRetrievePermission, IsAuthenticated],
        'update': [
            TaskUpdatePermission, IsAuthenticated
        ],
        'partial_update': [
            TaskUpdatePermission, IsAuthenticated
        ],
        'create': [
            TaskCreatePermission, IsAuthenticated
        ],
    }

    def list(self, request):
        if request.query_params.get('project'):
            tasks = Tasks.objects.filter(
                salesProject=request.query_params.get('project'))
       
        elif request.query_params.get('customer'):
            tasks = Tasks.objects.filter(
                customerInformation=request.query_params.get('customer'))
      
        elif request.query_params.get('vendor'):
            tasks = Tasks.objects.filter(
                vendorInformation=request.query_params.get('vendor'))
        else:
            tasks = Tasks.objects.filter(user__in=[request.user])
        print(tasks)
        return Response(TaskSerializer(tasks, many=True).data, status=HTTP_200_OK)

    @action(detail=False, methods=['GET'], name='getdata')
    def getformdata(self, request):
        projects = SalesProject.objects.filter(
            userProfile=request.user.userprofile)
        customers = CustomerInformation.objects.filter(
            salesDepartment__in=request.user.userprofile.department.all())
        vendors = VendorInformation.objects.filter(
            salesDepartment__in=request.user.userprofile.department.all())
        users = User.objects.exclude(id=request.user.id)

        return Response({'projects': TaskProjectSerializer(projects, many=True).data,
                         'customers': TaskCustomerSerializer(customers, many=True).data,
                         'vendors': TaskVendorSerializer(vendors, many=True).data,
                         'users': TaskUserSerializer(users, many=True).data}, status=HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """
        Creates a task. Overriding is neccessary to manually add the m2m
        relations
        """
        create_task_request = TaskCreateSerializer(data=request.data)

        if create_task_request.is_valid():
            task = create_task_request.save()
            if 'user' in request.data:
                user_pks = []
                for user_pk in request.data['user']:
                    user_pks.append(user_pk['id'])
                # add the current user to the list as well
                user_pks.append(request.user.id)
                users = User.objects.filter(id__in=user_pks)
                task.user.add(*users)
            else:
                # Otherwise, add still add the requester to the list.
                task.user.add(request.user)

            if 'customer' in request.data:
                customer_pks = []
                for customer_pk in request.data['customer']:
                    customer_pks.append(customer_pk['id'])
                customers = CustomerInformation.objects.filter(
                    customer_id__in=customer_pks)
                task.customerInformation.add(*customers)

            if 'vendor' in request.data:
                vendor_pks = []
                for vendor_pk in request.data['vendor']:
                    vendor_pks.append(vendor_pk['id'])
                vendors = VendorInformation.objects.filter(
                    vendor_id__in=vendor_pks)
                task.vendorInformation.add(*vendors)

            if 'project' in request.data:
                project_pks = []
                for project_pk in request.data['project']:
                    project_pks.append(project_pk['id'])
                projects = SalesProject.objects.filter(
                    sales_project_id__in=project_pks)
                task.salesProject.add(*projects)
           
            for user in task.user.all():
                if user != request.user:
                    Notifications.objects.create(
                        target=user,
                        extra='Task',
                        object_url='',
                        title='[Task: ' + str(task.id) + '] You have Recieved a new task',
                        )
            return Response(TaskSerializer(task, many=False).data, status=HTTP_200_OK)
        else:
            return Response(create_task_request.errors, status=HTTP_200_OK)

    def get_permissions(self):
        try:
            # return permission_classes depending on action
            print([permission()
                   for permission in self.permission_classes_by_action[self.action]])
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            # action is not set return default permission_classes
            return [permission() for permission in self.permission_classes]

class AssignedEmailViewSet(viewsets.ModelViewSet):
    serializer_class = AssignedEmailSerializer
    queryset = AssignedEmail.objects.all()

    @action(detail=False, methods=['GET'], name='getbasedonticket')
    def getbasedonticket(self, request):
        ticketId = self.request.query_params.get('ticketId')
        assignedemails = AssignedEmail.objects.filter(ticket=ticketId)
        print('assignedemailshere')
        print(assignedemails)
        emaillist = []
        for assignedemail in assignedemails:
            emaillist.append(json.loads(assignedemail.content))
        print('emaillist here')
        print(emaillist)
        return Response(emaillist, status = HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        print(request.data)
        assignedticket = Ticket.objects.get(pk=request.data['ticket'])
        #assignedemail = AssignedEmail(emailId=request.data['emailId'],
        #                             content=request.data['content'],
        #                              ticket=assignedticket)
        #assignedemail.save()
        create_assignedemail_request = AssignedEmailSerializer(data=request.data)
        print(create_assignedemail_request)
        if create_assignedemail_request.is_valid():
            create_assignedemail_request.save()
            return Response(request.data['emailId'], status=HTTP_200_OK)
        else:
            print(create_assignedemail_request.errors)
            return Response(create_assignedemail_request.errors, request.data['emailId'], status=HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        print(request.data)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        print(serializer.errors)
        self.perform_update(serializer)
        return Response(serializer.data)


from rest_framework import serializers
from sales.models import *
from rest_framework.generics import get_object_or_404
from river.models import TransitionApproval
from django.contrib.auth.models import User
from django.http import JsonResponse
from river.models import TransitionApproval, Transition, Workflow, State
from river_admin_remake.views.serializers import WorkflowDto, StateDto, GroupDto
from django.db.models import Q, F, Count, Case, When, Value, CharField, Sum, ExpressionWrapper, FloatField
from django.db.models.functions import TruncMonth
from django_countries.serializer_fields import CountryField
import json

ip_address = 'http://localhost:8000'

class NotificationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notifications
        fields = ['id', 'title', 'datetime', 'read', 'extra', 'object_url']
        depth = 2

class ActualStateDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActualStateType
        fields = '__all__'
        depth = 2

class ActualStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActualStateType
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tasks
        fields = '__all__'
        depth = 2


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tasks
        fields = '__all__'
        depth = 1


class TaskProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesProject
        fields = ['sales_project_id', 'sales_project_name']
        depth = 1


class TaskCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerInformation
        fields = ['customer_id', 'customer_name']
        depth = 1


class TaskVendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorInformation
        fields = ['vendor_id', 'vendor_name']
        depth = 1


class TaskUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']
        depth = 1


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'

class CompetitorItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompetitorItem
        fields = '__all__'

class ItemDetailSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField(
        'get_custompermissions', read_only=True)
    competitors = CompetitorItemSerializer(many=True, read_only=True)

    def get_custompermissions(self, obj):
        permission_list = ['sales.change_item', 'sales.delete_item' ,'sales.add_competitoritem',
                            'sales.change_competitoritem','sales.recover_competitoritem' ,
                             'sales.delete_competitoritem']
        user_perms = User.get_all_permissions(self.context['request'].user)
        return {permission: True if permission in user_perms else False for permission in permission_list}

    class Meta:
        model = Item
        fields = '__all__'
        depth = 2

class SalesDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesDepartment
        fields = '__all__'


class CustomerPocSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomerPoc
        fields = '__all__'




class CustomerInformationSerializer(serializers.ModelSerializer):
    pocs = CustomerPocSerializer(many=True)

    class Meta:
        model = CustomerInformation
        fields = '__all__'

    def create(self, validated_data):
        pocs_data = validated_data.pop('pocs')
        user = self.context['request'].user
        validated_data['creator'] = UserProfile.objects.get(user=user)
        customer_information = CustomerInformation.objects.create(
            **validated_data)
        for poc_data in pocs_data:
            CustomerPoc.objects.create(
                **poc_data, customerInformation=customer_information)
        return customer_information

    '''def update(self, instance, validated_data):
        pocs_data = validated_data.pop('pocs')
        instance = super().update(instance, validated_data)
        pocs = (instance.pocs).all()
        pocs = list(pocs)
        if len(pocs_data) >= len(pocs):
            for i in range(len(pocs)):
                pocs[i].name = pocs_data[i].get('name', pocs[i].name)
                pocs[i].role = pocs_data[i].get('role', pocs[i].role)
                pocs[i].email = pocs_data[i].get('email', pocs[i].email)
                pocs[i].number = pocs_data[i].get('number', pocs[i].number)
                pocs[i].save()

            if len(pocs_data) > len(pocs):
                for i in range(len(pocs_data) - len(pocs)):
                    CustomerPoc.objects.create(
                        **pocs_data[i + len(pocs)], customerInformation=instance)

        if len(pocs_data) < len(pocs):
            for i in range(len(pocs_data)):
                pocs[i].name = pocs_data[i].get('name', pocs[i].name)
                pocs[i].role = pocs_data[i].get('role', pocs[i].role)
                pocs[i].email = pocs_data[i].get('email', pocs[i].email)
                pocs[i].number = pocs_data[i].get('number', pocs[i].number)
                pocs[i].save()
            for i in range(len(pocs) - len(pocs_data)):
                pocs[i + len(pocs_data)].delete()
        return instance'''


class VendorPocSerializer(serializers.ModelSerializer):

    class Meta:
        model = VendorPoc
        fields = '__all__'

class VendorPocDetailSerializer(serializers.ModelSerializer):
    history = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CustomerPoc
        fields = '__all__'

    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            final.append({'changes': [], 'datetime': h[i].history_date, 'user': user,
                          'profile_picture': profile_picture, 'model': 'POC', 'id': h[i].poc_id, })
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                old = change.old
                new = change.new
                final[-1]['changes'].append({'field': change.field,
                                             'old': str(old), 'new': str(new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'POC', 'id': creation.poc_id})
        return final


class VendorInformationListSerializer(serializers.ModelSerializer):
    country = CountryField(country_dict=True)

    class Meta:
        model = VendorInformation
        fields = '__all__'
        depth = 2


class VendorInformationSerializer(serializers.ModelSerializer):
    pocs = VendorPocSerializer(many=True)

    class Meta:
        model = VendorInformation
        fields = '__all__'

    def create(self, validated_data):
        pocs_data = validated_data.pop('pocs')
        user = self.context['request'].user
        validated_data['creator'] = UserProfile.objects.get(user=user)
        vendor_information = VendorInformation.objects.create(**validated_data)
        for poc_data in pocs_data:
            VendorPoc.objects.create(
                **poc_data, vendorInformation=vendor_information)
        return vendor_information


class UserSerializer(serializers.ModelSerializer):
    groups = GroupDto(many=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'date_joined', 'groups']
        depth = 1


class UserProfileImageOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['profile_picture']
        depth = 1


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=False)

    class Meta:
        model = UserProfile
        fields = '__all__'
        depth = 1


class UserProfileListSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=False)

    class Meta:
        model = UserProfile
        fields = ['id', 'contact_number', 'email', 'profile_picture', 'user']


class UserProfileProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        depth = 2


class LeadSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadSource
        fields = '__all__'


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'


class ProjectCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerInformation
        fields = '__all__'
        depth = 1


class SalesProjectSerializer(serializers.ModelSerializer):
    customerInformation = serializers.PrimaryKeyRelatedField(
        many=False, queryset=CustomerInformation.objects.all())
    userProfile = serializers.PrimaryKeyRelatedField(
        many=True, queryset=UserProfile.objects.all())

    class Meta:
        model = SalesProject
        exclude = ['version']


class RevenueForecastSerializer(serializers.ModelSerializer):
    history = serializers.SerializerMethodField()

    class Meta:
        model = RevenueForecast
        fields = '__all__'

    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            final.append({'changes': [], 'datetime': h[i].history_date, 'user': user,
                          'profile_picture': profile_picture, 'model': 'Revenue Forecast', 'id': h[i].forecast_id})
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                final[-1]['changes'].append({'field': change.field,
                                             'old': str(change.old), 'new': str(change.new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'Revenue Forecast', 'id': creation.forecast_id})
        return final


class SalesNotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesNotation
        fields = '__all__'


class SalesNotationProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesNotation
        fields = '__all__'
        depth = 2


class CustomerRequirementSerializer(serializers.ModelSerializer):
    history = serializers.SerializerMethodField()

    class Meta:
        model = CustomerRequirement
        fields = '__all__'

    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            final.append({'changes': [], 'datetime': h[i].history_date, 'user': user,
                          'profile_picture': profile_picture, 'model': 'Requirement', 'id': h[i].customer_requirement_id, })
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                final[-1]['changes'].append({'field': change.field,
                                             'old': str(change.old), 'new': str(change.new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'Requirement', 'id': creation.customer_requirement_id})
        return final


class BudgetBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetBlock
        fields = '__all__'

class BudgetBlockOptionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetBlock
        fields = '__all__'
        depth = 2

class BudgetBlockDetailSerializer(serializers.ModelSerializer):
    history = serializers.SerializerMethodField()
    is_at_last_stage = serializers.SerializerMethodField(
        'get_is_at_last_stage', read_only=True)
    permissions = serializers.SerializerMethodField(
        'get_custompermissions', read_only=True)
    workflow_id = serializers.SerializerMethodField('get_workflow_id')

    def get_is_at_last_stage(self, obj):
        return {'last_stage': obj.river.block_status.on_final_state}

    def get_workflow_id(self, obj):
        workflow = get_object_or_404(
            Workflow.objects.all(), field_name="block_status")
        return WorkflowDto(workflow).data

    def get_custompermissions(self, obj):
        permission_list = ['sales.change_budgetblock']
        user_perms = User.get_all_permissions(self.context['request'].user)
        return {permission: True if permission in user_perms else False for permission in permission_list}

    class Meta:
        model = BudgetBlock
        fields = '__all__'
        depth = 2

    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            final.append({'changes': [], 'datetime': h[i].history_date, 'user': user,
                          'profile_picture': profile_picture, 'model': 'Budget Block', 'id': h[i].block_id, })
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                final[-1]['changes'].append({'field': change.field,
                                             'old': str(change.old), 'new': str(change.new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'Budget Block', 'id': creation.block_id})
        return final

class VendorInformationDetailSerializer(serializers.ModelSerializer):
    blocks = BudgetBlockDetailSerializer(many=True, read_only=True)
    pocs = VendorPocDetailSerializer(many=True, read_only=True)
    workflow_id = serializers.SerializerMethodField('get_workflow_id')
    history = serializers.SerializerMethodField(read_only=True)
    country = CountryField(country_dict=True)
    is_at_last_stage = serializers.SerializerMethodField(
        'get_is_at_last_stage', read_only=True)
    permissions = serializers.SerializerMethodField(
        'get_custompermissions', read_only=True)

    def get_custompermissions(self, obj):
        permission_list = ['sales.change_vendorinformation','sales.add_vendorpoc','sales.change_vendorpoc', 'sales.add_tasks']
        user_perms = User.get_all_permissions(self.context['request'].user)
        return {permission: True if permission in user_perms else False for permission in permission_list}

    def get_is_at_last_stage(self, obj):
        return {'last_stage': obj.river.vendor_status.on_final_state}

    def get_workflow_id(self, project):
        workflow = get_object_or_404(
            Workflow.objects.all(), field_name="vendor_status")
        return WorkflowDto(workflow).data

    class Meta:
        model = VendorInformation
        fields = '__all__'
        depth = 2


    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            final.append({'changes': [], 'datetime': h[i].history_date, 'user': user,
                          'profile_picture': profile_picture, 'model': 'Vendor', 'id': h[i].vendor_id, })
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                old = change.old
                new = change.new
                final[-1]['changes'].append({'field': change.field,
                                             'old': str(old), 'new': str(new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'Vendor', 'id': creation.vendor_id})
        return final


class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = '__all__'


class QuotationItemProjectSerializer(serializers.ModelSerializer):
    history = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = QuotationItem
        fields = '__all__'
        depth = 2

    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            final.append({'changes': [], 'datetime': h[i].history_date, 'user': user,
                          'profile_picture': profile_picture, 'model': 'Quotation Item', 'id': h[i].quotation_item_id, 'quotation': h[i].quotation.quotation_id})
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                if change.field == 'item':
                    if change.old == None:
                        old = change.old
                    else:
                        old = Item.objects.get(item_id=change.old).item_code
                    if change.new == None:
                        new = change.new
                    else:
                        new = Item.objects.get(item_id=change.old).item_code
                else:
                    old = change.old
                    new = change.new
                final[-1]['changes'].append({'field': change.field,
                                             'old': str(old), 'new': str(new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'Quotation Item', 'id': creation.quotation_item_id, 'quotation': creation.quotation.quotation_id})
        return final


class QuotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quotation
        fields = '__all__'


class QuotationProjectSerializer(serializers.ModelSerializer):
    history = serializers.SerializerMethodField(read_only=True)
    items = QuotationItemProjectSerializer(many=True, read_only=True)
    is_at_last_stage = serializers.SerializerMethodField(
        'get_is_at_last_stage', read_only=True)
    permissions = serializers.SerializerMethodField(
        'get_custompermissions', read_only=True)
    workflow_id = serializers.SerializerMethodField('get_workflow_id')

    def get_is_at_last_stage(self, obj):
        return {'last_stage': obj.river.quotation_status.on_final_state}

    def get_workflow_id(self, obj):
        workflow = get_object_or_404(
            Workflow.objects.all(), field_name="quotation_status")
        return WorkflowDto(workflow).data

    def get_custompermissions(self, obj):
        permission_list = ['sales.change_quotation', 'sales.delete_quotation','sales.add_quotationitem'
                            ,'sales.change_quotationitem']
        user_perms = User.get_all_permissions(self.context['request'].user)
        return {permission: True if permission in user_perms else False for permission in permission_list}

    class Meta:
        model = Quotation
        fields = '__all__'
        depth = 1

    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            change = {'changes': [], 'datetime': h[i].history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'Quotation', 'id': h[i].quotation_id}
            if h[i].salesProject == None and h[i+1].salesProject != None:
                change['project'] = h[i+1].salesProject.sales_project_name
            elif h[i].salesProject != None:
                change['project'] = h[i].salesProject.sales_project_name
            else:
                change['project'] = ''
            final.append(change)
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                if change.field == 'customer':
                    if change.old == None:
                        old = change.old
                    else:
                        old = CustomerInformation.objects.get(
                            customer_id=change.old).customer_name
                    if change.new == None:
                        new = change.new
                    else:
                        new = CustomerInformation.objects.get(
                            customer_id=change.old).customer_name
                elif change.field == 'salesProject':
                    if change.old == None:
                        old = change.old
                    else:
                        old = SalesProject.objects.get(
                            sales_project_id=change.old).sales_project_name
                    if change.new == None:
                        new = change.new
                    else:
                        new = SalesProject.objects.get(
                            sales_project_id=change.new).sales_project_name
                else:
                    old = change.old
                    new = change.new

                final[-1]['changes'].append({'field': change.field,
                                             'old': str(old), 'new': str(new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'Quotation', 'id': creation.quotation_id})
        return final


class CustomerAuthororizedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id']
        depth = 1

class TicketCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'source', 'nature', 'priority', 'name', 'ticket_status']
        depth = 2

class CustomerPocDetailSerializer(serializers.ModelSerializer):
    tickets = TicketCustomerSerializer(many=True, read_only=True)
    history = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CustomerPoc
        fields = '__all__'

    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            final.append({'changes': [], 'datetime': h[i].history_date, 'user': user,
                          'profile_picture': profile_picture, 'model': 'POC', 'id': h[i].poc_id, })
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                old = change.old
                new = change.new
                final[-1]['changes'].append({'field': change.field,
                                             'old': str(old), 'new': str(new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'POC', 'id': creation.poc_id})
        return final



class CustomerInformationDetailSerializer(serializers.ModelSerializer):
    quotations = QuotationProjectSerializer(many=True, read_only=True)
    pocs = CustomerPocDetailSerializer(many=True)
    workflow_id = serializers.SerializerMethodField('get_workflow_id')
    actions = serializers.SerializerMethodField(read_only=True)
    projects = serializers.SerializerMethodField(read_only=True)
    authorized_users = serializers.SerializerMethodField(
        'get_users', read_only=True)
    permissions = serializers.SerializerMethodField(
        'get_custompermissions', read_only=True)
    history = serializers.SerializerMethodField(read_only=True)
    country = CountryField(country_dict=True)
    is_at_last_stage = serializers.SerializerMethodField(
        'get_is_at_last_stage', read_only=True)

    def get_is_at_last_stage(self, obj):
        return {'last_stage': obj.river.customer_status.on_final_state}

    def get_custompermissions(self, obj):
        permission_list = ['sales.change_customerinformation','sales.add_quotation','sales.change_quotation',
                            'sales.delete_quotation','sales.recover_quotation','sales.change_quotationitem',
                            'sales.add_quotationitem','sales.add_customerpoc','sales.change_customerpoc',
                            'sales.add_tasks']
        user_perms = User.get_all_permissions(self.context['request'].user)
        return {permission: True if permission in user_perms else False for permission in permission_list}

    def get_workflow_id(self, customer):
        workflow = get_object_or_404(
            Workflow.objects.all(), field_name="customer_status")
        return WorkflowDto(workflow).data

    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            final.append({'changes': [], 'datetime': h[i].history_date, 'user': user,
                          'profile_picture': profile_picture, 'model': 'Customer', 'id': h[i].customer_id, })
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                if change.field == 'source':
                    if change.old == None:
                        old = change.old
                    else:
                        old = LeadSource.objects.get(
                            source_id=change.old).source
                    if change.new == None:
                        new = change.new
                    else:
                        new = LeadSource.objects.get(
                            source_id=change.new).source
                else:
                    old = change.old
                    new = change.new
                final[-1]['changes'].append({'field': change.field,
                                             'old': str(old), 'new': str(new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'Customer', 'id': creation.customer_id})
        return final

    class Meta:
        model = CustomerInformation
        fields = '__all__'
        depth = 2

    def get_users(self, obj):
        targets = obj.salesDepartment.users.all()
        return CustomerAuthororizedUserSerializer(targets, many=True).data

    def get_projects(self, obj):
        qs = SalesProject.objects.filter(customerInformation=obj, userProfile__in=[UserProfile.objects.get(
            user=self.context['request'].user)]).order_by('sales_project_id').values('sales_project_id', 'sales_project_name')
        return qs

    def get_actions(self, obj):
        qs = SalesProjectM2M.objects.filter(
            Q(customer_added=obj) | Q(customer_removed=obj))
        qs = qs.annotate(direction=Case(When(customer_added__in=[obj], then=Value('add')), When(
            customer_removed__in=[obj], then=Value('remove')), output_field=CharField()))
        qs = qs.values('date', 'action', 'direction', sales_project_id=F(
            'project__sales_project_id'), sales_project_name=F('project__sales_project_name'))
        return qs


class CustomerInformationListSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField(
        'get_custompermissions', read_only=True)
    country = CountryField(country_dict=True)

    class Meta:
        model = CustomerInformation
        fields = ['customer_id', 'customer_name',
                  'telephone_number', 'country', 'address', 'customer_status', 'permissions']
        depth = 2

    def get_custompermissions(self, obj):
        permission_list = ['add_customerinformation']
        user_perms = User.get_all_permissions(self.context['request'].user)
        return {permission: True if permission in user_perms else False for permission in permission_list}


class TicketProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'source', 'nature', 'priority', 'name', 'ticket_status']
        depth = 2

class SalesProjectDetailSerializer(serializers.ModelSerializer):
    blocks = BudgetBlockDetailSerializer(many=True, read_only=True)
    notations = SalesNotationProjectSerializer(many=True, read_only=True)
    requirements = CustomerRequirementSerializer(many=True, read_only=True)
    quotations = QuotationProjectSerializer(many=True, read_only=True)
    history = serializers.SerializerMethodField(read_only=True)
    m2m = serializers.SerializerMethodField(read_only=True)
    workflow_id = serializers.SerializerMethodField(
        'get_workflow_id', read_only=True)
    permissions = serializers.SerializerMethodField(
        'get_custompermissions', read_only=True)
    is_at_last_stage = serializers.SerializerMethodField(
        'get_is_at_last_stage', read_only=True)
    unassigned_quotations = QuotationProjectSerializer(
        many=True, read_only=True)
    forecasts = RevenueForecastSerializer(many=True, read_only=True)
    tickets = TicketProjectSerializer(many=True, read_only=True)
    revenue = serializers.SerializerMethodField(read_only=True)

    def get_workflow_id(self, project):
        workflow = get_object_or_404(
            Workflow.objects.all(), field_name="project_status")
        return WorkflowDto(workflow).data

    def get_custompermissions(self, obj):
        permission_list = ['sales.can_change_project_customer', 'sales.can_change_project_user', 'sales.change_customerrequirement', 'sales.add_customerrequirement',
                           'sales.change_quotation', 'sales.add_quotation', 'sales.delete_quotation',
                           'sales.add_salesnotation', 'sales.change_salesnotation',
                           'sales.add_budgetblock', 'sales.change_budgetblock', 'sales.change_salesproject',
                           'sales.recover_salesnotation', 'sales.delete_salesnotation', 'sales.delete_budgetblock',
                           'sales.add_tasks','sales.add_quotationitem','sales.change_quotationitem','sales.recover_customerrequirement',
                           'sales.delete_customerrequirement','sales.add_revenueforecast','sales.change_revenueforecast',
                           'sales.delete_revenueforecast','sales.recover_revenueforecast']
                           
        user_perms = User.get_all_permissions(self.context['request'].user)
        return {permission: True if permission in user_perms else False for permission in permission_list}

    def get_is_at_last_stage(self, obj):
        obj.river.project_status.on_final_state
        return {'last_stage': obj.river.project_status.on_final_state}

    class Meta:
        model = SalesProject
        fields = '__all__'
        depth = 2

    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            final.append({'changes': [], 'datetime': h[i].history_date, 'user': user,
                          'profile_picture': profile_picture, 'model': 'Sales Project', 'id': h[i].sales_project_id, })
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                if change.field == 'customerInformation':
                    if change.old == None:
                        old = change.old
                    else:
                        old = CustomerInformation.objects.get(
                            customer_id=change.old).customer_name
                    if change.new == None:
                        new = change.new
                    else:
                        new = CustomerInformation.objects.get(
                            customer_id=change.old).customer_name
                else:
                    old = change.old
                    new = change.new
                final[-1]['changes'].append({'field': change.field,
                                             'old': str(old), 'new': str(new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date, 'user': user,
                      'profile_picture': profile_picture, 'model': 'Sales Project', 'id': creation.sales_project_id})
        return final

    def get_m2m(self, obj):
        final = []
        m2m = SalesProjectM2M.objects.filter(project=obj, action='update')
        for m in m2m:
            profile_picture = ip_address + \
                str(m.user.profile_picture.url) if m.user.profile_picture else None
            final.append({'customer_added': m.customer_added.all().values_list('customer_name', flat=True), 'customer_removed': m.customer_removed.all().values_list('customer_name', flat=True),
                          'user_added': m.user_added.all().values_list('user__username', flat=True), 'user_removed': m.user_removed.all().values_list('user__username', flat=True),
                          'user': m.user.user.username, 'profile_picture': profile_picture, 'datetime': m.date, 'm2m': True})
        return final

    def get_revenue(self, obj):
        final = {}
        qs = RevenueForecast.objects.filter(project=obj).annotate(date=TruncMonth('month'))
        qs = qs.annotate(rev=ExpressionWrapper(F('quantity') * (F('sell_price')), output_field=FloatField())).values('date')
        qs = qs.annotate(rev_sum=Sum('rev'))
        final['forecast'] = qs
        qs = QuotationItem.objects.filter(quotation__salesProject=obj).annotate(date=TruncMonth('quotation__due_date'))
        qs = qs.annotate(rev=ExpressionWrapper(F('quantity') * (F('unit_price')), output_field=FloatField())).values('date')
        qs = qs.annotate(rev_sum=Sum('rev'))
        final['revenue'] = qs   
        return final


class SalesProjectListSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField(
        'get_custompermissions', read_only=True)

    class Meta:
        model = SalesProject
        fields = ['sales_project_id', 'sales_project_name',
                  'sales_project_est_rev', 'project_status', 'permissions', 'customerInformation']
        depth = 2

    def get_custompermissions(self, obj):
        permission_list = ['add_salesproject']
        user_perms = User.get_all_permissions(self.context['request'].user)
        return {permission: True if permission in user_perms else False for permission in permission_list}

class LayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['project_layout', 'customer_layout', 'vendor_layout', 'project_toolbox', 'customer_toolbox', 'vendor_toolbox']

# Below is the serializers for serializing Tickets.


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'source', 'nature', 'priority', 'title', 'ticket_status', 'assigned_to']
        depth = 2


class TicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['nature', 'priority', 'title', 'ticket_status']
        depth = 2


class TicketcustomerInformation(serializers.ModelSerializer):
    class Meta:
        model = CustomerInformation
        fields = ['customer_id', 'customer_name', 'telephone_number',
                  'country', 'customer_status']
        depth = 2


class TicketcustomerPoc(serializers.ModelSerializer):
    class Meta:
        model = CustomerPoc
        fields = ['poc_id', 'name']
        depth = 1


class TicketSalesProject(serializers.ModelSerializer):
    class Meta:
        model = SalesProject
        fields = ['sales_project_id', 'sales_project_name',
                  'project_status', 'userProfile']
        depth = 2


class TicketDetailSerializer(serializers.ModelSerializer):
    salesProject = TicketSalesProject(many=False)
    customerInformation = serializers.SerializerMethodField(
        'get_customer_infomation')
    history = serializers.SerializerMethodField(read_only=True)
    permissions = serializers.SerializerMethodField('get_custompermissions',read_only=True)
    class Meta:
        model = Ticket
        fields = ['id', 'source', 'phone', 'nature', 'priority', 'title', 'content', 'ticket_status',
                  'customerPoc', 'salesProject', 'customerInformation', 'name', 'email', 'history', 'permissions', 'assigned_to']
        depth = 2

    def assigned_email(self, ticket):
        assignedemail = json.loads(ticket.assignedEmail.content)
        return assignedemail

    def get_custompermissions(self, obj):
        permission_list = ['sales.add_salesproject', 'sales.add_customerinformation', 'sales.change_ticket',
                           'sales.can_assign_ticket_project', 'sales.can_assign_ticket_customer', 'sales.can_change_ticket_customer',
                           'sales.can_change_ticket_project'
                           ]
        user_perms = User.get_all_permissions(self.context['request'].user)
        return {permission: True if permission in user_perms else False for permission in permission_list}

    def get_customer_infomation(self, ticket):
        if ticket.customerPoc:
            customer_infomation = CustomerInformation.objects.get(
                pocs=ticket.customerPoc)
            return TicketcustomerInformation(customer_infomation).data
        else:
            return None

    def get_history(self, obj):
        final = []
        h = obj.history.all()
        for i in range(len(h)-1):
            user_profile = UserProfile.objects.get(
                user__id=h[i].history_user_id)
            user = user_profile.user.username
            profile_picture = ip_address + \
                str(user_profile.profile_picture.url) if user_profile.profile_picture else None
            final.append({'changes': [], 'datetime': h[i].history_date,
                          'user': user, 'profile_picture': profile_picture})
            delta = h[i].diff_against(h[i+1])
            for change in delta.changes:
                if change.field == 'customerPoc':
                    if change.old == None:
                        old = change.old
                    else:
                        old = CustomerPoc.objects.get(poc_id=change.old).name
                    if change.new == None:
                        new = change.new
                    else:
                        new = CustomerPoc.objects.get(poc_id=change.new).name
                elif change.field == 'salesProject':
                    if change.old == None:
                        old = change.old
                    else:
                        old = SalesProject.objects.get(
                            sales_project_id=change.old).sales_project_name
                    if change.new == None:
                        new = change.new
                    else:
                        new = SalesProject.objects.get(
                            sales_project_id=change.new).sales_project_name
                else:
                    old = change.old
                    new = change.new
                final[-1]['changes'].append({'field': change.field,
                                             'old': str(old), 'new': str(new)})
            if final[-1]['changes'] == []:
                final.pop()
        creation = h.earliest()
        user_profile = UserProfile.objects.get(
            user__id=creation.history_user_id)
        user = user_profile.user.username
        profile_picture = ip_address + \
            str(user_profile.profile_picture.url) if user_profile.profile_picture else None
        final.append({'changes': [], 'datetime': creation.history_date,
                      'user': user, 'profile_picture': profile_picture})
        return final


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'source', 'nature', 'priority', 'title',
                  'content', 'ticket_status', 'name', 'email', 'customerPoc', 'assigned_to']


class TaggedMailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaggedMail
        fields = '__all__'

class AssignedEmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignedEmail
        fields = '__all__'

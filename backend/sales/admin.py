from django.contrib import admin
from .models import *
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from simple_history.admin import SimpleHistoryAdmin
from .forms import UserProfileForm
from django.contrib.auth.admin import UserAdmin , GroupAdmin
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import Group

admin.site.register(CustomerPoc)
admin.site.register(VendorPoc)
admin.site.register(SalesDepartment)
admin.site.register(SalesCompany)
admin.site.register(SalesAccount)
admin.site.register(CustomerRequirement)
admin.site.register(Quotation)
admin.site.register(SalesNotation)
admin.site.register(Notifications)
admin.site.register(Ticket)
admin.site.register(AssignedEmail)
admin.site.register(VendorInformation)
admin.site.register(Country)
admin.site.register(LeadSource)
admin.site.register(ProjectUser)
admin.site.register(KPI)
admin.site.register(ActualStateType)
admin.site.register(Tasks)
admin.site.register(Item)
admin.site.register(CompetitorItem)
admin.site.register(QuotationItem)
admin.site.register(RevenueForecast)
admin.site.register(UserProfile)
admin.site.register(BudgetBlock)
admin.site.register(Company)

class CustomerResource(resources.ModelResource):
    class Meta:
        model = CustomerInformation


class CustomerAdmin(ImportExportModelAdmin, SimpleHistoryAdmin):
    resource_class = CustomerResource
    view_on_site = False


admin.site.register(CustomerInformation, CustomerAdmin)


class ProjectResource(resources.ModelResource):
    class Meta:
        model = SalesProject


class SalesProjectAdmin(ImportExportModelAdmin, SimpleHistoryAdmin):
    resource_class = ProjectResource
    view_on_site = False


admin.site.register(SalesProject, SalesProjectAdmin)


class ProfileInline(admin.StackedInline):
    model = UserProfile
    form = UserProfileForm
    can_delete = False
    verbose_name_plural = 'User Profile'
    fk_name = 'user'


class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline, )

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)


class CustomGroupAdmin(GroupAdmin):
    def formfield_for_manytomany(self, db_field, request=None, **kwargs):
        if db_field.name == 'permissions':
            qs = kwargs.get('queryset', db_field.remote_field.model.objects)
            qs = qs.exclude(content_type__model__in=['historicalcustomerinformation',
            'historicalcustomerrequirement',
            'historicalprojectitem',
            'historicalprojectuser',
            'historicalquotation',
            'historicalrevenueforecast',
            'historicalsalesproject',
            'historicalticket',
            'historicalvendorinformation',
            'historicalquotationitem',
            'notifications',
            'salesaccount',
            'salesdepartment',
            'projectuser',
            'salescompany',
            'actualstatetype',
            'salesprojectm2m',
            'historicaluserprofile']).exclude(content_type__app_label__in=[
            'django_celery_beat',
            'rest_framework_api_key',
            'token_blacklist',
            'sites',
            'admin',
            'sessions',
            'contenttypes',
            'django_admin_settings',
            'auth']).exclude(codename__in=(
                'add_userprofile',
                'change_userprofile',
                'delete_userprofile',
                'view_customerrequirement',
                'view_customerinformation',
                'view_projectitem',
                'view_ticket',
                'view_revenueforecast',
                'view_vendorinformation',
                'view_quotation',
                'view_quotationitem',
                'view_tasks',
                'view_salesproject',
                'view_userprofile',
                'view_function',
                'view_onapprovedhook',
                'view_oncompletehook',
                'view_ontransithook',
                'view_state',
                'view_transition',
                'view_transitionapproval',
                'view_transitionmeta',
                'view_workflow',
                'view_competitoritem',
                'view_customerinformation',
                'view_customerpoc',
                'view_item',
                'view_kpi',
                'view_leadsource',
                'view_mail_ticket',
                'view_vendorpoc',
                'view_transitionapprovalmeta',
            ))
            # Avoid a major performance hit resolving permission names which
            # triggers a content_type load:
            kwargs['queryset'] = qs.select_related('content_type')
        return super(GroupAdmin, self).formfield_for_manytomany(
            db_field, request=request, **kwargs)



admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
admin.site.unregister(Group)
admin.site.register(Group, CustomGroupAdmin)

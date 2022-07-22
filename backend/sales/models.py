from django.db import models
from django.contrib.auth.models import User
from concurrency.fields import IntegerVersionField
from django.urls import reverse
from djmoney.models.fields import MoneyField
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField
from river.models.fields.state import StateField
from simple_history.models import HistoricalRecords
from djmoney.models.fields import MoneyField
from django.db.models.signals import pre_save
from django.forms.models import model_to_dict
from river.models import State
from django.core.exceptions import ValidationError
from django_countries.fields import CountryField
from tenant_schemas.models import TenantMixin



class ActualStateType(models.Model):
    types = (
        ('Created', 'Created'),
        ('Converted', 'Converted'),
        ('Deactivated', 'Deactivated'),
        ('In Production', 'In Production'),
        ('Completed', 'Completed'),
        ('Approved', 'Approved'),
    )

    workflow_types = (
        ('Project', 'Project'),
        ('Customer', 'Customer'),
        ('Vendor', 'Vendor'),
        ('Quotation', 'Quotation'),
        ('Ticket', 'Ticket'),
        ('Block', 'Block'),
    )
    state_type = models.CharField(max_length=100, choices=types, default='Start')
    state = models.OneToOneField('State', on_delete=models.CASCADE, related_name='actualstate')
    workflow_type = models.CharField(max_length=100, choices=workflow_types, default='Project')

    def __str__(self):
        return str(self.state) + ' [ Type : ' + str(self.state_type) + ' ] '

    class Meta:
        verbose_name = 'Actual State type'
        app_label = 'river'

class Company(TenantMixin):	    
    REQUIRED_FIELDS = ('name', 'schema_name')	    
    name = models.CharField(max_length=100, unique=True, null=False, blank=False)	       
    paid_until = models.DateField(null=True, blank=True)	    
    on_trial = models.BooleanField(null=True, blank=True)	    
    created_on = models.DateField(auto_now_add=True)	    
    domain_url = models.URLField(blank=True, null=True)

    auto_drop_schema = True
    auto_create_schema = True


class UserProfile(models.Model):

    email_services = (
        ('outlook', 'Outlook'),
        ('gmail', 'Gmail'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department = models.ManyToManyField(
        'SalesDepartment', related_name='users', blank=True)
    salesAccount = models.ForeignKey(
        'SalesAccount', on_delete=models.CASCADE, max_length=100, blank=True, null=True)
    contact_number = PhoneNumberField(blank=True)
    email = models.EmailField(max_length=255)
    email_password = models.CharField(max_length=255)
    email_service = models.CharField(
        max_length=255, choices=email_services, blank=True, null=True)
    history = HistoricalRecords()
    profile_picture = models.ImageField(
        upload_to='profile/', null=True, blank=True)

    project_created = models.BooleanField(default=False)
    project_updated = models.BooleanField(default=False)
    project_approvals = models.BooleanField(default=False)

    requirements_created = models.BooleanField(default=False)
    requirements_updated = models.BooleanField(default=False)
    requirements_deleted = models.BooleanField(default=False)

    quotations_created = models.BooleanField(default=False)
    quotations_updated = models.BooleanField(default=False)
    quotations_deleted = models.BooleanField(default=False)

    notations_created = models.BooleanField(default=False)
    notations_updated = models.BooleanField(default=False)
    notations_deleted = models.BooleanField(default=False)

    ticket_created = models.BooleanField(default=False)
    ticket_updated = models.BooleanField(default=False)
    ticket_approved = models.BooleanField(default=False)

    customer_created = models.BooleanField(default=False)
    customer_updated = models.BooleanField(default=False)
    customer_approved = models.BooleanField(default=False)

    vendor_created = models.BooleanField(default=False)
    vendor_updated = models.BooleanField(default=False)
    vendor_approved = models.BooleanField(default=False)

    approval_created = models.BooleanField(default=False)
    approval_deleted = models.BooleanField(default=False)
    approval_reordered = models.BooleanField(default=False)

    transition_created = models.BooleanField(default=False)
    transition_deleted = models.BooleanField(default=False)

    automation_created = models.BooleanField(default=False)
    automation_deleted = models.BooleanField(default=False)

    project_layout = models.TextField(max_length=5000, null=True, blank=True)
    customer_layout = models.TextField(max_length=5000, null=True, blank=True)
    vendor_layout = models.TextField(max_length=5000, null=True, blank=True)
    
    project_toolbox = models.TextField(max_length=5000, null=True, blank=True)
    customer_toolbox = models.TextField(max_length=5000, null=True, blank=True)
    vendor_toolbox = models.TextField(max_length=5000, null=True, blank=True)

    def __str__(self):
        return str(self.user.username)

    class Meta:
        permissions = (
            ("tier_3_oversight", "Tier 3 Oversight"),
            ("tier_2_oversight", "Tier 2 Oversight"),
            ("tier_1_oversight", "Tier 1 Oversight"),
        )


class SalesAccount(models.Model):
    account_id = models.AutoField(primary_key=True)
    sap_account_id = models.CharField(max_length=100, blank=True, null=True)


class SalesDepartment(models.Model):
    department_id = models.AutoField(primary_key=True)
    department_name = models.CharField(max_length=100)
    sap_company_id = models.CharField(max_length=200)
    salesCompany = models.ForeignKey(
        'SalesCompany', related_name='departments', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.department_name


class SalesCompany(models.Model):
    company_id = models.AutoField(primary_key=True)
    company_name = models.CharField(max_length=500)


class CustomerInformation(models.Model):
    status = (
        ('lead', 'Lead'),
        ('client', 'Client'),
    )
    customer_status = StateField(editable=False)
    customer_id = models.AutoField(primary_key=True)
    customer_name = models.CharField(max_length=100)
    telephone_number = PhoneNumberField(blank=True)
    fax_number = PhoneNumberField(blank=True)
    country = CountryField()
    address = models.TextField(max_length=1000, null=True, blank=True)
    sap_code = models.CharField(max_length=100, null=True, blank=True)
    salesDepartment = models.ForeignKey(
        SalesDepartment, blank=True, null=True, on_delete=models.CASCADE)
    history = HistoricalRecords(excluded_fields=['customer_status'])
    status = models.CharField(max_length=100, choices=status, default='lead')
    conversion_date = models.DateField(null=True, blank=True)
    source = models.ForeignKey(
        'LeadSource', related_name='customers', on_delete=models.CASCADE, null=True, blank=True)
    creator = models.ForeignKey(
        'UserProfile', related_name='customers', on_delete=models.CASCADE, null=True, blank=True)
    created_date = models.DateField(default=timezone.localdate)

    def get_absolute_url(self):
        return reverse('customer-profile', kwargs={'pk': self.customer_id})

    def __str__(self):
        return self.customer_name

    def save(self, *args, **kwargs):
        if self.customer_id:
            if self.status != CustomerInformation.objects.get(customer_id=self.customer_id).status and self.status == 'client':
                self.conversion_date = timezone.now()
            elif self.status != CustomerInformation.objects.get(customer_id=self.customer_id).status and self.status == 'lead':
                self.conversion_date = None
        super(CustomerInformation, self).save(*args, **kwargs)


class CustomerPoc(models.Model):

    poc_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    customerInformation = models.ForeignKey(
        'CustomerInformation', related_name='pocs', on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField(max_length=255 , null=True , blank=True)
    number = models.CharField(max_length=100, null=True, blank=True)
    history = HistoricalRecords()


class Country(models.Model):
    country_id = models.AutoField(primary_key=True)
    country = models.CharField(max_length=500)

    def __str__(self):
        return self.country


class LeadSource(models.Model):
    source_id = models.AutoField(primary_key=True)
    source = models.CharField(max_length=500)

    def __str__(self):
        return self.source


class KPI(models.Model):
    metric = (
        ('month', 'Month'),
        ('quarter', 'Quarter'),
        ('year', 'Year')
    )

    group = (
        ('department', 'Department'),
        ('individual', 'Individual'),
    )
    kpi_id = models.AutoField(primary_key=True)
    group = models.CharField(
        max_length=20, choices=group, null=True, blank=True)
    lead_kpi = models.IntegerField(blank=True, null=True)
    rate_kpi = models.FloatField(blank=True, null=True)
    rev_kpi = models.FloatField(blank=True, null=True)
    department = models.ForeignKey(
        'SalesDepartment', related_name='lead_kpis', on_delete=models.CASCADE, null=True, blank=True)
    creator = models.ForeignKey(
        'UserProfile', related_name='lead_kpis', on_delete=models.CASCADE, null=True, blank=True)
    metric = models.CharField(
        max_length=20, choices=metric, null=True, blank=True)
    period = models.DateField(null=True, blank=True)


class VendorInformation(models.Model):
    priority = (
        ('r', 'No Restrictions'),
        ('d', 'Only Department'),
        ('i', 'Only Individual'),
    )
    vendor_status = StateField(editable=False)
    vendor_id = models.AutoField(primary_key=True)
    vendor_name = models.CharField(max_length=100)
    telephone_number = PhoneNumberField(blank=True)
    fax_number = PhoneNumberField(blank=True)
    country = CountryField()
    address = models.TextField(max_length=1000, null=True, blank=True)
    sap_code = models.CharField(max_length=100, null=True, blank=True)
    justification = models.CharField(max_length=100, null=True, blank=True)
    control = models.CharField(max_length=100, choices=priority, default='r')
    creator = models.ForeignKey(
        'UserProfile', related_name='vendors', on_delete=models.CASCADE, null=True, blank=True)
    salesDepartment = models.ForeignKey(
        SalesDepartment, blank=True, null=True, on_delete=models.CASCADE)
    history = HistoricalRecords(excluded_fields=['vendor_status'])

    def __str__(self):
        return self.vendor_name

class VendorPoc(models.Model):
    roles = (
        ('md', 'Mananging Director'),
        ('p', 'Purchaser'),
        ('f', 'Finance'),
    )

    poc_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    vendorInformation = models.ForeignKey(
        'VendorInformation', related_name='pocs', on_delete=models.CASCADE, null=True, blank=True)
    role = models.CharField(
        max_length=20, choices=roles, null=True, blank=True)
    email = models.EmailField(max_length=255 , null=True , blank=True)
    number = models.CharField(max_length=100, null=True, blank=True)
    history = HistoricalRecords()


class SalesProject(models.Model):
    sales_status = (
        ('p1', 'Enquiry'),
        ('p2', 'Sourcing'),
        ('p3', 'Negotiation'),
        ('p4', 'Completion'),
    )

    status = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('inactive', 'Inactive'),
        ('reactivated', 'Reactivated'),
    )
    version = IntegerVersionField()
    sales_project_id = models.AutoField(primary_key=True)
    sales_project_name = models.CharField(max_length=100)
    sales_project_est_rev = MoneyField(max_digits=10, decimal_places=2, default_currency='SGD')
    userProfile = models.ManyToManyField(
        'UserProfile', through='ProjectUser', blank=True,  related_name="team")
    customerInformation = models.ForeignKey(
        'CustomerInformation', on_delete=models.CASCADE)
    creation_date = models.DateField(default=timezone.localdate)
    sales_project_last_date = models.DateTimeField(null=True, blank=True)
    sales_department = models.ForeignKey(
        'SalesDepartment', on_delete=models.CASCADE)
    project_status = StateField(editable=False)
    history = HistoricalRecords(excluded_fields=['version', 'project_status'])
    completed_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.sales_project_name

    class Meta:
        permissions = (
            ("can_change_project_customer", "Can Change Customer"),
            ("can_change_project_user", "Can Change User"),
        )


class RevenueForecast(models.Model):
    status = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    forecast_id = models.AutoField(primary_key=True)
    quantity = models.IntegerField()
    block = models.ForeignKey('BudgetBlock', related_name='forecasts', on_delete=models.CASCADE, null=True, blank=True)
    buy_price = MoneyField(max_digits=10, decimal_places=2, default_currency='SGD')
    sell_price = MoneyField(max_digits=10, decimal_places=2, default_currency='SGD')
    month = models.DateField(null=True, blank=True)
    project = models.ForeignKey('SalesProject', related_name='forecasts', on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=status, default='active')
    history = HistoricalRecords()
    
    class Meta:
        permissions = (
            ("recover_revenueforecast", "Can Recover Revenue Forecast"),
        )

class SalesProjectM2M(models.Model):

    actions = (
        ('create', 'Create'),
        ('update', 'Update')
    )

    user_added = models.ManyToManyField(
        'UserProfile', blank=True, related_name='user_added')
    customer_added = models.ManyToManyField(
        'CustomerInformation', blank=True, related_name='customer_added')
    user_removed = models.ManyToManyField(
        'UserProfile', blank=True, related_name='user_removed')
    customer_removed = models.ManyToManyField(
        'CustomerInformation', blank=True, related_name='customer_removed')
    user = models.ForeignKey('UserProfile', null=True, blank=True,
                             on_delete=models.SET_NULL, related_name='user_action')
    project = models.ForeignKey(
        'SalesProject', null=True, blank=True, on_delete=models.SET_NULL)
    date = models.DateTimeField(auto_now=True)
    action = models.CharField(max_length=50, choices=actions)


class ProjectUser(models.Model):
    project = models.ForeignKey(
        'SalesProject', on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(
        'UserProfile', on_delete=models.SET_NULL, null=True)
    history = HistoricalRecords()


class CustomerRequirement(models.Model):
    status = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    customer_requirement_id = models.AutoField(primary_key=True)
    sales_project = models.ForeignKey(
        'SalesProject', related_name='requirements', on_delete=models.CASCADE)
    requirements = models.TextField(max_length=60000)
    history = HistoricalRecords(excluded_fields=['date_deleted'])
    file = models.FileField(upload_to='requirements/', null=True, blank=True)
    status = models.CharField(max_length=50, choices=status, default='active')
    date_deleted = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return str(self.customer_requirement_id)

    def save(self, *args, **kwargs):
        if self.customer_requirement_id:
            if self.status != CustomerRequirement.objects.get(customer_requirement_id=self.customer_requirement_id).status and self.status == 'inactive':
                self.date_deleted = timezone.now()
            elif self.status != CustomerRequirement.objects.get(customer_requirement_id=self.customer_requirement_id).status and self.status == 'active':
                self.date_deleted = None
        super(CustomerRequirement, self).save(*args, **kwargs)

    class Meta:
        permissions = (
            ("recover_customerrequirement", "Can Recover Customer Requirement"),
        )


class SalesNotation(models.Model):
    status = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    notation_id = models.AutoField(primary_key=True)
    sales_project = models.ForeignKey(
        'SalesProject', related_name='notations', on_delete=models.CASCADE)
    userProfile = models.ForeignKey('UserProfile', on_delete=models.CASCADE)
    sales_notes = models.TextField(max_length=200)
    time = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50, choices=status, default='active')
    date_deleted = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return str(self.notation_id)

    def save(self, *args, **kwargs):
        if self.notation_id:
            if self.status != SalesNotation.objects.get(notation_id=self.notation_id).status and self.status == 'inactive':
                self.date_deleted = timezone.now()
            elif self.status != SalesNotation.objects.get(notation_id=self.notation_id).status and self.status == 'active':
                self.date_deleted = None
        super(SalesNotation, self).save(*args, **kwargs)
    class Meta:
        permissions = (
            ("recover_salesnotation", "Can Recover Sales Notation"),
        )

class Item(models.Model):
    status = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    item_id = models.AutoField(primary_key=True)
    item_code = models.CharField(max_length=500, null=True, blank=True)
    item_description = models.TextField(max_length=1000, null=True, blank=True)
    dimensions = models.CharField(max_length=200, null=True, blank=True)
    gross_weight = models.CharField(max_length=200, null=True, blank=True)
    net_weight = models.CharField(max_length=200, null=True, blank=True)
    base_unit = models.CharField(max_length=500, null=True, blank=True)
    base_price = MoneyField(
        max_digits=10, decimal_places=2, null=True, blank=True, default_currency='SGD')
    status = models.CharField(max_length=50, choices=status, default='active')

    class Meta:
        permissions = (
            ("recover_item", "Can Recover Item"),
        )

class CompetitorItem(models.Model):
    status = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    competitor_id = models.AutoField(primary_key=True)
    item = models.ForeignKey('Item', on_delete=models.CASCADE, related_name='competitors', null=True, blank=True)
    competitor_name = models.CharField(max_length=500, null=True, blank=True)
    item_code = models.CharField(max_length=500, null=True, blank=True)
    item_description = models.TextField(max_length=1000, null=True, blank=True)
    dimensions = models.CharField(max_length=200, null=True, blank=True)
    gross_weight = models.CharField(max_length=200, null=True, blank=True)
    net_weight = models.CharField(max_length=200, null=True, blank=True)
    base_unit = models.CharField(max_length=500, null=True, blank=True)
    base_price = MoneyField(
        max_digits=10, decimal_places=2, null=True, blank=True, default_currency='SGD')
    status = models.CharField(max_length=50, choices=status, default='active')
    class Meta:
        permissions = (
            ("recover_competitoritem", "Can Recover Competitor Item"),
        )

class BudgetBlock(models.Model):
    status = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )
    creator = models.ForeignKey(User,on_delete=models.CASCADE)
    block_id = models.AutoField(primary_key=True)
    start_date = models.DateField()
    end_date = models.DateField()
    project = models.ForeignKey('SalesProject', related_name='blocks', on_delete=models.CASCADE, null=True, blank=True)
    item = models.ForeignKey('Item', on_delete=models.CASCADE)
    vendor = models.ForeignKey('VendorInformation', related_name='blocks', on_delete=models.CASCADE)
    buy_price = MoneyField(max_digits=10, decimal_places=2, default_currency='SGD')
    sell_price = MoneyField(max_digits=10, decimal_places=2, default_currency='SGD')
    history = HistoricalRecords(excluded_fields=['block_status'])
    block_status= StateField()
    status = models.CharField(max_length=50, choices=status, default='active')

class Quotation(models.Model):
    status = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    quotation_status = StateField(editable=False)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    version = IntegerVersionField()
    quotation_id = models.AutoField(primary_key=True)
    salesProject = models.ForeignKey(
        'SalesProject', related_name='quotations', on_delete=models.CASCADE, null=True, blank=True)
    document_date = models.DateField()
    tax_date = models.DateField()
    due_date = models.DateField()
    file = models.FileField(upload_to='quotation/', null=True, blank=True)
    customer = models.ForeignKey(
        'CustomerInformation', on_delete=models.SET_NULL, related_name='quotations', null=True, blank=True)
    history = HistoricalRecords(
        excluded_fields=['version', 'date_deleted', 'quotation_status'])
    status = models.CharField(max_length=50, choices=status, default='active')
    date_deleted = models.DateTimeField(null=True, blank=True)
    unassigned_project = models.ManyToManyField('SalesProject', related_name='unassigned_quotations', blank=True)
    remarks = models.TextField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return str(self.quotation_id)

    def save(self, *args, **kwargs):
        if self.quotation_id:
            if self.status != Quotation.objects.get(quotation_id=self.quotation_id).status and self.status == 'inactive':
                self.date_deleted = timezone.now()
            elif self.status != Quotation.objects.get(quotation_id=self.quotation_id).status and self.status == 'active':
                self.date_deleted = None
        super(Quotation, self).save(*args, **kwargs)

    class Meta:
        permissions = (
            ("recover_quotation", "Can recover quotation"),
        )


class QuotationItem(models.Model):
    quotation_item_id = models.AutoField(primary_key=True)
    quantity = models.IntegerField()
    unit_price = models.FloatField()
    moq = models.IntegerField(default = 0)
    mdq = models.IntegerField(default = 0)
    remarks = models.TextField(max_length=1000)
    block = models.ForeignKey('BudgetBlock', on_delete=models.CASCADE , related_name='quotationitems')
    quotation = models.ForeignKey('Quotation', on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    history = HistoricalRecords()


class Notifications(models.Model):
    action_type = (
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
        ('approved', 'Approved'),
        ('reordered', 'Reordered'),
    )
    datetime = models.DateTimeField(auto_now=True)
    target = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, default='no title available...')
    extra = models.CharField(max_length=100)
    read = models.BooleanField(default=False)
    object_url = models.CharField(max_length=500, default='test')
    action = models.CharField(max_length=50, choices=action_type)

class Ticket(models.Model):
    nature_type = (
        ('complain', 'Complain'),
        ('enquiry', 'Enquiry'),
    )
    priority_type = (
        ('important', 'Important'),
        ('medium', 'Medium'),
        ('normal', 'Normal'),
    )
    source_type = (
        ('email', 'Email'),
        ('website', 'Website'),
        ('phone_call', 'Phone call'),
        ('others', 'Others'),
    )
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255 , null=True , blank=True)
    phone = PhoneNumberField(null=True, blank=True)
    source = models.CharField(max_length=50, choices=source_type)
    nature = models.CharField(max_length=50, choices=nature_type)
    priority = models.CharField(max_length=50, choices=priority_type)
    ticket_status = StateField(editable=False)
    history = HistoricalRecords(excluded_fields=['ticket_status'])
    title = models.CharField(max_length=255)
    content = models.TextField()
    customerPoc = models.ForeignKey(
        'CustomerPoc', null=True, blank=True, related_name='tickets', on_delete=models.CASCADE)
    salesProject = models.ForeignKey(
        'SalesProject', null=True, blank=True, related_name='tickets', on_delete=models.CASCADE)
    date_created = models.DateField(default=timezone.localdate)

    class Meta:
        permissions = (
            ("can_change_ticket_project", "Can change assigned projects"),
            ("can_change_ticket_customer", "Can change assigned customers"),
            ("can_assign_ticket_project", "Can assign projects"),
            ("can_assign_ticket_customer", "Can assign customers"),
        )

# should have a foreign key containing ticket id to query


class mail_ticket(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    ticket = models.ForeignKey(
        'Ticket', null=True, blank=True, on_delete=models.CASCADE)


class TaggedMail(models.Model):
    mailid = models.CharField(max_length=1000, primary_key=True)
    body = models.TextField()
    date = models.CharField(max_length=1000)
    subject = models.TextField()
    email = models.TextField()
    tagged_project = models.ForeignKey(
        SalesProject, on_delete=models.CASCADE, default=None)


class Tasks(models.Model):
    priority_choice = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('urgent', 'Urgent'),
        ('expedite', 'Expedite'),
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    priority = models.CharField(max_length=50, choices=priority_choice)
    start = models.DateTimeField()
    end = models.DateTimeField()
    all_day = models.BooleanField(default=False)
    customerInformation = models.ManyToManyField(
        'CustomerInformation')
    vendorInformation = models.ManyToManyField(
        'VendorInformation')
    salesProject = models.ManyToManyField(
        'SalesProject')
    user = models.ManyToManyField(User)

class AssignedEmail(models.Model):
    emailId = models.CharField(max_length=255, primary_key=True)
    content = models.TextField()
    ticket = models.ForeignKey(
        'Ticket', null=True, blank=True, on_delete=models.CASCADE
    )
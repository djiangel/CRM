from sales.models import *
from django.db import connection
from django.contrib.auth.models import Permission, Group, User
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from river.models import State, Workflow, TransitionApprovalMeta, TransitionMeta
from rest_framework_api_key.models import APIKey

from sales.models import Ticket, SalesProject, CustomerInformation, Quotation, VendorInformation, UserProfile, SalesDepartment , BudgetBlock, ActualStateType

from tenant_schemas.middleware import DefaultTenantMiddleware
from tenant_schemas.middleware import BaseTenantMiddleware
from tenant_schemas.utils import get_public_schema_name

import random
import string
from datetime import date
from dateutil.relativedelta import *
from tenant_schemas.utils import schema_context

class HeaderTenantMiddleware(BaseTenantMiddleware):	
    def get_tenant(self, model, hostname, request):
        try:	         
            public_schema = model.objects.get(schema_name=get_public_schema_name())        
        except Exception as e:
            print(e)
        try:
            if request.path.startswith('/admin'):
                return public_schema 
            else:
                name = request.META.get('HTTP_CLIENT')
                tenant_model = model.objects.get(name=name)	   
                if date.today() <= tenant_model.paid_until:
                    return tenant_model
                else:
                    # delete instance and schema
                    tenant_model.delete()
                    return public_schema
        except Exception as e:  
            print(e)
            return public_schema


def bootstrap(trial):
    workflow_content_type = ContentType.objects.get_for_model(Workflow)
    content_type_userprofile = ContentType.objects.get_for_model(UserProfile)
    content_type_ticket = ContentType.objects.get_for_model(Ticket)
    content_type_salesproject = ContentType.objects.get_for_model(SalesProject)
    content_type_customer = ContentType.objects.get_for_model(CustomerInformation)
    content_type_vendor = ContentType.objects.get_for_model(VendorInformation)
    content_type_quotation = ContentType.objects.get_for_model(Quotation)
    content_type_block = ContentType.objects.get_for_model(BudgetBlock)
    add_ticket_permission = Permission.objects.get(codename="add_ticket", content_type=content_type_ticket)
    change_ticket_permission = Permission.objects.get(codename="change_ticket", content_type=content_type_ticket)
    delete_ticket_permission = Permission.objects.get(codename="delete_ticket", content_type=content_type_ticket)
    view_workflow_permission = Permission.objects.get(codename="view_workflow", content_type=workflow_content_type)

    add_project_permission = Permission.objects.get(codename="add_salesproject", content_type=content_type_salesproject)
    change_project_permission = Permission.objects.get(codename="change_salesproject", content_type=content_type_salesproject)
    delete_project_permission = Permission.objects.get(codename="delete_salesproject", content_type=content_type_salesproject)

    add_customer_permission = Permission.objects.get(codename="add_customerinformation", content_type=content_type_customer)
    change_customer_permission = Permission.objects.get(codename="change_customerinformation", content_type=content_type_customer)
    delete_customer_permission = Permission.objects.get(codename="delete_customerinformation", content_type=content_type_customer)

    add_vendor_permission = Permission.objects.get(codename="add_vendorinformation", content_type=content_type_vendor)
    change_vendor_permission = Permission.objects.get(codename="change_vendorinformation", content_type=content_type_vendor)
    delete_vendor_permission = Permission.objects.get(codename="delete_vendorinformation", content_type=content_type_vendor)

    add_quotation_permission = Permission.objects.get(codename="add_quotation", content_type=content_type_quotation)
    change_quotation_permission = Permission.objects.get(codename="change_quotation", content_type=content_type_quotation)
    delete_quotation_permission = Permission.objects.get(codename="delete_quotation", content_type=content_type_quotation)

    # special perms
    can_change_project_customer = Permission.objects.get(codename="can_change_project_customer", content_type=content_type_salesproject)
    can_change_project_user = Permission.objects.get(codename="can_change_project_user", content_type=content_type_salesproject)

    tier_3_oversight = Permission.objects.get(codename="tier_3_oversight", content_type=content_type_userprofile)
    tier_2_oversight = Permission.objects.get(codename="tier_2_oversight", content_type=content_type_userprofile)
    tier_1_oversight = Permission.objects.get(codename="tier_1_oversight", content_type=content_type_userprofile)

    can_change_ticket_project = Permission.objects.get(codename="can_change_ticket_project", content_type=content_type_ticket)
    can_change_ticket_customer = Permission.objects.get(codename="can_change_ticket_customer", content_type=content_type_ticket)
    can_assign_ticket_project = Permission.objects.get(codename="can_assign_ticket_project", content_type=content_type_ticket)
    can_assign_ticket_customer = Permission.objects.get(codename="can_assign_ticket_customer", content_type=content_type_ticket)

    ceo_group, _ = Group.objects.update_or_create(name="ceo")

    ceo_group.permissions.set([
        tier_3_oversight,
        add_ticket_permission, change_ticket_permission,
        delete_ticket_permission,
        add_project_permission, change_project_permission, delete_project_permission,
        add_customer_permission, change_customer_permission, delete_customer_permission,
        add_vendor_permission, change_vendor_permission, delete_vendor_permission,
        add_quotation_permission, change_quotation_permission, delete_quotation_permission,
        can_change_project_customer, can_change_project_user, can_change_ticket_project,
        can_change_ticket_customer, can_assign_ticket_project, can_assign_ticket_customer
    ])

    team_leader_group, _ = Group.objects.update_or_create(
        name="team_leaders")

    team_leader_group.permissions.set([
        tier_2_oversight,
        add_ticket_permission, change_ticket_permission,
        delete_ticket_permission,
        add_project_permission, change_project_permission, delete_project_permission,
        add_customer_permission, change_customer_permission, delete_customer_permission,
        add_vendor_permission, change_vendor_permission, delete_vendor_permission,
        add_quotation_permission, change_quotation_permission, delete_quotation_permission,
        can_change_project_customer, can_change_project_user, can_change_ticket_project,
        can_change_ticket_customer, can_assign_ticket_project, can_assign_ticket_customer
    ])

    developer_group, _ = Group.objects.update_or_create(name="developers")
    developer_group.permissions.set([
        tier_1_oversight, add_ticket_permission, change_ticket_permission,
        delete_ticket_permission, view_workflow_permission,
        add_project_permission, change_project_permission, delete_project_permission,
        add_customer_permission, change_customer_permission, delete_customer_permission,
        add_vendor_permission, change_vendor_permission, delete_vendor_permission,
        add_quotation_permission, change_quotation_permission, delete_quotation_permission,
        can_change_project_customer, can_change_project_user, can_change_ticket_project,
        can_change_ticket_customer, can_assign_ticket_project, can_assign_ticket_customer
    ])

    # workflow creation for Blocks

    open_state, _ = State.objects.update_or_create(
        label="Open (Blocks)", slug="open_blocks")
    in_progress_state, _ = State.objects.update_or_create(
        label="In Progress (Blocks)", slug="in_progress_blocks")
    resolved_state, _ = State.objects.update_or_create(
        label="Resolved (Blocks)", slug="resolved_blocks")
    re_open_state, _ = State.objects.update_or_create(
        label="Re Open (Blocks)", slug="re_open_blocks")
    closed_state, _ = State.objects.update_or_create(
        label="Closed (Blocks)", slug="closed_blocks")

    actual_state = ActualStateType.objects.create(state_type='Created', state=open_state, workflow_type='Block')
    actual_state = ActualStateType.objects.create(state_type='In Production', state=in_progress_state, workflow_type='Block')
    actual_state = ActualStateType.objects.create(state_type='Completed', state=closed_state, workflow_type='Block')

    block_workflow, _ = Workflow.objects.update_or_create(
        content_type=content_type_block, field_name="block_status", defaults={"initial_state": open_state})

    block_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=block_workflow, source_state=open_state, destination_state=in_progress_state)
    block_in_progress_to_resolved, _ = TransitionMeta.objects.update_or_create(
        workflow=block_workflow, source_state=in_progress_state, destination_state=resolved_state)
    block_resolved_to_closed, _ = TransitionMeta.objects.update_or_create(
        workflow=block_workflow, source_state=resolved_state, destination_state=closed_state)
    block_resolved_to_re_open, _ = TransitionMeta.objects.update_or_create(
        workflow=block_workflow, source_state=resolved_state, destination_state=re_open_state)
    block_re_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=block_workflow, source_state=re_open_state, destination_state=in_progress_state)

    block_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=block_workflow, transition_meta=block_open_to_in_progress)
    block_open_to_in_progress_meta.groups.set([developer_group])

    block_in_progress_to_resolved_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=block_workflow, transition_meta=block_in_progress_to_resolved)
    block_in_progress_to_resolved_meta.groups.set([developer_group])

    block_resolved_to_closed_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=block_workflow, transition_meta=block_resolved_to_closed)
    block_resolved_to_closed_meta.groups.set([team_leader_group])

    block_resolved_to_re_open_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=block_workflow, transition_meta=block_resolved_to_re_open)
    block_resolved_to_re_open_meta.groups.set([team_leader_group])

    block_re_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=block_workflow, transition_meta=block_re_open_to_in_progress)
    block_re_open_to_in_progress_meta.groups.set([developer_group])

    # workflow creation for tickets

    open_state, _ = State.objects.update_or_create(
        label="Open (Tickets)", slug="open_tickets")
    in_progress_state, _ = State.objects.update_or_create(
        label="In Progress (Tickets)", slug="in_progress_tickets")
    resolved_state, _ = State.objects.update_or_create(
        label="Resolved (Tickets)", slug="resolved_tickets")
    re_open_state, _ = State.objects.update_or_create(
        label="Re Open (Tickets)", slug="re_open_tickets")
    closed_state, _ = State.objects.update_or_create(
        label="Closed (Tickets)", slug="closed_tickets")

    actual_state = ActualStateType.objects.create(state_type='Created', state=open_state, workflow_type='Ticket')
    actual_state = ActualStateType.objects.create(state_type='Completed', state=closed_state, workflow_type='Ticket')
    
    workflow, _ = Workflow.objects.update_or_create(
        content_type=content_type_ticket, field_name="ticket_status", defaults={"initial_state": open_state})

    open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=workflow, source_state=open_state, destination_state=in_progress_state)
    in_progress_to_resolved, _ = TransitionMeta.objects.update_or_create(
        workflow=workflow, source_state=in_progress_state, destination_state=resolved_state)
    resolved_to_closed, _ = TransitionMeta.objects.update_or_create(
        workflow=workflow, source_state=resolved_state, destination_state=closed_state)
    resolved_to_re_open, _ = TransitionMeta.objects.update_or_create(
        workflow=workflow, source_state=resolved_state, destination_state=re_open_state)
    re_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=workflow, source_state=re_open_state, destination_state=in_progress_state)

    open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=workflow, transition_meta=open_to_in_progress)
    open_to_in_progress_meta.groups.set([developer_group])

    in_progress_to_resolved_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=workflow, transition_meta=in_progress_to_resolved)
    in_progress_to_resolved_meta.groups.set([developer_group])

    resolved_to_closed_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=workflow, transition_meta=resolved_to_closed)
    resolved_to_closed_meta.groups.set([team_leader_group])

    resolved_to_re_open_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=workflow, transition_meta=resolved_to_re_open)
    resolved_to_re_open_meta.groups.set([team_leader_group])

    re_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=workflow, transition_meta=re_open_to_in_progress)
    re_open_to_in_progress_meta.groups.set([developer_group])

    # workflow creation for sales projects

    open_state, _ = State.objects.update_or_create(
        label="Open (Projects)", slug="open_projects")
    in_progress_state, _ = State.objects.update_or_create(
        label="In Progress (Projects)", slug="in_progress_projects")
    resolved_state, _ = State.objects.update_or_create(
        label="Resolved (Projects)", slug="resolved_projects")
    re_open_state, _ = State.objects.update_or_create(
        label="Re Open (Projects)", slug="re_open_projects")
    closed_project_state, _ = State.objects.update_or_create(
        label="Closed (Projects)", slug="closed_projects")

    actual_state = ActualStateType.objects.create(state_type='Created', state=open_state, workflow_type='Project')
    actual_state = ActualStateType.objects.create(state_type='In Production', state=in_progress_state, workflow_type='Project')
    actual_state = ActualStateType.objects.create(state_type='Completed', state=closed_project_state, workflow_type='Project')

    proj_workflow, _ = Workflow.objects.update_or_create(
        content_type=content_type_salesproject, field_name="project_status", defaults={"initial_state": open_state})

    proj_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=proj_workflow, source_state=open_state, destination_state=in_progress_state)
    proj_in_progress_to_resolved, _ = TransitionMeta.objects.update_or_create(
        workflow=proj_workflow, source_state=in_progress_state, destination_state=resolved_state)
    proj_resolved_to_closed, _ = TransitionMeta.objects.update_or_create(
        workflow=proj_workflow, source_state=resolved_state, destination_state=closed_state)
    proj_resolved_to_re_open, _ = TransitionMeta.objects.update_or_create(
        workflow=proj_workflow, source_state=resolved_state, destination_state=re_open_state)
    proj_re_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=proj_workflow, source_state=re_open_state, destination_state=in_progress_state)

    proj_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=proj_workflow, transition_meta=proj_open_to_in_progress)
    proj_open_to_in_progress_meta.groups.set([developer_group])

    proj_in_progress_to_resolved_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=proj_workflow, transition_meta=proj_in_progress_to_resolved)
    proj_in_progress_to_resolved_meta.groups.set([developer_group])

    proj_resolved_to_closed_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=proj_workflow, transition_meta=proj_resolved_to_closed)
    proj_resolved_to_closed_meta.groups.set([team_leader_group])

    proj_resolved_to_re_open_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=proj_workflow, transition_meta=proj_resolved_to_re_open)
    proj_resolved_to_re_open_meta.groups.set([team_leader_group])

    proj_re_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=proj_workflow, transition_meta=proj_re_open_to_in_progress)
    proj_re_open_to_in_progress_meta.groups.set([developer_group])

    # workflow creation for customerinformation

    open_state, _ = State.objects.update_or_create(
        label="Open (Customers)", slug="open_customers")
    in_progress_state, _ = State.objects.update_or_create(
        label="In Progress (Customers)", slug="in_progress_customers")
    resolved_state, _ = State.objects.update_or_create(
        label="Resolved (Customers)", slug="resolved_customers")
    re_open_state, _ = State.objects.update_or_create(
        label="Re Open (Customers)", slug="re_open_customers")
    closed_state, _ = State.objects.update_or_create(
        label="Closed (Customers)", slug="closed_customers")

    actual_state = ActualStateType.objects.create(state_type='Created', state=open_state, workflow_type='Customer')
    actual_state = ActualStateType.objects.create(state_type='Converted', state=closed_state, workflow_type='Customer')

    cust_workflow, _ = Workflow.objects.update_or_create(
        content_type=content_type_customer, field_name="customer_status", defaults={"initial_state": open_state})

    cust_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=cust_workflow, source_state=open_state, destination_state=in_progress_state)
    cust_in_progress_to_resolved, _ = TransitionMeta.objects.update_or_create(
        workflow=cust_workflow, source_state=in_progress_state, destination_state=resolved_state)
    cust_resolved_to_closed, _ = TransitionMeta.objects.update_or_create(
        workflow=cust_workflow, source_state=resolved_state, destination_state=closed_state)
    cust_resolved_to_re_open, _ = TransitionMeta.objects.update_or_create(
        workflow=cust_workflow, source_state=resolved_state, destination_state=re_open_state)
    cust_re_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=cust_workflow, source_state=re_open_state, destination_state=in_progress_state)

    cust_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=cust_workflow, transition_meta=cust_open_to_in_progress)
    cust_open_to_in_progress_meta.groups.set([developer_group])

    cust_in_progress_to_resolved_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=cust_workflow, transition_meta=cust_in_progress_to_resolved)
    cust_in_progress_to_resolved_meta.groups.set([developer_group])

    cust_resolved_to_closed_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=cust_workflow, transition_meta=cust_resolved_to_closed)
    cust_resolved_to_closed_meta.groups.set([team_leader_group])

    cust_resolved_to_re_open_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=cust_workflow, transition_meta=cust_resolved_to_re_open)
    cust_resolved_to_re_open_meta.groups.set([team_leader_group])

    cust_re_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=cust_workflow, transition_meta=cust_re_open_to_in_progress)
    cust_re_open_to_in_progress_meta.groups.set([developer_group])

    # workflow creation for vendorinformation

    open_state, _ = State.objects.update_or_create(
        label="Open (Vendors)", slug="open_vendors")
    in_progress_state, _ = State.objects.update_or_create(
        label="In Progress (Vendors)", slug="in_progress_vendors")
    resolved_state, _ = State.objects.update_or_create(
        label="Resolved (Vendors)", slug="resolved_vendors")
    re_open_state, _ = State.objects.update_or_create(
        label="Re Open (Vendors)", slug="re_open_vendors")
    closed_state, _ = State.objects.update_or_create(
        label="Closed (Vendors)", slug="closed_vendors")

    actual_state = ActualStateType.objects.create(state_type='Created', state=open_state, workflow_type='Vendor')
    actual_state = ActualStateType.objects.create(state_type='Converted', state=closed_state, workflow_type='Vendor')

    vendor_workflow, _ = Workflow.objects.update_or_create(
        content_type=content_type_vendor, field_name="vendor_status", defaults={"initial_state": open_state})

    vendor_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=vendor_workflow, source_state=open_state, destination_state=in_progress_state)
    vendor_in_progress_to_resolved, _ = TransitionMeta.objects.update_or_create(
        workflow=vendor_workflow, source_state=in_progress_state, destination_state=resolved_state)
    vendor_resolved_to_closed, _ = TransitionMeta.objects.update_or_create(
        workflow=vendor_workflow, source_state=resolved_state, destination_state=closed_state)
    vendor_resolved_to_re_open, _ = TransitionMeta.objects.update_or_create(
        workflow=vendor_workflow, source_state=resolved_state, destination_state=re_open_state)
    vendor_re_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=vendor_workflow, source_state=re_open_state, destination_state=in_progress_state)

    vendor_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=vendor_workflow, transition_meta=vendor_open_to_in_progress)
    vendor_open_to_in_progress_meta.groups.set([developer_group])

    vendor_in_progress_to_resolved_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=vendor_workflow, transition_meta=vendor_in_progress_to_resolved)
    vendor_in_progress_to_resolved_meta.groups.set([developer_group])

    vendor_resolved_to_closed_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=vendor_workflow, transition_meta=vendor_resolved_to_closed)
    vendor_resolved_to_closed_meta.groups.set([team_leader_group])

    vendor_resolved_to_re_open_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=vendor_workflow, transition_meta=vendor_resolved_to_re_open)
    vendor_resolved_to_re_open_meta.groups.set([team_leader_group])

    vendor_re_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=vendor_workflow, transition_meta=vendor_re_open_to_in_progress)
    vendor_re_open_to_in_progress_meta.groups.set([developer_group])

    # workflow creation for quotations

    open_state, _ = State.objects.update_or_create(
        label="Open (Quotations)", slug="open_quotations")
    in_progress_state, _ = State.objects.update_or_create(
        label="In Progress (Quotations)", slug="in_progress_quotations")
    resolved_state, _ = State.objects.update_or_create(
        label="Resolved (Quotations)", slug="resolved_quotations")
    re_open_state, _ = State.objects.update_or_create(
        label="Re Open (Quotations)", slug="re_open_quotations")
    closed_state, _ = State.objects.update_or_create(
        label="Closed (Quotations)", slug="closed_quotations")

    actual_state = ActualStateType.objects.create(state_type='Created', state=open_state, workflow_type='Quotation')
    actual_state = ActualStateType.objects.create(state_type='Approved', state=closed_state, workflow_type='Quotation')

    quotation_workflow, _ = Workflow.objects.update_or_create(
        content_type=content_type_quotation, field_name="quotation_status", defaults={"initial_state": open_state})

    quotation_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=quotation_workflow, source_state=open_state, destination_state=in_progress_state)
    quotation_in_progress_to_resolved, _ = TransitionMeta.objects.update_or_create(
        workflow=quotation_workflow, source_state=in_progress_state, destination_state=resolved_state)
    quotation_resolved_to_closed, _ = TransitionMeta.objects.update_or_create(
        workflow=quotation_workflow, source_state=resolved_state, destination_state=closed_state)
    quotation_resolved_to_re_open, _ = TransitionMeta.objects.update_or_create(
        workflow=quotation_workflow, source_state=resolved_state, destination_state=re_open_state)
    quotation_re_open_to_in_progress, _ = TransitionMeta.objects.update_or_create(
        workflow=quotation_workflow, source_state=re_open_state, destination_state=in_progress_state)

    quotation_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=quotation_workflow, transition_meta=quotation_open_to_in_progress)
    quotation_open_to_in_progress_meta.groups.set([developer_group])

    quotation_in_progress_to_resolved_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=quotation_workflow, transition_meta=quotation_in_progress_to_resolved)
    quotation_in_progress_to_resolved_meta.groups.set([developer_group])

    quotation_resolved_to_closed_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=quotation_workflow, transition_meta=quotation_resolved_to_closed)
    quotation_resolved_to_closed_meta.groups.set([team_leader_group])

    quotation_resolved_to_re_open_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=quotation_workflow, transition_meta=quotation_resolved_to_re_open)
    quotation_resolved_to_re_open_meta.groups.set([team_leader_group])

    quotation_re_open_to_in_progress_meta, _ = TransitionApprovalMeta.objects.update_or_create(
        workflow=quotation_workflow, transition_meta=quotation_re_open_to_in_progress)
    quotation_re_open_to_in_progress_meta.groups.set([developer_group])

    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(10))

    if trial:
        root = User.objects.filter(username="trial").first(
        ) or User.objects.create_superuser("trial", "", result_str)
        root.groups.set([ceo_group])

        department_1 = SalesDepartment.objects.filter(department_name="trial").first() or SalesDepartment.objects.create(
        department_name="trial",
        sap_company_id='trial')


    else:
        root = User.objects.filter(username="admin").first(
        ) or User.objects.create_superuser("admin", "", result_str)
        root.groups.set([ceo_group])

        department_1 = SalesDepartment.objects.filter(department_name="admin").first() or SalesDepartment.objects.create(
        department_name="admin",
        sap_company_id='admin')

    '''
    team_leader_1 = User.objects.filter(username="team_leader_1").first(
    ) or User.objects.create_user("team_leader_1", password="demodemo")
    team_leader_1.groups.set([team_leader_group])

    developer_1 = User.objects.filter(username="developer_1").first(
    ) or User.objects.create_user("developer_1", password="demodemo")
    developer_1.groups.set([developer_group])
    '''

    root_profile = UserProfile.objects.get(user=root)
    #team_leader_1_profile = UserProfile.objects.get(user=team_leader_1)
    #developer_1_profile = UserProfile.objects.get(user=developer_1)

    root_profile.department.add(department_1)
    #team_leader_1_profile.department.add(department_1)
    #developer_1_profile.department.add(department_1)

    root_profile.email_service = 'gmail'
    #team_leader_1_profile.email_service = 'gmail'
    #developer_1_profile.email_service = 'gmail'

    #developer_1_profile.save()
    #team_leader_1_profile.save()
    root_profile.save()

    print(connection.schema_name)

    source = LeadSource(source='Instagram')
    source.save()
    source2 = LeadSource(source='LinkedIn')
    source2.save()


    customer = CustomerInformation(
        customer_name = 'Customer A', 
        telephone_number = '+6512345678',
        country = 'CN',
        address = 'Central',
        salesDepartment=department_1,
        source=source,
        creator=root_profile)
    
    customer.save()

    vendor = VendorInformation(
        vendor_name = 'Vendor A', 
        telephone_number = '+6512345678',
        country = 'CN',
        address = 'Central',
        salesDepartment=department_1,
        creator=root_profile)

    vendor.save()

    project = SalesProject(
        sales_project_name='Project Nobo',
        sales_project_est_rev=5000,
        customerInformation=customer,
        sales_department=department_1,
    )

    project.save()

    project.userProfile.add(root_profile)

    project.save()

    project2 = SalesProject(
        sales_project_name='Test Project',
        sales_project_est_rev=5000,
        customerInformation=customer,
        sales_department=department_1,
        project_status=closed_project_state
    )

    project2.save()

    project2.userProfile.add(root_profile)

    project2.save()

    item = Item(
        item_code='Item23432',
        item_description='Test Item',
        dimensions='30*30*30m^3',
        gross_weight='20kg',
        net_weight='25kg',
        base_unit='pc',
        base_price=50,
        )

    item.save()

    block = BudgetBlock(
        start_date='2020-01-01',
        end_date='2021-01-01',
        project=project,
        item=item,
        vendor=vendor,
        buy_price=50,
        sell_price=70,
        creator=root)

    block.save()

    quotation = Quotation(
        creator=root,
        salesProject=project,
        document_date='2020-09-09',
        tax_date='2020-09-09',
        due_date='2020-09-09',
        customer=customer,
    )

    quotation.save()

    quotationitem = QuotationItem(
        quantity=30,
        unit_price=50,
        remarks='-',
        block=block,
        quotation=quotation
    )

    quotationitem.save()

    api_key, key = APIKey.objects.create_key(name="ticket-service")
    print(api_key)
    print(key)

    return {'password': result_str, 'key': key}
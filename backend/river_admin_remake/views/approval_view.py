from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK , HTTP_400_BAD_REQUEST
from river.models import Workflow, DONE , State , Transition
from django.db import transaction
from sales.models import CustomerInformation , SalesProject , VendorInformation, Notifications
from django.contrib.auth.models import User

from river_admin_remake.views import get, delete , post
from river_admin_remake.views.serializers import StateDto, WorkflowObjectStateDto, TransitionDto, TransitionApprovalDto


@transaction.atomic
@post(r'^approve/(?P<workflow_pk>\w+)/(?P<object_id>\w+)/(?P<next_state_id>\w+)/(?P<transition_id>\w+)$')
def ApproveTaskView(request, workflow_pk , object_id , next_state_id , transition_id):
    workflow = get_object_or_404(Workflow.objects.all(), pk=workflow_pk)
    model_class = workflow.content_type.model_class()
    if model_class == CustomerInformation:
        customer = get_object_or_404(CustomerInformation.objects.all(), pk=object_id)
        try:
            customer.river.customer_status.approve(as_user=request.user, next_state = next_state_id)
            transition = get_object_or_404(Transition.objects.all(),id=transition_id)
            targets = customer.salesDepartment.users.all()
            for target in targets:
                Notifications.objects.create(
                                            target = target.user,
                                            title = str(customer.customer_name) + ' is now at Stage : ' + str(customer.customer_status),
                                            extra = 'Customer',
                                            object_url = '/customer/detail/' + str(customer.customer_id)
                )
            return Response(TransitionDto(transition).data,status=HTTP_200_OK)
        except Exception as e:
            return Response({"message":str(e)},status=HTTP_400_BAD_REQUEST)

    elif model_class == VendorInformation:
        vendor = get_object_or_404(VendorInformation.objects.all(), pk=object_id)
        try:
            vendor.river.project_status.approve(as_user=request.user, next_state = next_state_id)
            transition = get_object_or_404(Transition.objects.all(),id=transition_id)

            targets = vendor.salesDepartment.users.all()
            for target in targets:
                Notifications.objects.create(
                                            target = target.user,
                                            title = str(vendor.vendor_name) + ' is now at Stage : ' + str(vendor.vendor_status),
                                            extra = 'Vendor',
                                            object_url = '/vendor/detail/' + str(vendor.vendor_id)
                )
            return Response(TransitionDto(transition).data,status=HTTP_200_OK)
        except Exception as e:
            return Response({"message":str(e)},status=HTTP_400_BAD_REQUEST)

    elif model_class == SalesProject:
        project = get_object_or_404(SalesProject.objects.all(), pk=object_id)
        try:
            print(project.river.project_status.next_approvals)
            for approval in project.river.project_status.next_approvals:
                print(User.objects.filter(userprofile__in=project.userProfile.all()).filter(groups__in = approval.groups.all()).exclude(id=request.user.id))
                for target in User.objects.filter(userprofile__in=project.userProfile.all()).filter(groups__in = approval.groups.all()).exclude(id=request.user.id):
                     Notifications.objects.create(
                                            target = target,
                                            title = '[ Sales Project ID: ' + str(project.sales_project_id) + ' ]' + str(project.sales_project_name) + ' has an approval for you.',
                                            extra = 'Sales Project',
                                            object_url = '/project/detail/' + str(project.sales_project_id)
                                             )
            project.river.project_status.approve(as_user=request.user , next_state = next_state_id)
            transition = get_object_or_404(Transition.objects.all(),id=transition_id)
            targets = project.userProfile.all()
            print(transition.status)
            if transition.status == 'done':
                for target in targets:
                    Notifications.objects.create(
                                                target = target.user,
                                                title = str(project.sales_project_name) + ' is now at Stage : ' + str(project.project_status),
                                                extra = 'Sales Project',
                                                object_url = '/project/detail/' + str(project.sales_project_id)
                    )

            return Response(TransitionDto(transition).data,status=HTTP_200_OK)
        except Exception as e:
            return Response({"message":str(e)},status=HTTP_400_BAD_REQUEST)

    else:
        return Response("No workflow found", status=HTTP_400_BAD_REQUEST)

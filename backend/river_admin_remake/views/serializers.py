from django.contrib.auth.models import Permission, Group, User
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from river.models import Function, OnApprovedHook, State, TransitionApprovalMeta, \
    OnTransitHook, TransitionMeta, Transition, Workflow, TransitionApproval, DONE, CANCELLED

from river.models.hook import AFTER, BEFORE


# CONTENT TYPE
class ContentTypeDto(serializers.ModelSerializer):
    class Meta:
        model = ContentType
        fields = ['id', 'app_label', 'model']


# AUTH
class LoginDto(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UserDto(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class PermissionDto(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'content_type', 'name', 'codename']


class GroupDto(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class GroupPermDto(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name' , 'permissions']
        depth = 2

# STATE
class StateDto(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ['id', 'label', "slug", "description"]


class CreateStateDto(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ['label' , 'description']


# WORKFLOW
class WorkflowClassWithPermissionsDto(serializers.ModelSerializer):
    content_type = ContentTypeDto()
    initial_state = StateDto()
    permissions = serializers.SerializerMethodField('get_custompermissions',read_only=True)

    def get_custompermissions(self, obj):
        permission_list = ['river.add_ontransithook','river.add_onapprovedhook','river.add_oncompletehook',
                           'river.delete_ontransithook','river.delete_onapprovedhook','river.delete_oncompletehook',
                           'river.add_transitionapprovalmeta','river.delete_transitionapprovalmeta', 'river.change_transitionapprovalmeta',
                           'river.add_transitionmeta','river.delete_transitionmeta',]
        user_perms = User.get_user_permissions(self.context['request'].user)
        return { permission: True if permission in user_perms else False for permission in permission_list } 

    class Meta:
        model = Workflow
        fields = ['id', 'content_type', 'initial_state', 'field_name' , 'permissions']


# WORKFLOW
class WorkflowDto(serializers.ModelSerializer):
    content_type = ContentTypeDto()
    initial_state = StateDto()

    class Meta:
        model = Workflow
        fields = ['id', 'content_type', 'initial_state', 'field_name']

class WorkflowMetadataDto(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    icon = serializers.CharField()


class WorkflowStateFieldDto(serializers.Serializer):
    content_type = ContentTypeDto()
    field_name = serializers.CharField()


class CreateWorkflowDto(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = ["content_type", "field_name", "initial_state"]


# TRANSITION META
class TransitionMetaDto(serializers.ModelSerializer):
    class Meta:
        model = TransitionMeta
        fields = ['id', 'workflow', 'source_state', 'destination_state']


class CreateTransitionMetaDto(serializers.ModelSerializer):
    class Meta:
        model = TransitionMeta
        fields = ["workflow", "source_state", "destination_state"]


# TRANSITION APPROVAL META
class TransitionApprovalMetaDto(serializers.ModelSerializer):
    permissions = PermissionDto(many=True)
    groups = GroupDto(many=True)

    class Meta:
        model = TransitionApprovalMeta
        fields = ['id', 'workflow', 'transition_meta', 'permissions', 'groups', 'priority']


class CreateTransitionApprovalMetaDto(serializers.ModelSerializer):
    class Meta:
        model = TransitionApprovalMeta
        fields = ['workflow', 'transition_meta', 'permissions', 'groups', 'priority']


class RePrioritizeTransitionApprovalMetaDto(serializers.Serializer):
    transition_approval_meta_id = serializers.CharField()
    priority = serializers.IntegerField()


# FUNCTION
class FunctionDto(serializers.ModelSerializer):
    class Meta:
        model = Function
        fields = ['id', 'name', 'body', 'version', 'date_created', 'date_updated']


class CreateFunctionDto(serializers.ModelSerializer):
    class Meta:
        model = Function
        fields = ['name', 'body']


class UpdateFunctionDto(serializers.ModelSerializer):
    class Meta:
        model = Function
        fields = ['name', 'body']


# TRANSITION HOOK
class TransitionHookDto(serializers.ModelSerializer):
    callback_function = FunctionDto()

    class Meta:
        model = OnTransitHook
        fields = ['id', 'callback_function', 'transition_meta', 'transition', 'object_id']


class CreateTransitionHookDto(serializers.ModelSerializer):
    hook_type = serializers.ChoiceField(choices=[BEFORE], default=BEFORE)

    class Meta:
        model = OnTransitHook
        fields = ['workflow', 'callback_function', 'transition_meta', 'transition', 'object_id', 'content_type', 'hook_type']


# APPROVAL HOOK
class ApprovalHookDto(serializers.ModelSerializer):
    callback_function = FunctionDto()

    class Meta:
        model = OnApprovedHook
        fields = ['id', 'callback_function', 'transition_approval_meta', 'transition_approval', 'object_id']


class CreateApprovalHookDto(serializers.ModelSerializer):
    hook_type = serializers.ChoiceField(choices=[AFTER], default=AFTER)

    class Meta:
        model = OnApprovedHook
        fields = ['workflow', 'callback_function', 'transition_approval_meta', 'transition_approval', 'object_id', 'content_type', 'hook_type']


# TRANSITION
class TransitionDto(serializers.ModelSerializer):
    is_done = serializers.SerializerMethodField()
    is_cancelled = serializers.SerializerMethodField()

    class Meta:
        model = Transition
        fields = ['id', 'workflow', 'source_state', 'destination_state', 'iteration', 'meta', 'object_id', 'is_done', 'is_cancelled']

    def get_is_done(self, obj):
        return obj.status == DONE

    def get_is_cancelled(self, obj):
        return obj.status == CANCELLED


class TransitionApprovalDto(serializers.ModelSerializer):
    transactioner = UserDto()
    permissions = PermissionDto(many=True)
    groups = GroupDto(many=True)

    class Meta:
        model = TransitionApproval
        fields = ['id', 'workflow', 'transition', 'permissions', 'groups', 'priority', 'status', 'transactioner', 'meta', 'object_id']


# WORKFLOW OBJECT

class WorkflowObjectStateDto(serializers.Serializer):
    iteration = serializers.IntegerField()
    state = StateDto()

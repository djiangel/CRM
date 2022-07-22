from rest_framework import serializers
from sales.models import *
from django.contrib.auth.models import User
from django.http import JsonResponse

class CustomerAnalyticsSerializer(serializers.Serializer):
    rev_sum = serializers.FloatField()
    rev_percent = serializers.FloatField()
    completed_count = serializers.IntegerField()
    active_count = serializers.IntegerField()
    total_count = serializers.IntegerField()

class DateRangeSerializer(serializers.Serializer):
    start = serializers.DateField()
    end = serializers.DateField()
    formatted_date = serializers.CharField()

'''class CustomerSourceChildSerializer(serializers.Serializer):
    y = serializers.CharField(max_length=200)
    count = serializers.IntegerField()
    x = serializers.DateField()

class CustomerSourceSerializer(serializers.Serializer):
    count = CustomerSourceChildSerializer(many=True)
    dates = DateRangeSerializer(many=True)
    sources = serializers.ListField(child=serializers.CharField())'''

class CustomerSourceSerializer(serializers.Serializer):
    count = serializers.ListField(child=serializers.IntegerField())
    sources = serializers.ListField(child=serializers.CharField())

class CustomerCountrySerializer(serializers.Serializer):
    country = serializers.CharField(max_length=200)
    count = serializers.IntegerField()

class CustomerConversionSerializer(serializers.Serializer):
    conversion_date = serializers.DateField()
    count = serializers.IntegerField()

class KPIChildSerializer(serializers.Serializer):
    lead_kpi = serializers.IntegerField()
    rate_kpi = serializers.FloatField()
    rev_kpi = serializers.FloatField()
    lead_count = serializers.IntegerField()
    client_count = serializers.IntegerField()
    conversion_rate = serializers.FloatField()
    revenue = serializers.FloatField()
    lead_progress = serializers.FloatField()
    rev_progress = serializers.FloatField()
    kpi_id = serializers.IntegerField()

class KPISerializer(serializers.Serializer):
    month = KPIChildSerializer()
    quarter = KPIChildSerializer()
    year = KPIChildSerializer()

class LeadKPISerializer(serializers.Serializer):
    kpi = serializers.IntegerField()
    current = serializers.IntegerField()
    percentage = serializers.FloatField()

class EstimatedRevenueSerializer(serializers.Serializer):
    creation_date = serializers.DateField()
    estimated_revenue_sum = serializers.FloatField()

class ProjectConvertedSerializer(serializers.Serializer):
    production = serializers.IntegerField()
    date = serializers.DateField()
    created = serializers.IntegerField()
    deactivated = serializers.IntegerField()
    completed = serializers.IntegerField()
    formatted_date = serializers.CharField(max_length=200)
    conversion_rate = serializers.FloatField()

class TicketConvertedSerializer(serializers.Serializer):
    date = serializers.DateField()
    incomplete = serializers.IntegerField()
    complete = serializers.IntegerField()
    formatted_date = serializers.CharField(max_length=200)

class CustomerConvertedSerializer(serializers.Serializer):
    lead_count = serializers.IntegerField()
    date = serializers.DateField()
    client_count = serializers.IntegerField()
    formatted_date = serializers.CharField(max_length=200)
    conversion_rate = serializers.FloatField()

class EstimatedRevenueSerializer(serializers.Serializer):
    rev_sum = serializers.FloatField()
    est_rev = serializers.FloatField()
    rev_rate = serializers.FloatField()
    sales_project_name = serializers.CharField(max_length=200)
    sales_project_id = serializers.IntegerField()

class ActualRevenueSerializer(serializers.Serializer):
    rev_sum = serializers.FloatField()
    date = serializers.DateField()
    kpi = serializers.FloatField()
    formatted_date = serializers.CharField(max_length=200)
    rev_rate = serializers.FloatField()

class KPIModelSerializer(serializers.ModelSerializer):
    class Meta: 
        model = KPI
        fields = '__all__'

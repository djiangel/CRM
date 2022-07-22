from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from sales.models import *
from .serializers import *
from rest_framework import viewsets
from django.db.models import Count, F, Sum, Q, ExpressionWrapper, FloatField, IntegerField
from django.db.models.functions import TruncMonth, TruncQuarter, TruncYear, Coalesce
from rest_framework.response import Response
from datetime import timedelta, datetime, date
import time
import calendar
from dateutil.relativedelta import *
from django.core import serializers
import json
import copy
from rest_framework import status
from django.http import Http404

class CustomerAnalyticsView(APIView):

    def get_object(self, pk):
        try:
            return CustomerInformation.objects.get(pk=pk)
        except CustomerInformation.DoesNotExist:
            raise Http404

    def get(self, request, pk):

        d = UserProfile.objects.get(user=self.request.user).department.all()[0]
        final_qs = {}
        obj = self.get_object(pk)

        try:
            actual_state = ActualStateType.objects.get(state_type='completed').state
            rev_sum_filter = Q(quotation__customer=obj, quotation__quotation_status=actual_state, quotation__salesProject__sales_department=d)
            rev_percent_filter = Q(quotation__quotation_status=actual_state, quotation__salesProject__sales_department=d)
            project_count_filter = Q(customerInformation=obj)
        except:
            rev_sum_filter = Q(quotation__customer=obj,  quotation__salesProject__sales_department=d)
            rev_percent_filter = Q(quotation__salesProject__sales_department=d)
            project_count_filter = Q(customerInformation=obj)


        '''if metric != 'all-time':
            rev_sum_filter &= Q(date_time__gte=start_date)
            rev_percent_filter &= Q(date_time__gte=start_date)
            project_count_filter &= Q(completed_date__gte=start_date)'''

        qs = QuotationItem.objects.filter(rev_sum_filter).values('quotation__customer').annotate(rev_sum=Sum(ExpressionWrapper(F('quantity') * F('unit_price'), output_field = FloatField()))).values_list('rev_sum', flat=True)
        final_qs['rev_sum'] = qs[0] if len(qs) > 0 else 0

        qs = QuotationItem.objects.filter(rev_percent_filter).values('quotation__customer').annotate(rev_sum=Sum(ExpressionWrapper(F('quantity') * F('unit_price'), output_field = FloatField()))).values_list('rev_sum', flat=True)
        final_qs['rev_percent'] = float(final_qs['rev_sum']) * 100.0 / float(qs[0]) if len(qs) > 0 else 0

        qs = SalesProject.objects.filter(project_count_filter).values('customerInformation')
        qs = qs.annotate(completed_count=Count('sales_project_id', filter=Q(completed_date__isnull=False))).annotate(active_count=Count('sales_project_id', filter=Q(completed_date__isnull=True)))
        final_qs['completed_count'] = qs[0]['completed_count'] if len(qs) > 0 else 0  
        final_qs['active_count'] = qs[0]['active_count'] if len(qs) > 0 else 0  
        final_qs['total_count'] = final_qs['active_count'] + final_qs['completed_count']        

        serializer = CustomerAnalyticsSerializer(final_qs)

        return Response(serializer.data)


def source_missing_dates(qs, source_qs, metric, date_field, source_field, empty_dict, start_date, end_date):

    months = 1 if metric == 'month' else 3 if metric == 'quarter' else 12

    new_qs = []

    source_qs = LeadSource.objects.all().values_list('source', flat=True).order_by('source') 

    if len(qs) > 0:

        date = start_date
        i = 0

    while date <= end_date:
        for source in source_qs:
            if date == qs[i][date_field] and source == qs[i][source_field]:
                new_qs.append(qs[i])
                if i < len(qs) - 1:
                    i += 1
            else:
                new_dict = copy.deepcopy(empty_dict)
                new_dict[date_field] = date
                new_dict[source_field] = source
                new_qs.append(new_dict)
        if metric == 'daily':  
            date += relativedelta(days=+1)      
        else:          
            date += relativedelta(months=+months) 

    return new_qs

class CustomerSourceView(APIView):

    def get(self, request):
        group = self.request.query_params.get('group')
        metric = self.request.query_params.get('metric')
        if metric == 'daily':
            start = date.today() + relativedelta(months=-1)
            end = date.today()
        else:
            start = datetime.strptime(self.request.query_params.get('start'), '%Y-%m-%d').date()
            end = datetime.strptime(self.request.query_params.get('end'), '%Y-%m-%d').date()

        if group == 'department':
            d = SalesDepartment.objects.get(department_id = self.request.query_params.get('select'))
            custom_filter = Q(customers__salesDepartment = d)

        elif group == 'individual':
            user = UserProfile.objects.get(user=self.request.user)
            custom_filter = Q(customers__creator = user) 

        final_qs  = {}

        source_qs = LeadSource.objects.all().values_list('source', flat=True) 
        final_qs['sources'] = source_qs

        '''if metric == 'daily':
            custom_filter &= Q(customers__created_date__gte=start)
            qs = LeadSource.objects.filter(custom_filter).values('source', date=F('customers__created_date')).annotate(count=Count('source')).order_by('date', 'source')

        if metric == 'month':
            custom_filter &= Q(customers__created_date__range=(start, end))
            qs = LeadSource.objects.filter(custom_filter).annotate(date=TruncMonth('customers__created_date')).values('date', 'source').annotate(count=Count('source')).order_by('date', 'source')

        elif metric == 'quarter':
            custom_filter &= Q(customers__created_date__range=(start, end))
            qs = LeadSource.objects.filter(custom_filter).annotate(date=TruncQuarter('customers__created_date')).values('date', 'source').annotate(count=Count('source')).order_by('date', 'source')

        elif metric == 'year':
            custom_filter &= Q(customers__created_date__year__range=(start.year, end.year))
            qs = LeadSource.objects.filter(custom_filter).annotate(date=TruncYear('customers__created_date')).values('date', 'source').annotate(count=Count('source')).order_by('date', 'source')   

        qs = source_missing_dates(qs, source_qs, metric, 'date', 'source', {'count': 0}, start, end)
        qs = [{'y': q['source'], 'count': q['count'], 'x': q['date']} for q in qs]
        final_qs['count'] = qs
        final_qs['dates'] = get_dates_range(metric, start, end)'''

        if metric == 'month':
            custom_filter &= Q(customers__created_date__range=(start, end))

        elif metric == 'quarter':
            custom_filter &= Q(customers__created_date__range=(start, end))

        elif metric == 'year':
            custom_filter &= Q(customers__created_date__year__range=(start.year, end.year))

        qs = LeadSource.objects.filter(custom_filter).values('source').annotate(count=Count('source')).order_by('source').values_list('count', flat=True)

        final_qs['count'] = qs


        serializer = CustomerSourceSerializer(final_qs)

        return Response(serializer.data)

class CustomerCountryCountView(APIView):

    def get(self, request):
        group = self.request.query_params.get('group')

        if group == 'department':
            d = SalesDepartment.objects.get(department_id = self.request.query_params.get('select'))
            qs = CustomerInformation.objects.filter(salesDepartment=d).values('country')    

        elif group == 'individual':
            user = UserProfile.objects.get(user=self.request.user)
            qs = CustomerInformation.objects.filter(creator=user).values('country')  

        qs = qs.annotate(count=Count('country')).values('count', 'country')

        print(qs)

        serializer = CustomerCountrySerializer(qs, many=True)

        return Response(serializer.data)


class CustomerConversionView(APIView):

    def get(self, request):
        group = self.request.query_params.get('group')

        if group == 'department':
            department = SalesDepartment.objects.get(department_id = self.request.query_params.get('select'))
            qs = CustomerInformation.objects.filter(salesDepartment=department)

        elif group == 'individual':
            user = UserProfile.objects.get(user=self.request.user)
            qs = CustomerInformation.objects.filter(creator=user)

        start = date.today() + relativedelta(days=-30)
        end = date.today()

        qs = qs.filter(conversion_date__gte=start).values('conversion_date').annotate(count=Count('conversion_date'))

        new_qs = []
        empty_dict = { 'count': 0 }

        if len(qs) > 0:
            i = 0
            while start <= end:
                if start == qs[i]['conversion_date']:
                    new_qs.append(qs[i])
                    if i < len(qs) - 1:
                        i += 1
                else:
                    new_dict = copy.deepcopy(empty_dict)
                    new_dict['conversion_date'] = start
                    new_qs.append(new_dict)                
                start += relativedelta(days=+1) 



        serializer = CustomerConversionSerializer(new_qs, many=True)

        return Response(serializer.data)


class KPIView(APIView):

    def get(self, request, *args, **kwargs):
        group = self.request.query_params.get('group')
        final_qs = {}
        empty_dict = {'kpi_id': None, 'lead_kpi': None, 'rate_kpi': None, 'rev_kpi': None}

        if group == 'department':
            d = SalesDepartment.objects.get(department_id = self.request.query_params.get('select'))
            kpi_qs = KPI.objects.filter(department=d, group=group)
            lead_qs = CustomerInformation.objects.filter(salesDepartment=d)
            rev_qs = SalesProject.objects.filter(sales_department=d)

        elif group == 'individual':
            user = UserProfile.objects.get(user=self.request.user)
            kpi_qs = KPI.objects.filter(creator=user, group=group)
            lead_qs = CustomerInformation.objects.filter(creator=user)
            rev_qs = SalesProject.objects.filter(sales_project_id=0) # to return empty queryset

        empty = [None, 0]

        # for month
        start = date.today().replace(day=1)
        working_kpi_qs = kpi_qs.filter(period=start, metric='month').values('lead_kpi', 'rate_kpi', 'rev_kpi', 'kpi_id')
        final_qs['month'] = working_kpi_qs[0] if len(working_kpi_qs) > 0 else empty_dict
        working_lead_qs = lead_qs.filter(created_date__gte=start).annotate(date=TruncMonth('created_date')).values('date')
        working_lead_qs = working_lead_qs.annotate(lead_count=Count('status',filter=Q(status="lead"))).annotate(client_count=Count('status',filter=Q(status="client")))
        working_lead_qs = working_lead_qs.annotate(conversion_rate=ExpressionWrapper(F('client_count') * 100.0 / (F('lead_count') + F('client_count')), output_field=FloatField()))
        final_qs['month']['client_count'] = working_lead_qs[0]['client_count'] if len(working_lead_qs) > 0 else 0
        final_qs['month']['lead_count'] = working_lead_qs[0]['lead_count'] if len(working_lead_qs) > 0 else 0
        final_qs['month']['conversion_rate'] = round(working_lead_qs[0]['conversion_rate'], 2) if len(working_lead_qs) > 0 else 0
        final_qs['month']['lead_progress'] = round(final_qs['month']['lead_count'] * 100.0 / final_qs['month']['lead_kpi'], 2) if final_qs['month']['lead_kpi'] not in empty else 0
        working_rev_qs = rev_qs.filter(completed_date__gte=start).annotate(date=TruncMonth('completed_date')).values('date')
        working_rev_qs = working_rev_qs.annotate(rev_sum=Coalesce(Sum(ExpressionWrapper(F('quotations__items__quantity') * F('quotations__items__block__sell_price'), output_field=FloatField())), 0))
        final_qs['month']['revenue'] = working_rev_qs[0]['rev_sum'] if len(working_rev_qs) > 0 else 0
        final_qs['month']['rev_progress'] = round(float(final_qs['month']['revenue']) * 100.0 / final_qs['month']['rev_kpi'], 2) if final_qs['month']['rev_kpi'] not in empty else 0

        # for quarter
        start = find_quarter(date.today().replace(day=1))
        working_kpi_qs = kpi_qs.filter(period=start, metric='quarter').values('lead_kpi', 'rate_kpi', 'rev_kpi', 'kpi_id')
        final_qs['quarter'] = working_kpi_qs[0] if len(working_kpi_qs) > 0 else empty_dict
        working_lead_qs = lead_qs.filter(created_date__gte=start).annotate(date=TruncQuarter('created_date')).values('date')
        working_lead_qs = working_lead_qs.annotate(lead_count=Count('status',filter=Q(status="lead"))).annotate(client_count=Count('status',filter=Q(status="client")))
        working_lead_qs = working_lead_qs.annotate(conversion_rate=ExpressionWrapper(F('client_count') * 100.0 / (F('lead_count') + F('client_count')), output_field=FloatField()))
        final_qs['quarter']['client_count'] = working_lead_qs[0]['client_count'] if len(working_lead_qs) > 0 else 0
        final_qs['quarter']['lead_count'] = working_lead_qs[0]['lead_count'] if len(working_lead_qs) > 0 else 0
        final_qs['quarter']['conversion_rate'] = round(working_lead_qs[0]['conversion_rate'], 2) if len(working_lead_qs) > 0 else 0
        final_qs['quarter']['lead_progress'] = round(final_qs['quarter']['lead_count'] * 100.0 / final_qs['quarter']['lead_kpi'], 2) if final_qs['quarter']['lead_kpi'] not in empty else 0
        working_rev_qs = rev_qs.filter(completed_date__gte=start).annotate(date=TruncQuarter('completed_date')).values('date')
        working_rev_qs = working_rev_qs.annotate(rev_sum=Coalesce(Sum(ExpressionWrapper(F('quotations__items__quantity') * F('quotations__items__block__sell_price'), output_field=FloatField())), 0))
        final_qs['quarter']['revenue'] = working_rev_qs[0]['rev_sum'] if len(working_rev_qs) > 0 else 0
        final_qs['quarter']['rev_progress'] = round(float(final_qs['quarter']['revenue']) * 100.0 / final_qs['quarter']['rev_kpi'], 2) if final_qs['quarter']['rev_kpi'] not in empty else 0

        # for year
        start = date.today().replace(day=1, month=1)
        working_kpi_qs = kpi_qs.filter(period=start, metric='year').values('lead_kpi', 'rate_kpi', 'rev_kpi', 'kpi_id')
        final_qs['year'] = working_kpi_qs[0] if len(working_kpi_qs) > 0 else empty_dict
        working_lead_qs = lead_qs.filter(created_date__gte=start).annotate(date=TruncYear('created_date')).values('date')
        working_lead_qs = working_lead_qs.annotate(lead_count=Count('status',filter=Q(status="lead"))).annotate(client_count=Count('status',filter=Q(status="client")))
        working_lead_qs = working_lead_qs.annotate(conversion_rate=ExpressionWrapper(F('client_count') * 100.0 / (F('lead_count') + F('client_count')), output_field=FloatField()))
        final_qs['year']['client_count'] = working_lead_qs[0]['client_count'] if len(working_lead_qs) > 0 else 0
        final_qs['year']['lead_count'] = working_lead_qs[0]['lead_count'] if len(working_lead_qs) > 0 else 0
        final_qs['year']['conversion_rate'] = round(working_lead_qs[0]['conversion_rate'], 2) if len(working_lead_qs) > 0 else 0
        final_qs['year']['lead_progress'] = round(final_qs['year']['lead_count'] * 100.0 / final_qs['year']['lead_kpi'], 2) if final_qs['year']['lead_kpi'] not in empty else 0
        working_rev_qs = rev_qs.filter(completed_date__gte=start).annotate(date=TruncYear('completed_date')).values('date')
        working_rev_qs = working_rev_qs.annotate(rev_sum=Coalesce(Sum(ExpressionWrapper(F('quotations__items__quantity') * F('quotations__items__block__sell_price'), output_field=FloatField())), 0))
        final_qs['year']['revenue'] = working_rev_qs[0]['rev_sum'] if len(working_rev_qs) > 0 else 0
        final_qs['year']['rev_progress'] = round(float(final_qs['year']['revenue']) * 100.0 / final_qs['year']['rev_kpi'], 2) if final_qs['year']['rev_kpi'] not in empty else 0

        serializer = KPISerializer(final_qs)

        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        group = self.request.query_params.get('group')
        metric = self.request.query_params.get('metric')
        period = date.today().replace(day=1) if metric == 'month' else find_quarter(date.today().replace(day=1)) if metric == 'quarter' else date.today().replace(day=1, month=1)

        request.data['metric'] = metric
        request.data['period'] = period
        request.data['group'] = group

        if group == 'department':
            department = UserProfile.objects.get(user=self.request.user).department
            d = department.all()[0].department_id
            request.data['department'] = d

        elif group == 'individual':
            user = UserProfile.objects.get(user=self.request.user).id
            request.data['creator'] = user

        serializer = KPIModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        obj = self.get_object(self.request.query_params.get('pk'))
        serializer = KPIModelSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self, pk):
        try:
            return KPI.objects.get(kpi_id=pk)
        except KPI.DoesNotExist:
            return Http404

'''class LeadKPIView(APIView):

    def get(self, request):
        department = UserProfile.objects.get(user=self.request.user).department

        # remember to change this
        department = department.all()[0]

        start = date.today().replace(day=1)

        end = start + relativedelta(months=+1, days=-1)

        this_month = date.today().month

        kpi_qs = LeadKPI.objects.get(department=department, metric='month', period=start).kpi

        lead_qs = CustomerInformation.objects.filter(salesDepartment=department).filter(created_date__range=(start,end)).count()

        qs = {'kpi': kpi_qs, 'current': lead_qs, 'percentage': (lead_qs / kpi_qs) * 100}

        serializer = LeadKPISerializer(qs)

        return Response(serializer.data)'''

'''class RevenueKPIView(APIView):

    def get(self, request):
        department = UserProfile.objects.get(user=self.request.user).department

        # remember to change this
        department = department.all()[0]

        start = date.today().replace(day=1)

        end = start + relativedelta(months=+1, days=-1)

        this_month = date.today().month

        try:

            kpi_qs = RevenueKPI.objects.get(department=department, metric='month', period=start).kpi

        except:

            return Response('not found')

        lead_qs = SalesProject.objects.filter(sales_department=department).filter(creation_date__range=(start,end)).aggregate(Sum('sales_project_est_rev'))['sales_project_est_rev__sum']

        qs = {'kpi': kpi_qs, 'current': lead_qs}

        serializer = RevenueKPISerializer(qs)

        return Response(serializer.data)'''

def quarter_format(qs, date_input, date_output):
    for q in qs:
        year = int(q[date_input].year)
        if date(year, 1, 1) <= q[date_input] <= date(year, 3, 31):
            q[date_output] = "Q1 " + q[date_input].strftime("%Y")
        elif date(year, 4, 1) <= q[date_input] <= date(year, 6, 30):
            q[date_output] = "Q2 " + q[date_input].strftime("%Y")
        elif date(year, 7, 1) <= q[date_input] <= date(year, 9, 30):
            q[date_output] = "Q3 " + q[date_input].strftime("%Y")
        elif date(year, 10, 1) <= q[date_input] <= date(year, 12, 31):
            q[date_output] = "Q4 " + q[date_input].strftime("%Y")
    return qs

def missing_dates(qs, metric, date_field, empty_dict, start_date, end_date):

    months = 1 if metric == 'month' else 3 if metric == 'quarter' else 12

    new_qs = []

    if len(qs) > 0:

        date = start_date
        i = 0


        while date <= end_date:
            if date == qs[i][date_field]:
                new_qs.append(qs[i])
                if i < len(qs) - 1:
                    i += 1
            else:
                new_dict = copy.deepcopy(empty_dict)
                new_dict[date_field] = date
                new_qs.append(new_dict)                
            date += relativedelta(months=+months) 

    return new_qs


class ProjectConvertedCountView(APIView):

    # to clean up: 
    # the way metric is handled (now it is case by case which is inefficent)
    # the department data is cluttered after with the user loop (and essentially the same code repeated) + wise to put it together like this? or is there a better way to shape the data
    # is there a better way to handle data in general? seems very manual and only uses django filtering for initial part, but afterwards is storing thru {} and [].

    def get(self, request):

        start = datetime.strptime(self.request.query_params.get('start'), '%Y-%m-%d').date()
        end = datetime.strptime(self.request.query_params.get('end'), '%Y-%m-%d').date()
        metric = self.request.query_params.get('metric')
        group = self.request.query_params.get('group')

        d = SalesDepartment.objects.get(department_id = self.request.query_params.get('select'))
        qs = SalesProject.objects.filter(sales_department=d)

        # remember to change to be able to specify department in api call (probably best to do it once for all) 

        if metric == 'month':
            qs = qs.filter(creation_date__range=(start,end)).annotate(date=TruncMonth('creation_date')).values('date')

        elif metric == 'quarter':
            qs.filter(creation_date__range=(start,end)).annotate(date=TruncQuarter('creation_date')).values('date')

        elif metric == 'year':
            qs = qs.filter(creation_date__year__range=(start.year,end.year)).annotate(date=TruncYear('creation_date')).values('date')

        qs = qs.annotate(production=Count('project_status',filter=(Q(project_status__actualstate__state_type="In Production") & Q(project_status__actualstate__workflow_type="Project"))))
        qs = qs.annotate(created=Count('project_status',filter=(Q(project_status__actualstate__state_type="Created") & Q(project_status__actualstate__workflow_type="Project"))))
        qs = qs.annotate(completed=Count('project_status',filter=(Q(project_status__actualstate__state_type="Completed") & Q(project_status__actualstate__workflow_type="Project"))))
        qs = qs.annotate(deactivated=Count('project_status',filter=(Q(project_status__actualstate__state_type="Deactivated") & Q(project_status__actualstate__workflow_type="Project"))))
        qs = qs.annotate(conversion_rate=ExpressionWrapper(F('production') * 100.0 / (F('created') + F('production')), output_field=FloatField()))

        if metric == 'month':
            qs = missing_dates(qs, 'month', 'date', {'production': 0, 'created': 0, 'deactivated': 0, 'completed': 0, 'conversion_rate': 0}, start, end)
            for q in qs:
                q['formatted_date'] = q['date'].strftime("%b %Y")

        elif metric == 'quarter':
            qs = missing_dates(qs, 'quarter', 'date', {'lead_count': 0, 'client_count': 0, 'conversion_rate': 0}, start, end)
            qs = quarter_format(qs, 'date', 'formatted_date')

        elif metric == 'year':        
            qs = missing_dates(qs, 'year', 'date', {'lead_count': 0, 'client_count': 0, 'conversion_rate': 0}, start, end)
            for q in qs:
                q['formatted_date'] = q['date'].strftime("%Y")

        serializer = ProjectConvertedSerializer(qs, many=True)

        return Response(serializer.data)


class TicketCountView(APIView):

    # to clean up: 
    # the way metric is handled (now it is case by case which is inefficent)
    # the department data is cluttered after with the user loop (and essentially the same code repeated) + wise to put it together like this? or is there a better way to shape the data
    # is there a better way to handle data in general? seems very manual and only uses django filtering for initial part, but afterwards is storing thru {} and [].

    def get(self, request):

        start = datetime.strptime(self.request.query_params.get('start'), '%Y-%m-%d').date()
        end = datetime.strptime(self.request.query_params.get('end'), '%Y-%m-%d').date()
        metric = self.request.query_params.get('metric')
        group = self.request.query_params.get('group')
        priority = self.request.query_params.get('priority')
        nature = self.request.query_params.get('nature')
        source = self.request.query_params.get('source')

        d = SalesDepartment.objects.get(department_id = self.request.query_params.get('select'))
        qs = Ticket.objects.filter(Q(salesProject__sales_department=d) | Q(customerPoc__customerInformation__salesDepartment=d))

        # remember to change to be able to specify department in api call (probably best to do it once for all) 

        if metric == 'month':
            qs = qs.filter(date_created__range=(start,end)).annotate(date=TruncMonth('date_created')).values('date')

        elif metric == 'quarter':
            qs.filter(date_created__range=(start,end)).annotate(date=TruncQuarter('date_created')).values('date')

        elif metric == 'year':
            qs = qs.filter(date_created__year__range=(start.year,end.year)).annotate(date=TruncYear('date_created')).values('date')

        filter_completed = Q(ticket_status__actualstate__state_type="Completed")
        filter_ticket = Q(ticket_status__actualstate__workflow_type="Ticket")
        filter_priority = Q(priority=priority)
        filter_nature = Q(nature=nature)
        filter_source = Q(source=source)

        qs = qs.annotate(complete=Count('ticket_status',filter=(filter_completed & filter_ticket & filter_priority & filter_nature & filter_source)))
        qs = qs.annotate(incomplete=Count('ticket_status',filter=(~filter_completed & filter_ticket & filter_priority & filter_nature & filter_source)))

        print(qs)

        if metric == 'month':
            qs = missing_dates(qs, 'month', 'date', {'complete': 0, 'incomplete': 0}, start, end)
            for q in qs:
                q['formatted_date'] = q['date'].strftime("%b %Y")

        elif metric == 'quarter':
            qs = missing_dates(qs, 'quarter', 'date', {'complete': 0, 'incomplete': 0}, start, end)
            qs = quarter_format(qs, 'date', 'formatted_date')

        elif metric == 'year':        
            qs = missing_dates(qs, 'year', 'date', {'complete': 0, 'incomplete': 0}, start, end)
            for q in qs:
                q['formatted_date'] = q['date'].strftime("%Y")

        serializer = TicketConvertedSerializer(qs, many=True)

        return Response(serializer.data)


class CustomerConvertedCountView(APIView):

    # to clean up: 
    # the way metric is handled (now it is case by case which is inefficent)
    # the department data is cluttered after with the user loop (and essentially the same code repeated) + wise to put it together like this? or is there a better way to shape the data
    # is there a better way to handle data in general? seems very manual and only uses django filtering for initial part, but afterwards is storing thru {} and [].

    def get(self, request):

        start = datetime.strptime(self.request.query_params.get('start'), '%Y-%m-%d').date()
        end = datetime.strptime(self.request.query_params.get('end'), '%Y-%m-%d').date()
        metric = self.request.query_params.get('metric')
        group = self.request.query_params.get('group')

        if group == 'department':
            d = SalesDepartment.objects.get(department_id = self.request.query_params.get('select'))
            qs = CustomerInformation.objects.filter(salesDepartment=d)

        elif group == 'individual':
            user = UserProfile.objects.get(user=self.request.user)
            qs = CustomerInformation.objects.filter(creator=user)

        # remember to change to be able to specify department in api call (probably best to do it once for all) 

        if metric == 'month':
            qs = qs.filter(created_date__range=(start,end)).annotate(date=TruncMonth('created_date')).values('date')
            qs = qs.annotate(lead_count=Count('status',filter=Q(status="lead"))).annotate(client_count=Count('status',filter=Q(status="client")))
            qs = qs.annotate(conversion_rate=ExpressionWrapper(F('client_count') * 100.0 / (F('lead_count') + F('client_count')), output_field=FloatField()))
            print(qs)
            qs = missing_dates(qs, 'month', 'date', {'lead_count': 0, 'client_count': 0, 'conversion_rate': 0}, start, end)
            for q in qs:
                q['formatted_date'] = q['date'].strftime("%b %Y")

        elif metric == 'quarter':
            qs = qs.filter(created_date__range=(start,end)).annotate(date=TruncQuarter('created_date')).values('date')
            qs = qs.annotate(lead_count=Count('status',filter=Q(status="lead"))).annotate(client_count=Count('status',filter=Q(status="client")))
            qs = qs.annotate(conversion_rate=ExpressionWrapper(F('client_count') * 100.0 / (F('lead_count') + F('client_count')), output_field=FloatField()))
            qs = missing_dates(qs, 'quarter', 'date', {'lead_count': 0, 'client_count': 0, 'conversion_rate': 0}, start, end)
            qs = quarter_format(qs, 'date', 'formatted_date')

        elif metric == 'year':
            qs = qs.filter(created_date__year__range=(start.year,end.year)).annotate(date=TruncYear('created_date')).values('date')
            qs = qs.annotate(lead_count=Count('status',filter=Q(status="lead"))).annotate(client_count=Count('status',filter=Q(status="client")))
            qs = qs.annotate(conversion_rate=ExpressionWrapper(F('client_count') * 100.0 / (F('lead_count') + F('client_count')), output_field=FloatField()))
            qs = missing_dates(qs, 'year', 'date', {'lead_count': 0, 'client_count': 0, 'conversion_rate': 0}, start, end)
            for q in qs:
                q['formatted_date'] = q['date'].strftime("%Y")

        serializer = CustomerConvertedSerializer(qs, many=True)

        return Response(serializer.data)


class EstimatedRevenueView(APIView):

    def get(self, request):

        d = SalesDepartment.objects.get(department_id = self.request.query_params.get('select'))
        #qs = SalesProject.objects.filter(sales_department=d).annotate(rev_sum=Coalesce(Sum('quotations__quotation', filter=Q(quotations__decision='approved', quotations__direction='sq')), 0))
        qs = SalesProject.objects.filter(sales_department=d).annotate(rev_sum=Coalesce(Sum(ExpressionWrapper(F('quotations__items__quantity') * F('quotations__items__block__sell_price'), output_field=FloatField())), 0))
        qs = qs.values('rev_sum', 'sales_project_name', 'sales_project_id', est_rev=F('sales_project_est_rev'), rev_rate=ExpressionWrapper(F('rev_sum') * 100.0 / F('est_rev'), output_field=FloatField()))

        serializer = EstimatedRevenueSerializer(qs, many=True)

        return Response(serializer.data)

def find_kpi(qs, metric, date_field, sum_field, kpi_field, rate_field, department):
    for q in qs:
        try:    
            q[kpi_field] = KPI.objects.get(metric=metric, period=q[date_field], department=department).rev_kpi
            q[rate_field] = float(q[sum_field]) * 100.0 / float(q[kpi_field])
        except:
            q[kpi_field] = 0
            q[rate_field] = 0
            continue
    return qs

class ActualRevenueView(APIView):

    def get(self, request):

        start = datetime.strptime(self.request.query_params.get('start'), '%Y-%m-%d').date()
        end = datetime.strptime(self.request.query_params.get('end'), '%Y-%m-%d').date()
        metric = self.request.query_params.get('metric')

        d = SalesDepartment.objects.get(department_id = self.request.query_params.get('select'))
        qs = SalesProject.objects.filter(sales_department=d)

        if metric == 'month':
            qs = qs.filter(completed_date__range=(start,end)).annotate(date=TruncMonth('completed_date')).values('date')
            qs = qs.annotate(rev_sum=Coalesce(Sum(ExpressionWrapper(F('quotations__items__quantity') * F('quotations__items__block__sell_price'), output_field=FloatField())), 0))
            qs = missing_dates(qs, 'month', 'date', {'rev_sum': 0}, start, end)
            qs = find_kpi(qs, 'month', 'date', 'rev_sum', 'kpi', 'rev_rate', d)
            for q in qs:
                q['formatted_date'] = q['date'].strftime("%b %Y")
                
        elif metric == 'quarter':
            qs = qs.filter(completed_date__range=(start,end)).annotate(date=TruncQuarter('completed_date')).values('date')
            qs = qs.annotate(rev_sum=Coalesce(Sum(ExpressionWrapper(F('quotations__items__quantity') * F('quotations__items__block__sell_price'), output_field=FloatField())), 0))
            qs = missing_dates(qs, 'quarter', 'date', {'rev_sum': 0}, start, end)
            qs = find_kpi(qs, 'quarter', 'date', 'rev_sum', 'kpi', 'rev_rate', d)
            qs = quarter_format(qs, 'date', 'formatted_date')

        elif metric == 'year':
            qs = qs.filter(completed_date__year__range=(start.year,end.year)).annotate(date=TruncYear('completed_date')).values('date')
            qs = qs.annotate(rev_sum=Coalesce(Sum(ExpressionWrapper(F('quotations__items__quantity') * F('quotations__items__block__sell_price'), output_field=FloatField())), 0))
            qs = missing_dates(qs, 'year', 'date', {'rev_sum': 0}, start, end)
            qs = find_kpi(qs, 'year', 'date', 'rev_sum', 'kpi', 'rev_rate', d)
            for q in qs:
                q['formatted_date'] = q['date'].strftime("%Y")


        serializer = ActualRevenueSerializer(qs, many=True)

        return Response(serializer.data)


def find_quarter(current_date):
    if date(current_date.year, 1, 1) <= current_date <= date(current_date.year, 3, 31):
        output = current_date.replace(month=1)
    elif date(current_date.year, 4, 1) <= current_date <= date(current_date.year, 6, 30):
        output = current_date.replace(month=4)
    elif date(current_date.year, 7, 1) <= current_date <= date(current_date.year, 9, 30):
        output = current_date.replace(month=7)
    elif date(current_date.year, 10, 1) <= current_date <= date(current_date.year, 12, 31):
        output = current_date.replace(month=10)

    return output

def get_dates_range(metric, start, end):

    qs = []

    if metric == 'month':
        current_date = start
        while current_date <= end:
            qs.append({'start': current_date, 'end': current_date + relativedelta(months=+1, days=-1), 'formatted_date': current_date.strftime("%b %Y")})
            current_date += relativedelta(months=+1)

    elif metric == 'quarter':
        current_date = start
        while current_date <= end:
            qs.append({'start': current_date, 'end': current_date + relativedelta(months=+3, days=-1)})
            current_date += relativedelta(months=+3)
        qs = quarter_format(qs, 'start', 'formatted_date')

    elif metric == 'year':
        current_date = start
        while current_date <= end:
            qs.append({'start': current_date, 'end': current_date + relativedelta(years=+1, days=-1), 'formatted_date': current_date.strftime("%Y")})
            current_date += relativedelta(years=+1)

    return qs

class DateRangeView(APIView):

    def get(self, request):

        data = {
            'customerinformation': CustomerInformation,
            'salesproject': SalesProject,
            'ticket': Ticket
        }
        model = self.request.query_params.get('model')
        field = self.request.query_params.get('field')
        metric = self.request.query_params.get('metric')

        start = data[model].objects.exclude(**{field: None})
        if len(start) > 0:
            if metric == 'month':
                start = start.annotate(date=TruncMonth(field)).order_by(field).first().date
                end = date.today().replace(day=1)

            elif metric == 'quarter':
                start = start.annotate(date=TruncQuarter(field)).order_by(field).first().date
                end = find_quarter(date.today().replace(day=1))

            elif metric == 'year':
                start = start.annotate(date=TruncYear(field)).order_by(field).first().date
                end = date.today().replace(day=1, month=1)

            qs = get_dates_range(metric, start, end)

        else:
            qs = []


        serializer = DateRangeSerializer(qs, many=True)

        return Response(serializer.data)







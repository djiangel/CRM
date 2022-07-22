from django.urls import path
from .views import *
from django.conf.urls import url, include



urlpatterns = [
				path('customer-conversion/', CustomerConversionView.as_view()),
				path('project-converted/', ProjectConvertedCountView.as_view()),
				path('customer-source/', CustomerSourceView.as_view()),
				path('customer-country/', CustomerCountryCountView.as_view()),
				path('kpi/', KPIView.as_view()),
				path('estimated-revenue/', EstimatedRevenueView.as_view()),
				path('actual-revenue/', ActualRevenueView.as_view()),
				path('customer-converted/', CustomerConvertedCountView.as_view()),
				path('ticket-converted/', TicketCountView.as_view()),
				path('date-range/', DateRangeView.as_view()),
				path('customer-analytics/<pk>/', CustomerAnalyticsView.as_view())
			  ]
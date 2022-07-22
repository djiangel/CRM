from django.urls import path

from .views import *
from .project.views import *
from rest_framework.routers import DefaultRouter
from django.conf.urls import url, include



urlpatterns = [
				path('notifications/typecreate/', NotificationTypeCreateView.as_view()),
				path('ticket/createfromcms/', TicketCMSApi.as_view())
			  ]

router = DefaultRouter()
router.register('tasks', TaskViewSet, basename='tasks')
urlpatterns += router.urls

router = DefaultRouter()
router.register('notifications', NotificationsObtainView, basename='notification_obtain')
urlpatterns += router.urls

router = DefaultRouter()
router.register('userprofile', UserProfileViewSet, basename='userprofile')
urlpatterns += router.urls

router = DefaultRouter()
router.register('customer-information', CustomerInformationViewSet, basename='customer-information')
urlpatterns += router.urls

router.register('sales-department', SalesDepartmentViewSet, basename='sales-department')
urlpatterns += router.urls

router.register('vendor-information', VendorInformationViewSet, basename='vendor-information')
urlpatterns += router.urls

router.register('user-profile', UserProfileViewSet, basename='sales-extra')
urlpatterns += router.urls

router.register('sales-project', SalesProjectViewSet, basename='sales-project')
urlpatterns += router.urls

router.register('sales-notation', SalesNotationViewSet, basename='sales-notation')
urlpatterns += router.urls

router.register('customer-requirement', CustomerRequirementViewSet, basename='customer-requirement')
urlpatterns += router.urls

router.register('quotation', QuotationViewSet, basename='quotation')
urlpatterns += router.urls

router.register('country', CountryViewSet, basename='country')
urlpatterns += router.urls

router.register('lead-source', LeadSourceViewSet, basename='lead-source')
urlpatterns += router.urls

router.register('item', ItemViewSet, basename='item')
urlpatterns += router.urls

router.register('competitor-item', CompetitorItemViewSet, basename='competitor-item')
urlpatterns += router.urls

router.register('budget-block', BudgetBlockViewSet, basename='budget-block')
urlpatterns += router.urls

router.register('ticket', TicketViewSet, basename='ticket')
urlpatterns += router.urls

router.register('customer-poc', CustomerPocViewSet, basename='customer-poc')
urlpatterns += router.urls

router.register('vendor-poc', VendorPocViewSet, basename='vendor-poc')
urlpatterns += router.urls


router.register('quotation-item', QuotationItemViewSet, basename='quotation-item')
urlpatterns += router.urls

router.register('assigned-email', AssignedEmailViewSet, basename='assigned-email')
urlpatterns += router.urls

router.register('revenue-forecast', RevenueForecastViewSet, basename='revenue-forecast')
urlpatterns += router.urls

router.register('actual-state', ActualStateViewSet, basename='actual-state')
urlpatterns += router.urls




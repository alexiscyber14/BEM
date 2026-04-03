from django.urls import path, re_path
from .views import *
from . import views
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView
from django.conf.urls import handler404

urlpatterns = [
    path('', views.home, name='home'),
    path('about-broken-elevator-media', views.about, name='about'),  
    path('broken-elevator-media-services', views.services, name='services'),  
    path('explore-our-portfolio', views.portfolio, name='portfolio'),  
    #path('portfolio-temp', views.portfolio_temp, name='port_temp'),  
    path('explore-our-hall-of-frames', views.hall, name='hall'),  
    path('hall/data/', views.hall_data, name='hall_data'),
    path('broken-elevator-media-events', views.events, name='events'),

        # AJAX: Get full blog content + comments for modal
    path('broken-elevator-media-blogs', views.blog, name='blog'), 
    path('blog-content/<int:post_id>/', views.blog_content, name='blog_content'),
    path('contact/', views.contact, name='contact'),
    path('booking/', views.booking, name='booking'),
    ##################forms
    path('submit-offer/', views.submit_offer_booking, name='submit_offer_booking'),
    path('submit-contact/', views.submit_contact_data, name='submit_contact_data'),
    path('submit-booking/', views.submit_booking_data, name='submit_booking_data'),
    path('submit-service/', views.submit_service_data, name='submit_service_data'),

]

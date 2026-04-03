from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import *
from .serializers import *
from django.shortcuts import get_object_or_404
import base64
import uuid
from django.core.files.base import ContentFile
from PIL import Image
from io import BytesIO
from django.core.files import File
import os
from django.conf import settings
from django.apps import apps
import random
import string
from datetime import datetime
from django.core.mail import send_mail
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta  # pip install python-dateutil
from django.shortcuts import render,redirect
from django.http import JsonResponse
from django.utils.html import strip_tags
from django.utils.text import Truncator
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import re
from django.core.mail import EmailMessage
import base64
import uuid
from django.contrib.auth.models import User
from django.contrib.auth.models import AnonymousUser
from django.views.decorators.csrf import csrf_exempt
import json
from django.shortcuts import render, get_object_or_404
from django.utils.html import strip_tags # Import this to clean HTML from excerpts
from django.db.models import Q
from django.template.loader import render_to_string


def home(request):
    offers = Discounts.objects.all()\
        .prefetch_related('discount_packs')\
        .order_by('created_at')
    context = {
        'offers':offers,
    }
    return render(request, 'home.html', context)

def about(request):
    context = {
    }
    return render(request, 'about.html', context)

def services(request):
    our_services = Services.objects.all()\
        .prefetch_related('service_packs')\
        .order_by('created_at')
    context = {
        'services':our_services,
    }
    return render(request, 'services.html', context)

def booking(request):
    context = {
    }
    return render(request, 'booking.html', context)



def portfolio(request):
    categories = Category.objects.filter(
    parent__isnull=True,    # not a child of another category
    children__isnull=True   # has no children
    )
    obj_id = request.GET.get("id")
    videos = VideoContent.objects.none()
    photos = ImageContent.objects.none()
    is_video = False
    is_photo = False
    if obj_id:
        videos = VideoContent.objects.filter(category=obj_id).order_by("-id")[:40]
        if videos:
            is_video = True
        photos = ImageContent.objects.filter(category=obj_id).prefetch_related('extra_images').order_by("-id")[:500]
            
        if photos:
            is_photo = True
    else:
        videos = VideoContent.objects.filter(category__name="Commercials").order_by("-id")[:40]
        if videos:
            is_video = True
    context = {
        "categories": categories,
        "is_video": videos.exists(),
        "is_photo": photos.exists(),
        "videos": videos,
        "photos": photos,
    }
    
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, "portfolio_items.html", context)

    return render(request, "portfolio.html", context)



def hall(request):
    categories = Category.objects.filter(
        parent__isnull=True,   # top-most parent
        children__isnull=False  # has at least one child
    ).distinct()
    category = Category.objects.get(name="Episodes")
    subcategories = category.children.all()
    videos = VideoContent.objects.filter(
        Q(category=category) | Q(category__in=subcategories)
    )    
    context = {
        "categories": categories,
        "videos": videos,
    }
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return render(request, "hall_vids.html", context)
    return render(request, 'hall.html', context)



def get_all_videos(category_id):
    categories = Category.objects.filter(Q(id=category_id) | Q(parent_id=category_id))
    return VideoContent.objects.filter(category__in=categories).distinct()

def get_all_photos(category_id):
    categories = Category.objects.filter(Q(id=category_id) | Q(parent_id=category_id))
    return ImageContent.objects.filter(category__in=categories).distinct()


def hall_data(request):
    obj_type = request.GET.get('type')
    obj_id = request.GET.get('id')
    data = []
    videos = []
    photos =[]
    if obj_type == "category":
        category = get_object_or_404(Category, id=obj_id)
        for child in category.children.all():
            data.append({
                "id": child.id, 
                "title": child.name, 
                "slug": child.slug
            })
        videos = get_all_videos(obj_id)
        photos = get_all_photos(obj_id)
    elif obj_type == "child_category":
        data = [] 
        videos = VideoContent.objects.filter(category_id=obj_id)
        photos = ImageContent.objects.filter(category_id=obj_id)
    html_grid = render_to_string("hall_vids.html", {"videos": videos, "photos":photos}, request=request)
    return JsonResponse({
        "items": data,   # The new buttons for the side nav
        "html": html_grid # The new video cards for the main area
    })




def events(request):
    categories = Category.objects.all()
    videos = VideoContent.objects.all()
    photography = ImageContent.objects.filter(is_event_photograpghy=True)
    recaps = videos.filter(is_event_recap=True)
    vids = videos.filter(is_event_video_highlight=True)
    context = {
        "categories": categories,
        "recaps": recaps,
        "photos": photography,
        "highlights": vids,
    }
    return render(request, 'events.html', context)






def blog(request):
    """Render the professional news feed or return filtered JSON"""
    category = request.GET.get('category', 'all')
    
    if category == 'all':
        blogs = BlogPost.objects.all()
    else:
        # Matches the slugs: 'insights', 'interviews', etc.
        blogs = BlogPost.objects.filter(category=category)
    
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        blog_list = []
        for b in blogs:
            blog_list.append({
                'id': b.id,
                'title': b.title,
                # Ensure excerpt is clean of HTML tags for the grid
                'excerpt': strip_tags(b.excerpt)[:150] if b.excerpt else "",
                'thumbnail': b.imageURL,
                'category': b.get_category_display(), # Returns 'Industry Insights' instead of 'insights'
                'created_at': b.created_at.strftime("%b %d, %Y") if b.created_at else ""
            })
        return JsonResponse({'blogs': blog_list})
    
    return render(request, 'blog.html', {'blogs': blogs})

def blog_content(request, post_id):
    """Return only the article content for the cinematic modal"""
    blog = get_object_or_404(BlogPost, id=post_id)
    data = {
        'id': blog.id,
        'title': blog.title,
        'content': blog.content, # Full HTML content from HTMLField
        'author': blog.author,
        'date': blog.created_at.strftime("%B %d, %Y") if blog.created_at else ""
    }
    return JsonResponse(data)





def contact(request):
    """
    Render the contact page and handle form submissions.
    """
    if request.method == "POST":
        name = request.POST.get("name")
        company = request.POST.get("company", "")
        project_type = request.POST.get("project_type")
        budget = request.POST.get("budget")
        timeline = request.POST.get("timeline")
        email = request.POST.get("email")
        phone = request.POST.get("phone", "")
        message = request.POST.get("message", "")

        # Basic validation (can be enhanced)
        if not name or not project_type or not email:
            messages.error(request, "Please fill in all required fields.")
        else:
            # Save the inquiry
            inquiry = ContactInquiry.objects.create(
                name=name,
                company=company,
                project_type=project_type,
                budget=budget,
                timeline=timeline,
                email=email,
                phone=phone,
                message=message
            )
            messages.success(request, "Thank you! Your inquiry has been submitted.")
            return redirect('contact')  # Redirect to avoid resubmission on refresh

    return render(request, "contact.html", {})


#########forms
def submit_offer_booking(request):
    if request.method == "POST" and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        # 1. Capture Form Data
        offer_title = request.POST.get('offer_title')
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone', '')
        company = request.POST.get('company', '')
        message = request.POST.get('message', '')

        try:
            discount_obj = Discounts.objects.filter(title__icontains=offer_title).first()    
            booking = OfferBooking.objects.create(
                offer=discount_obj,
                name=name,
                email=email,
                phone=phone,
                company=company,
                message=message
            )

            # 4. Return "Super Neat" Success Response
            return JsonResponse({
                'success': True,
                'message': 'Production brief received successfully.',
                'booking_id': booking.id
            })

        except Exception as e:
            return JsonResponse({
                'success': False, 
                'error': str(e)
            }, status=400)

    return JsonResponse({'success': False, 'message': 'Invalid Request'}, status=405)



def submit_contact_data(request):
    # Check for AJAX and POST
    if request.method == "POST" and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        try:
            name = request.POST.get('name')
            phone = request.POST.get('phone')
            email = request.POST.get('email')
            company = request.POST.get('company')
            project_type = request.POST.get('project_type')
            budget = request.POST.get('budget')
            timeline = request.POST.get('timeline')
            brief = Contact.objects.create(
                name=name,
                phone=phone,
                email=email,
                company=company,
                project_type=project_type,
                budget=budget,
                timeline=timeline
            )
            return JsonResponse({
                'success': True, 
                'message': 'Message Submitted Successfully. We will get back to you shortly',
                'id': brief.id
            })
        except Exception as e:
            # Return specific error if something breaks during save
            return JsonResponse({
                'success': False, 
                'error': str(e)
            }, status=400)

    # Standard "Method Not Allowed" for non-AJAX/GET requests
    return JsonResponse({'success': False, 'message': 'Invalid Access'}, status=405)


def submit_booking_data(request):
    # Check for AJAX and POST
    if request.method == "POST" and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        try:
            name = request.POST.get('name')
            email = request.POST.get('email')
            phone = request.POST.get('phone')
            company = request.POST.get('company')
            project_category = request.POST.get('projectcat')
            task_specified = request.POST.get('task')
            message = request.POST.get('description')
            timeline = request.POST.get('timeline')
            budget = request.POST.get('budget')
            bkg = Booking.objects.create(
                name=name,
                email=email,
                phone=phone,
                company=company,
                project_category=project_category,
                task_specified=task_specified,
                message=message,
                budget=budget,
                timeline=timeline
            )
            return JsonResponse({
                'success': True, 
                'message': 'Message Submitted Successfully. We will get back to you shortly',
                'id': bkg.id
            })
        except Exception as e:
            # Return specific error if something breaks during save
            return JsonResponse({
                'success': False, 
                'error': str(e)
            }, status=400)

    # Standard "Method Not Allowed" for non-AJAX/GET requests
    return JsonResponse({'success': False, 'message': 'Invalid Access'}, status=405)


def submit_service_data(request):
    # Check for AJAX and POST
    if request.method == "POST" and request.headers.get('x-requested-with') == 'XMLHttpRequest':
        try:
            serv_title = request.POST.get('offer_title')
            name = request.POST.get('name')
            email = request.POST.get('email')
            phone = request.POST.get('phone')
            company = request.POST.get('company')
            budget = request.POST.get('budget')
            message = request.POST.get('message')
            timeline = request.POST.get('timeline')
            svc  = Services.objects.filter(title__icontains=serv_title).first()
            svc = ServiceInquiry.objects.create(
                service = svc,
                name=name,
                phone=phone,
                email=email,
                company=company,
                budget = budget,
                timeline=timeline,
                message =message,
            )
            return JsonResponse({
                'success': True, 
                'message': 'Message Submitted Successfully. We will get back to you shortly',
                'id': svc.id
            })
        except Exception as e:
            # Return specific error if something breaks during save
            return JsonResponse({
                'success': False, 
                'error': str(e)
            }, status=400)

    # Standard "Method Not Allowed" for non-AJAX/GET requests
    return JsonResponse({'success': False, 'message': 'Invalid Access'}, status=405)

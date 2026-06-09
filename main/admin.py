from django.contrib import admin
from .models import *
from django.utils.html import format_html
from mptt.admin import DraggableMPTTAdmin
# Inline for subcategories (optional)

@admin.register(Category)
class CategoryAdmin(DraggableMPTTAdmin):
    mptt_indent_field = "name"      # the field to indent by
    list_display = ("tree_actions", "indented_title", )
    list_display_links = ("indented_title",)
    search_fields = ("name", )


admin.site.register(Season)
admin.site.register(VideoContent)

class ImageContentExtraImageInline(admin.TabularInline):
    model = ImageContentExtarImage
    extra = 1  # number of empty forms to display
    fields = ('image', 'image_tag')
    readonly_fields = ('image_tag',)


@admin.register(ImageContent)
class ImageContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'season', 'is_featured', 'is_cover', 'is_highlight', 'created_at')
    inlines = [ImageContentExtraImageInline]

# Inline for BlogComment in BlogPost admin









#####SERVICES
class ServicePacksInline(admin.TabularInline):
    model = ServicePacks
    extra = 1 
    fields = ('title',)
@admin.register(Services)
class ServicesAdmin(admin.ModelAdmin):
    list_display = ('tag','number', 'title', 'starting_price', 'created_at')
    inlines = [ServicePacksInline]

####DISCOUNTS
class DiscountKitsInline(admin.TabularInline):
    model = DiscountKits
    extra = 1 
    fields = ('title',)
@admin.register(Discounts)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ('tag','title', 'discount_percentage', 'created_at')
    inlines = [DiscountKitsInline]



@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'created_at', 'updated_at')
    list_filter = ('category', 'created_at', 'updated_at')
    search_fields = ('title', 'content', 'author', 'tags')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)




@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'is_viewed', 'is_closed', 'created_at', 'updated_at')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'is_viewed', 'is_closed', 'created_at', 'updated_at')

@admin.register(OfferBooking)
class OfferBookingAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'is_viewed', 'is_closed', 'created_at', 'updated_at')


@admin.register(ServiceInquiry)
class ServiceInquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'is_viewed', 'is_closed', 'created_at', 'updated_at')




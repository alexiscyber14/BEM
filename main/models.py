from django.db import models
from django.utils.text import slugify
from mptt.models import MPTTModel, TreeForeignKey
from django.utils.html import mark_safe
from tinymce.models import HTMLField
# ---------- Main Category ----------
class Tags(models.Model):
    name = models.CharField(max_length=500)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    def __str__(self):
        return f"{self.name}"



class Category(MPTTModel):
    parent = TreeForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children'
    )
    name = models.CharField(max_length=500, unique=True)
    tag = models.ManyToManyField(
        'Tags',
        related_name='cat_tags',
        blank=True
    )
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    slug = models.SlugField(unique=True,max_length=200,  blank=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    # Use TreeForeignKey for parent
    class MPTTMeta:
        order_insertion_by = ['name']  # automatically orders tree by name

    class Meta:
        ordering = ['-created_at']
        verbose_name = "9.2: Category"
        verbose_name_plural = "9.2: Categories"
        unique_together = ('slug',)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ---------- Season ----------
class Season(models.Model):
    name = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    slug = models.SlugField(unique=True, max_length=200,  blank=True, editable=False)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    class Meta:
        verbose_name = "9.3: Season Cluster"
        verbose_name_plural = "9.3: Season Clusters"
        unique_together = ('slug',)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Season.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}"




class VideoContent(models.Model): 
    category = models.ForeignKey(Category, related_name='video_cat', on_delete=models.CASCADE)
    season = models.ForeignKey(Season, related_name='video_sn', on_delete=models.CASCADE, blank=True, null=True)
    title = models.CharField(max_length=500)
    embed_link = models.URLField(help_text="YouTube/Vimeo embed link")
    description = models.TextField(blank=True, null=True)
    credits_info = models.TextField(blank=True, null=True)
    speakers = models.TextField(blank=True, null=True)
    thumbnail = models.ImageField(upload_to='images/thumbnails/', blank=True, null=True)
    slug = models.SlugField(max_length=200, unique=True, blank=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    director = models.CharField(max_length=200, blank=True, null=True)
    producer = models.CharField(max_length=200, blank=True, null=True)
    production_company = models.CharField(max_length=200, blank=True, null=True)
    cinematographer = models.CharField(max_length=200, blank=True, null=True)
    editor = models.CharField(max_length=200, blank=True, null=True)
    runtime = models.DurationField(blank=True, null=True)
    release_date = models.DateField(blank=True, null=True)
    filming_location = models.CharField(max_length=255, blank=True, null=True)
    language = models.CharField(max_length=100, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_premiere = models.BooleanField(default=False)
    is_highlight = models.BooleanField(default=False)
    is_event_video = models.BooleanField(default=False)
    platform = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="YouTube, Vimeo, Netflix, Website, etc."
    )
    external_link = models.URLField(blank=True, null=True)
    festival_selection = models.BooleanField(default=False)
    awards = models.TextField(blank=True, null=True)
    is_event_recap = models.BooleanField(default=False)
    is_event_video_highlight = models.BooleanField(default=False)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        verbose_name = "8. Video Item"
        verbose_name_plural = "8. Video Items"
        unique_together = ('category', 'slug')

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1

            while VideoContent.objects.filter(category=self.category, slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


    @property
    def imageURL(self):
        try:
            url = self.thumbnail.url
        except:
            url = ''
        return url

    def image_tag(self):

        return mark_safe('<img src="{}" width="50" height="50"/>'.format(self.imageURL))
        image_tag.short_description = 'Image'




CON_CHOICES = (
        ("normal","normal"),
        ("tall","tall"),
        ("wide","wide"),
    )

class ImageContent(models.Model):
    category = models.ForeignKey(Category, related_name='img_cat', on_delete=models.CASCADE)
    season = models.ForeignKey(Season, related_name='img_sn', on_delete=models.CASCADE, blank=True, null=True)
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True, null=True)
    slug = models.SlugField(unique=True,max_length=200,  blank=True, editable=False)
    image = models.ImageField(upload_to='images/content/')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    photographer = models.CharField(max_length=200, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    captured_date = models.DateField(blank=True, null=True)
    camera = models.CharField(max_length=200, blank=True, null=True)
    lens = models.CharField(max_length=200, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_cover = models.BooleanField(default=False)
    is_highlight = models.BooleanField(default=False)
    copyright_owner = models.CharField(max_length=255, blank=True, null=True)
    usage_rights = models.TextField(blank=True, null=True)
    is_event_photograpghy = models.BooleanField(default=False)
    orientation = models.CharField(max_length=255, blank=True, null=True, choices=CON_CHOICES, default="normal")
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        verbose_name = "9. Image item"
        verbose_name_plural = "9. Image Items"
        unique_together = ('category', 'slug')

    @property
    def imageURL(self):
        try:
            url = self.image.url
        except:
            url = ''
        return url

    def image_tag(self):

        return mark_safe('<img src="{}" width="50" height="50"/>'.format(self.imageURL))
        image_tag.short_description = 'Image'


    def save(self, *args, **kwargs):

        if not self.slug and self.title:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1

            while ImageContent.objects.filter(category=self.category, slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title or f"Gallery Item {self.id}"




class ImageContentExtarImage(models.Model):
    main = models.ForeignKey(ImageContent, related_name='extra_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='images/content/')
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")   
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    def __str__(self):
        return f"Expense for {self.main.title}"

    @property
    def imageURL(self):
        try:
            url = self.image.url
        except:
            url = ''
        return url

    def image_tag(self):

        return mark_safe('<img src="{}" width="50" height="50"/>'.format(self.imageURL))
        image_tag.short_description = 'Image'




class BlogPost(models.Model):
    CATEGORY_CHOICES = [
        ('insights', 'Industry Insights'),
        ('interviews', 'Entrepreneur Interviews'),
        ('breakdowns', 'Production Breakdowns'),
        ('bts', 'Behind the Scenes'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, editable=False, unique=True, blank=True)
    category = models.CharField(max_length=500, choices=CATEGORY_CHOICES, default='insights',)
    thumbnail = models.ImageField(upload_to="images/thumbnails/",blank=True, null=True)
    # 1. ADDED EXCERPT: This is what shows on the grid cards
    excerpt = models.TextField(max_length=300, blank=True, null=True, help_text="A short teaser for the blog grid.")
    # 2. CONTENT: This is what shows in the modal
    content = content = HTMLField(blank=True, null=True)
    author = models.CharField(max_length=200, blank=True, null=True)
    tags = models.CharField(max_length=200, blank=True, null=True, help_text="Comma-separated")
    # Use auto_now for updated_at so it refreshes every time you save
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "9.1: Blog Item"
        verbose_name_plural = "9.1: Blog Items"
        unique_together = ('category', 'slug')
    
    def save(self, *args, **kwargs):
        # Handle Slug Generation
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # 3. AUTO-GENERATE EXCERPT: 
        # If you leave excerpt blank in admin, it takes the first 25 words of content
        if not self.excerpt and self.content:
                # Clean the HTML so the excerpt is pure text
                clean_text = strip_tags(self.content)
                words = clean_text.split()
                self.excerpt = " ".join(words[:25]) + "..."
                
        super().save(*args, **kwargs)

    
    def __str__(self):
        return self.title

    def tag_list(self):
        return [t.strip() for t in self.tags.split(",") if t.strip()]

    @property
    def imageURL(self):
        try:
            url = self.thumbnail.url
        except:
            url = ''
        return url

    def image_tag(self):

        return mark_safe('<img src="{}" width="50" height="50"/>'.format(self.imageURL))
        image_tag.short_description = 'Image'



class Booking(models.Model):
    name = models.CharField(max_length=200,blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=500, blank=True, null=True)
    company = models.CharField(max_length=200, blank=True, null=True)
    project_category = models.CharField(max_length=500, blank=True, null=True)
    task_specified = models.CharField(max_length=500, blank=True, null=True)
    message = models.TextField(blank=True, help_text="Optional message or details about your project")
    timeline = models.CharField(max_length=100,blank=True, null=True)
    budget = models.CharField(max_length=100,blank=True, null=True)
    is_viewed = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "2. Booking Inquiry"
        verbose_name_plural = "2. Booking Inquiries"

    def __str__(self):
        return f"{self.name} - {self.project_category}"



class Contact(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    company = models.CharField(max_length=200, blank=True, null=True)
    project_type = models.CharField(max_length=500, blank=True, null=True)
    budget = models.CharField(max_length=100, blank=True, null=True)
    timeline = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=500, blank=True, null=True)
    is_viewed = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "4. Contact Inquiry"
        verbose_name_plural = "5. Contact Inquiries"

    def __str__(self):
        return f"{self.name} - {self.project_type}"




class OfferBooking(models.Model):
    offer = models.ForeignKey('Discounts', related_name='our_offers', on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField(max_length=500)
    email = models.EmailField()
    phone = models.CharField(max_length=500, blank=True)
    company = models.CharField(max_length=500, blank=True)
    message = models.TextField(blank=True, help_text="Optional message or details about your project")
    is_viewed = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "3. Offer Inquiry"
        verbose_name_plural = "3. Offer Inquiries"

    def __str__(self):
        return f"{self.name}"




class ServiceInquiry(models.Model):
    service = models.ForeignKey('Services', related_name='inquiring_service', on_delete=models.CASCADE, blank=True, null=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    company = models.CharField(max_length=200, blank=True, null=True)
    budget = models.CharField(max_length=100, blank=True, null=True)
    timeline = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=500, blank=True, null=True)
    message = models.TextField(blank=True, help_text="Optional message or details about your project")
    is_viewed = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "1. Service Inquiry"
        verbose_name_plural = "1. Service Inquiries"

    def __str__(self):
        return f"{self.name}"





class Services(models.Model):
    tag = models.CharField(max_length=500, blank=True, null=True)
    number = models.CharField(max_length=500, blank=True, null=True)
    title = models.CharField(max_length=500,blank=True, null=True)
    starting_price = models.CharField(max_length=500, blank=True, null=True)
    background_video = models.FileField(
        upload_to='videos/backgrounds/',
        blank=True,
        null=True
    )
    background_image = models.ImageField(upload_to="images/backgrounds/",blank=True, null=True)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "6. Service"
        verbose_name_plural = "6. Services"

    def __str__(self):
        return mark_safe(f"{self.title}")

    @property
    def imageURL(self):
        try:
            url = self.background_image.url
        except:
            url = ''
        return url

    @property
    def videoURL(self):
        try:
            url = self.background_video.url
        except:
            url = ''
        return url

    def image_tag(self):

        return mark_safe('<img src="{}" width="50" height="50"/>'.format(self.imageURL))
        image_tag.short_description = 'Image'


class ServicePacks(models.Model):
    service = models.ForeignKey(Services, related_name='service_packs', on_delete=models.CASCADE, blank=True, null=True)
    title = models.CharField(max_length=500,blank=True, null=True)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Service Pack"
        verbose_name_plural = "Service Packs"

    def __str__(self):
        return f"{self.service.title} - {self.title}"


########DISCOUNTS
class Discounts(models.Model):
    service = models.ForeignKey(Services, related_name='discounted_service', on_delete=models.CASCADE, blank=True, null=True)
    title = models.CharField(max_length=500,blank=True, null=True)
    tag = models.CharField(max_length=500,blank=True, null=True)#weddings #music &arts #business & events
    discount_percentage = models.CharField(max_length=100, blank=True)
    discount_details = models.TextField( blank=True, null=True)
    button_tag = models.CharField(max_length=500,blank=True, null=True)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "7. Discount Offer"
        verbose_name_plural = "7. Discount Offers"

    def __str__(self):
        return mark_safe(f"{self.service.title} - {self.discount_percentage}")


class DiscountKits(models.Model):
    connect = models.ForeignKey(Discounts, related_name='discount_packs', on_delete=models.CASCADE, blank=True, null=True)
    title = models.CharField(max_length=500,blank=True, null=True)
    ordering = models.PositiveIntegerField(default=0, help_text="Manual ordering of inquiries")
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Discount kit"
        verbose_name_plural = "Discount Kits"

    def __str__(self):
        return f"{self.connect.title} - {self.title}"
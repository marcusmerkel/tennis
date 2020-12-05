from django.contrib import admin
from .models import User, TennisCourt, Reservation


class RegistrationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "court", "day", "start", "end")


# Register your models here.

admin.site.register(User)
admin.site.register(TennisCourt)
admin.site.register(Reservation, RegistrationAdmin)
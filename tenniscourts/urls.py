from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("week/<int:year>/<int:month>/<int:day>", views.week_matrix, name="week_matrix"),
    path("day/<int:year>/<int:month>/<int:day>", views.day_matrix, name="day_matrix"),
    path("free/<int:court>/<int:year>/<int:month>/<int:day>/<int:start_time>/<int:end_time>", views.free, name="free"),
    path("new", views.new_reservation, name="new_reservation"),
    path("del", views.del_reservation, name="del_reservation"),
    path("profile", views.profile, name="profile"),
]
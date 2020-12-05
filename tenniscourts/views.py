from datetime import date, time, timedelta, datetime

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt, csrf_protect, ensure_csrf_cookie

from .models import User, TennisCourt, Reservation

import json

# Create your views here.
@ensure_csrf_cookie
def index(request):
    return HttpResponse("Hi!")


@login_required
def week_matrix(request, year, month, day):
    # matrix will be a two-dimensional array:
    # one list per day, list values are the no. of available courts
    matrix = []
    
    # prefilling matrix
    for i in range(0, 7):
        a = []
        for j in range(0, 14):
            a.append(4)
        matrix.append(a)
    # matrix now looks like 
    # [[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
    #  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
    #  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
    #  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
    #  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
    #  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
    #  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]]

    res_per_day = []

    for d in range(0, 7):
        res = Reservation.objects.filter(day=date(year, month, day + d)).all()
        res_per_day.append(res)
    
    day_index = 0
    for dayres in res_per_day:
        for res in dayres:
            starthour = res.start.hour - 8
            endhour = res.end.hour - 8
            for hour_index in range(starthour, endhour):
                matrix[day_index][hour_index] -= 1
        day_index += 1

    return JsonResponse(matrix, safe=False)


@login_required
def day_matrix(request, year, month, day):
    # matrix will be a two-dimensional array:
    # one list per HOUR, list values are 
    # 1 for available and 0 for booked
    matrix = []

    for i in range(0, 14):
        a = []
        for j in range(1, 5):
            a.append(1)
        matrix.append(a)
    # matrix now looks like
    # [[1, 1, 1, 1], [1, 1, 1, 1], 
    # [1, 1, 1, 1], [1, 1, 1, 1], 
    # [1, 1, 1, 1], [1, 1, 1, 1], 
    # [1, 1, 1, 1], [1, 1, 1, 1], 
    # [1, 1, 1, 1], [1, 1, 1, 1], 
    # [1, 1, 1, 1], [1, 1, 1, 1], 
    # [1, 1, 1, 1], [1, 1, 1, 1]]

    res_per_court = []

    for c in range(1, 5):
        tc  = TennisCourt.objects.get(number=c)
        res = Reservation.objects.filter(day=date(year, month, day), court=tc).all()
        res_per_court.append(res)

    print(res_per_court)

    court_index = 0
    for court_res in res_per_court:
        for res in court_res:
            starthour = res.start.hour - 8
            endhour = res.end.hour - 8
            for hour_index in range(starthour, endhour):
                matrix[hour_index][court_index] -= 1
        court_index += 1

    return JsonResponse(matrix, safe=False)


@login_required
def free(request, court, year, month, day, start_time, end_time):
    # Should be GET if this is a collision check
    if request.method != "GET":
        return JsonResponse({"error": "Wrong method."}, status=403)

    conc = Reservation.objects.filter(court=court, day=date(year, month, day)).all()
    
    st = time(start_time)
    et = time(end_time)

    for res in conc:
        if (st < res.end and res.end <= et) or (st <= res.start and res.start < et) or (res.start < st and res.end > et):
            return JsonResponse({"free": False})
    return JsonResponse({"free": True})


@login_required
def new_reservation(request):
    #creating new reservation

    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    try:
        user = User.objects.get(username=request.user.username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User does not seem to exist."}, status=400)

    court = TennisCourt.objects.get(number=data.get("court"))
    d = data.get("date")
    day = date(int(d.split("-")[0]), int(d.split("-")[1]), int(d.split("-")[2]))
    start_time = time(hour=data.get("start_time"))
    end_time = time(hour=data.get("end_time"))

    res = Reservation(court=court, user=user, day=day, start=start_time, end=end_time)
    try:
        res.save()
    except ValidationError:
        return JsonResponse({"error": "Form Validation Error."}, status=302)

    return JsonResponse({"message": "Reservation successful"}, status=201)


@login_required
def del_reservation(request):
    # deleting reservation

    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    try:
        user = User.objects.get(username=request.user.username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User does not seem to exist."}, status=400)

    id = data.get("id")

    res = Reservation.objects.get(id=id, user=user)
    
    if res.delete()[0] == 1:
        return JsonResponse({"message": f"successfully deleted reservation with id {res.id}"}, status=202)
    else:
        return JsonResponse({"error": "could not delete"}, status=302)
    

@login_required
def profile(request):
    try:
        user = User.objects.get(username=request.user.username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User does not seem to exist."}, status=400)

    today = date.today()

    res_list = Reservation.objects.filter(user=user, day__gte=today).order_by("day", "start").all()

    return JsonResponse([res.serialize() for res in res_list], safe=False, status=200)
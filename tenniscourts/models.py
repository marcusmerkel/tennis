from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models

from datetime import date, time

# Create your models here.

class User(AbstractUser):
    pass


class TennisCourt(models.Model):
    number = models.IntegerField(unique=True)

    def __str__(self):
        return f"Court {self.number}"


class Reservation(models.Model):
    court = models.ForeignKey(TennisCourt, on_delete=models.CASCADE, related_name="bookings")
    user  = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reservations")
    day   = models.DateField()
    start = models.TimeField()
    end   = models.TimeField()

    def clean(self):
        today = date.today()
        if self.day < today:
            raise ValidationError('Please pick a day in the future.')
        elif self.day > date(today.year, today.month, today.day + 14):
            raise ValidationError('Please pick a day not more than two weeks from now.')
        if self.start >= self.end:
            raise ValidationError('Start should be before end.')
        if self.start < time(hour=8) or self.start > time(hour=21):
            raise ValidationError('Reservation has to start between 8:00 and 21:00.')
        if self.end < time(hour=9) or self.end > time(hour=22):
            raise ValidationError('Reservation has to end between 9:00 and 22:00.')
        conc = Reservation.objects.filter(day=self.day, court=self.court).all()
        for res in conc:
            if (res.start > self.start and res.start < self.end) or (res.end < self.end and res.end > self.start):
                print(f"self.start: {self.start}, res.end: {res.end}\nself.end: {self.end}, res.start: {res.start}")
                print(f"{res} is overlapping")
                raise ValidationError('Overlapping with another reservation.')
        return super().clean()

    def serialize(self):
        return {
            "id":    self.id,
            "court": self.court.number,
            "user":  self.user.username,
            "day":   self.day,
            "start": self.start,
            "end":   self.end,
        }

    def __str__(self):
        return f"On {self.day} by {self.user} for {self.court} from {self.start} to {self.end}"

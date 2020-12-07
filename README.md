# Tenniscourts

This is my final project for CS50's Web Programming with Python and JavaScript - a Tennis Court reservation app.

## Introduction

I made this web app because a friend of mine needed something like this. She recently got hold of a hall with four tennis courts and invited all her friends to play tennis. Soon enough all four tennis courts were either empty or overcrowded - or something inbetween. As the hall is located somewhat outside of the city center of Berlin, some of her friends sometimes arrived, only to find out that every single court was occupied.

So she asked me to make a web application for being able to let her friends make reservations for her tennis courts, so everyone will know if there's still an available court or reserve some hours in the further future.

## Overview

My Django project consists of _two_ Django apps. One, the `tenniscourts` part, purely consists of **Python/Django** and is the **database/backend** part of the project. The other one, `reservations`, is the **frontend** part that is built in a little bit of **Python/Django** and **mostly JavaScript/React**.

## Backend - "tenniscourts"

The `tenniscourts` part hosts the database and backend operations. 

For a decent representation of the data that I want to work with, I created three models in **`tenniscourts/models.py`**:

- User (inheriting AbstractUser from Django)
- TennisCourt
- Reservation

In the database, I prefilled the **TennisCourts** table with the four courts that would be the subject of this application ("Court 1, Court 2 ..."). The most interesting of these three models is of course the **Reservation**, that refers to _TennisCourt_ as well as to _User_, and has additional properties of _date_, _start time_ and _end time_.

The **`tenniscourts/urls.py`** lists the available routes of the API, the **`tenniscourts/views.py`** handles any incoming API request based on these routes:

- **`api/week/`** returns a matrix of the number of available courts per hour per day
- **`api/day/`** returns a matrix of the available courts for a specific day
- **`api/free/`** returns a bool if a specific court is available at a specific time
- **`api/new`** and **`del`** are routes to _create_ a new reservation or to _delete_ one
- **`api/profile`** returns all future reservations of the currently logged in user
- **`api/`** is only a joke and returns an HTTP "Hi!" ;-)

## Frontend - "reservations"

The `reservations` part hosts the frontend part of the application that deals with the backend and renders the user interface. While writing this, I learned a lot about _React_, _JSX_ and _JavaScript_ in total, which led me to thinking in dimensions of React Components rather than the raw DOM only.

Of course also this part is based on a Django app which easily allowed me to use **Django's powerful built-in authentication** - as to be seen in **`reservations/views.py`** - I reused the authentication part from other CS50W projects here.

The **`urls.py`** file of this frontend part is very simple - it only contains the register/login/logout views as well as one index view that renders the index.html template.

The index.html template itself contains a reference to a JavaScript file called _main.js_, which is the webpack-compiled version of all the project's JavaScript files that are to be found in the `reservations/src/` folder.

#### index.js

This is the basic JS file that uses the _ReactDOM_ to render the **`App`** Component.

### React Components

**`App`**
- **`DayCalendar`**
    - `DayNav`
    - `DayTableHead`
    - `DayRow`
        - `HourCell`
- **`WeekCalendar`**
    - `WeekNav`
    - `WeekTableHead`
    - `WeekRow`
        - `HourCell`
- **`MyReservations`**
    - `ResBox`
        - `DeleteButton`
- **`NewReservation`**
    - `TimeSelect`
- **`SiteHeading`**

... and three helpers, `formatTime.js`, `formatDate.js` and `getCookie.js`.

#### App.js

This is the top-level parent Component that handles all the other views (component renderings). It has a date value named **today** (because it's initially the actual _today_) as well as the **name of the view** to display as _state_, as well as some prefill-values for the NewReservation-component in special cases. Whenever the "view"-state changes, the parent component will re-render and display the respective child component/view.

The "today"-state also determines which date will be displayed by the child components _DayCalendar_ and _WeekCalendar_.

#### DayCalendar.js

This is the default view of the app: A **calendar of one day** (default: actual today) with one row _per hour_ and one column _per tennis court_ that displays which court is at what time available (colored green) or occupied (colored red).

It has as child components the _TableHead_, the _DayNav_ (navigation to move forward up to 14 days into the future) to change the displayed day or change to the New-Reservation-view, as well as a list of _DayRows_ (one table row per hour) that themselves consist of _HourCells_.

All the "available" HourCells have a click-handler that will trigger a pre-filled _NewReservation_-component (filled with the time, court and day of the clicked-on _HourCell_).

#### WeekCalendar.js

Similar to the _DayCalendar_, but displaying like a heatmap of available courts per time of day. The **calendar shows one week** with one row _per hour_ and one column _per day_, the colors show **how many courts are available for each hour on each day** - from dark green (4 available) to dark red (all booked). 

It also has a navigation (_WeekNav_) to move one day forward (up to two weeks into the future) or backward (back until the actual date), the _WeekTableHead_ child, and of course a list of _WeekRows_, themselves consisting of _HourCells_.

Again, the "available" HourCells have a click-handler that leads to a pre-filled _NewReservation_-component, filled with the time and day of the _HourCell_ that was clicked.

#### MyReservations.js

This is a component that displays all the user's active reservations - including the possibility to delete each individual item in the list. The component renders a list of child components called _ResBox_ (= ReservationBox) that themselves render a _DeleteButton_.

#### NewReservation.js

This component offers the possibility to **make a new reservation**. There's a drop-down-select for the number of the court, a date-picker (`input type="date"`) and two drop-downs for time selection.

The form values are entirely controlled by React, so every change in the form will trigger a state change in the _NewReservation_ component, which will itself determine the displayed value in the form input (-> _handleFormChange()_).

Upon submit (-> _handleSubmit()_), the form firstly does a client-side validity check (by checking if the end time is later than the begin time) and then checks with the API if the given time, date and court are actually available (via a GET request to _`api/free`_). If the desired time is available, a POST request will be made to _`api/new`_ (ensured by csrf token) to save the new reservation to the database.

This component's state does not only contain the values of the form inputs but also the property `invalidTimes`that, if true, will render the time inputs in the form as invalid, accompanied by a message that either the order of times is wrong or the desired court is already occupied in the respective hours.

#### SiteHeader.js

This is just the header component that acts like a heading template for each of the components. It takes the _title_ as props and renders accordingly.

#### helpers

##### formatTime.js

Takes an "hour" argument (between 8 and 22) and returns the according pendant between 8 AM and 10 PM.

##### formatDate.js

Takes a date object and returns a date string in the format yyyy-mm-dd.

##### getCookie.js

This is taken from the Django Documentation: https://docs.djangoproject.com/en/3.1/ref/csrf/ - in this project it is always used to get the value of the **csrf cookie** which was before set by Django to csrf-protect the POST- or PUT-requests (_NewReservation.js_, _MyReservations.js_).

### Capstone - my final project

This project is something very special for me, not only because the app is dedicated to my good friend for whom I already set it up in production on a webserver (all her friends are already intensively using it!), but also because I got to know the React framework through this very course and explored it thoroughly while developing this project. I explored a decent portion of React's documentation to be able to make the _Calendar_ components **without using any** existing React modules - constituting a modular UI, lifting up state, etc.

Not only did I thus get a decent insight into _React_ and _JSX_, also _JavaScript_ itself has become much more comfortable for me. This will be of great help in my future projects.

Thanks a lot for the opportunity of learning Web Programming with Python & JavaScript! This was CS50 Web.

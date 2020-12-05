import React, { Component } from "react";
import WeekCalendar from "./WeekCalendar";
import DayCalendar from "./DayCalendar";
import NewReservation from "./NewReservation";
import Profile from "./MyReservations";

class App extends Component {
    constructor(props) {
        super(props);
        const today = new Date();
        const view = getParams(window.location)['view'];
        this.state = {
            view: view,
            today: today,
            newResDefault: {}
        }
    }

    handleWeekClick() {
        this.setState({
            view: "week"
        });
    }

    handleDayClick() {
        this.setState({
            view: "day"
        });
    }

    newResClick() {
        this.setState({
            view: "newres"
        });
    }

    handleCourtHourClick(e) {
        const id = e.target.id; // court:hour
        const court = id.split(":")[0];
        const hour  = id.split(":")[1];
        this.setState({
            newResDefault: {
                court: court,
                start: hour
            },
            view: "newres"
        });
    }

    handleWeekHourClick(e) {
        const id = e.target.id; // date:hour
        const date = id.split(":")[0];
        const hour = id.split(":")[1];
        this.setState({
            newResDefault: {
                day: date,
                start: hour,
            },
            view: "newres"
        });
    }

    render() {
        if (this.state.view === "day") {
            return <DayCalendar today={this.state.today} weekClick={() => this.handleWeekClick()} newResClick={() => this.newResClick()} handleCourtHourClick={(e) => this.handleCourtHourClick(e)} />
        } else if (this.state.view === "week") {
            return <WeekCalendar today={this.state.today} dayClick={() => this.handleDayClick()} newResClick={() => this.newResClick()} handleWeekHourClick={(e) => this.handleWeekHourClick(e)} />
        } else if (this.state.view === "newres") {
            return <NewReservation newResDefault={this.state.newResDefault} />
        } else if (this.state.view === "profile") {
            return <Profile />
        }
    }

}

function getParams(location) {
    const searchParams = new URLSearchParams(location.search);
    return {
        view: searchParams.get('q') || 'day',
    }
}


export default App;
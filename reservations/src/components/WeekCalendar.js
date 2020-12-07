import React, { Component } from "react";

import formatDate from "./formatDate";
import SiteHeading from "./SiteHeading";

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


function WeekTableHead(props) {
    let days = [];
    days.push(<th key="clock">&#x1F550;</th>);
    for (let i = 0; i < 7; i++) {
        let date = new Date(props.today.getFullYear(), props.today.getMonth(), props.today.getDate() + i);
        days.push(
            <th key={wd[(props.weekday + i) % 7]}>
                {wd[(props.weekday + i) % 7]}
                <br />
                <span className="small">{String(date.getMonth() + 1).padStart(2, '0') + "/" + String(date.getDate()).padStart(2, '0')}</span>
            </th>
        );
    }
    return (
        <thead>
            <tr>
                {days}
            </tr>
        </thead>
    )
}

class WeekNav extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const today = new Date();
        const oneWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        
        return (
            <div className="mb-2">
                <div className="lead d-md-inline mb-2">
                    <button id="backward" className="btn btn-light" onClick={this.props.onClick} disabled={this.props.today.getDate() === today.getDate() ? true : false}>&lt;</button>
                    <button id="forward" className="btn btn-light" onClick={this.props.onClick} disabled={this.props.today.getDate() === oneWeek.getDate() ? true : false}>&gt;</button>
                </div>
                <div className="lead d-md-inline ml-2 mb-2">
                    <button id="dayView" className="btn btn-outline-secondary" onClick={this.props.dayClick}>Day view</button>
                </div>
                <div className="lead d-md-inline ml-2 mb-2">
                    <button id="newResBtn" className="btn btn-primary" onClick={this.props.newResClick}>Reserve a court</button>
                </div>
            </div>
        )
    }
    
}

class HourCell extends Component {
    constructor(props) {
        super(props);
    } // gets number of available courts, id and key as props

    render() {
        let colorClass = "av" + this.props.av;
        
        return (
            <td id={this.props.id} className={colorClass + " mx-1"} onClick={this.props.onClick}></td>
        )
    }
}

class WeekRow extends Component {
    constructor(props) {
        super(props);
    } // this is one row per hour
    // gets by props: HOUR and MATRIX
    
    render() {
        const cells = [];
        for (let i = 0; i < 7; i++) {
            const key = formatDate(new Date(Date.now() + (86400000 * i))) + ":" + String(this.props.hour + 8); // key = date:hour
            const av = this.props.matrix[i][this.props.hour];
            const cl = av > 0 ? this.props.handleHourClick : null;
            cells.push(<HourCell av={av} id={key} key={key} onClick={cl} />)
        }

        const hour = this.props.hour > 4 ? this.props.hour - 4 : this.props.hour + 8;
        return (
            <tr>
                <th scope="row">{hour}</th>
                {cells}
            </tr>
        )
        
    }
}

// Week-API returns a two-dimensional Array:
// one list per day, list values are the no. of available courts

class WeekCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            matrix: Array(7).fill().map(() => Array(14).fill(0))
        }
    }

    componentDidMount() {
        let year  = this.props.today.getFullYear()
        let month = this.props.today.getMonth() + 1 // January is 0!
        let day   = this.props.today.getDate()
        const request = new Request(
            `/api/week/${year}/${month}/${day}`,
            {headers: {}}
        );

        fetch(request)
        .then(response => response.json())
        .then(matrix => {
            this.setState({matrix: matrix});
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.today !== prevProps.today) {
            let year  = this.props.today.getFullYear()
            let month = this.props.today.getMonth() + 1 // January is 0!
            let day   = this.props.today.getDate()
            const request = new Request(
                `/api/week/${year}/${month}/${day}`,
                {headers: {}}
            );

            fetch(request)
            .then(response => response.json())
            .then(matrix => {
                this.setState({matrix: matrix});
            });
        }
    }
    
    render() {
        
        const heading = SiteHeading({title: "Week view"});
        const nav = <WeekNav today={this.props.today} onClick={this.props.navClick} dayClick={this.props.dayClick} newResClick={this.props.newResClick} />
        let rows = [];
        // running through the hours from 8 to 22 (or 0 to 14)
        for (let i = 0; i < 14; i++) {
            rows.push(<WeekRow key={i} hour={i} matrix={this.state.matrix} handleHourClick={this.props.handleWeekHourClick} />)
        }

        return (
            <div>
                {heading}
                {nav}
                <table className="table weektable table-responsive-sm">
                    {WeekTableHead({today: this.props.today, weekday: this.props.today.getDay()})}
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default WeekCalendar;
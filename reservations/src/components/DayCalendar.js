import React, { Component } from "react";
import SiteHeading from "./SiteHeading";

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function DayTableHead(props) {
    let courts = [];
    courts.push(<th key="clock">&#x1F550;</th>);
    for (let i = 1; i < 5; i++) {
        courts.push(
            <th key={i}>
                Court {i}
            </th>
        );
    }
    return (
        <thead>
            <tr>
                {courts}
            </tr>
        </thead>
    )
}

class DayNav extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const today = new Date();
        const twoWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
        
        return (
            <div className="mb-2">
                <div className="lead d-md-inline mb-2">
                    <button id="backward" className="btn btn-light" onClick={this.props.onClick} disabled={this.props.today.getDate() === today.getDate() ? true : false}>&lt;</button>
                    <button id="forward" className="btn btn-light" onClick={this.props.onClick} disabled={this.props.today.getDate() === twoWeek.getDate() ? true : false}>&gt;</button>
                </div>
                <div className="lead d-md-inline ml-2 mb-2">
                    <button id="weekView" className="btn btn-outline-secondary" onClick={this.props.weekClick}>Week view</button>
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
    } // gets number of available courts, key & id as props

    render() {
        let colorClass = "d-av" + this.props.av;
        
        return (
            <td id={this.props.id} className={colorClass + " mx-1"} onClick={this.props.onClick}></td>
        )
    }
}

class DayRow extends Component {
    constructor(props) {
        super(props);
    } // this is one row per hour
    // gets by props: HOUR and MATRIX
    
    render() {
        const cells = [];
        for (let i = 0; i < 4; i++) { // key and also id = "court:hour"  
            const key = String(i + 1) + ":" + String(this.props.hour + 8);
            const av  = this.props.matrix[this.props.hour][i];
            const cl = av === 1 ? this.props.handleHourClick : null;
            cells.push(<HourCell av={av} key={key} id={key} onClick={cl} />)
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

// Day-API returns a two-dimensional Array:
// one list per hour, list values are 1 for court available, 0 for occupied

class DayCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            today: this.props.today,
            matrix: Array(14).fill().map(() => Array(4).fill(0))
        }
    }

    componentDidMount() {
        let year  = this.state.today.getFullYear()
        let month = this.state.today.getMonth() + 1 // January is 0!
        let day   = this.state.today.getDate()
        const request = new Request(
            `/api/day/${year}/${month}/${day}`,
            {headers: {}}
        );

        fetch(request)
        .then(response => response.json())
        .then(matrix => {
            this.setState({matrix: matrix});
        });
    }

    handleNavClick(e) {
        let i = 0;
        if (e.target.id === "forward") {
            i = 1;
        } else {
            i = -1;
        }
        const new_today = new Date(this.state.today.getFullYear(), this.state.today.getMonth(), this.state.today.getDate() + i);
        this.setState({
            today: new_today
        });

        let year  = new_today.getFullYear()
        let month = new_today.getMonth() + 1 // January is 0!
        let day   = new_today.getDate()
        const request = new Request(
            `/api/day/${year}/${month}/${day}`,
            {headers: {}}
        );

        fetch(request)
        .then(response => response.json())
        .then(matrix => {
            this.setState({matrix: matrix});
        });
    }
    
    render() {
        const title = this.state.today.toLocaleDateString("en-US", {weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric'});
        const heading = SiteHeading({title: title});
        const nav = <DayNav today={this.state.today} onClick={(e) => this.handleNavClick(e)} weekClick={this.props.weekClick} newResClick={this.props.newResClick} />
        let rows = [];
        // running through the hours from 8 to 22 (or 0 to 14)
        for (let i = 0; i < 14; i++) {
            rows.push(<DayRow key={i} hour={i} matrix={this.state.matrix} handleHourClick={this.props.handleCourtHourClick} />)
        }

        return (
            <div>
                {heading}
                {nav}
                <table className="table daytable table-responsive-sm">
                    {DayTableHead({today: this.state.today, weekday: this.state.today.getDay()})}
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default DayCalendar;
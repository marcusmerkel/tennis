import React, { Component } from "react";
import getCookie from "./getCookie";
import SiteHeading from "./SiteHeading";


class TimeSelect extends Component {
    render() {
        const starttime = parseInt(this.props.starttime);
        const endtime = parseInt(this.props.endtime);

        const options = []
        for (let i=starttime; i < endtime; i++) {
            if (i > 12) {
                options.push(<option key={i} value={i}>{i - 12} PM</option>);
            } else {
                options.push(<option key={i} value={i}>{i} AM</option>);
            }
        }
        return <select id={this.props.id} name={this.props.id} className={this.props.className} value={this.props.value} onChange={this.props.onChange}>{options}</select>;
    }
}

class NewReservation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            court: this.props.newResDefault.court ? this.props.newResDefault.court : 1,
            date: this.props.newResDefault.day ? this.props.newResDefault.day : (new Date()).toISOString().split("T")[0],
            start_time: this.props.newResDefault.start ? parseInt(this.props.newResDefault.start) : 8,
            end_time: this.props.newResDefault.start ? parseInt(this.props.newResDefault.start) + 1 : 9,
            invalidTimes: false
        }
    }

    handleSubmit(evt) {
        evt.preventDefault();
        
        // See if start- and end-time ar in wrong order
        if (this.state.start_time >= this.state.end_time) {
            this.setState({
                invalidTimes: true,
                message: "End must be later than beginning!"
            });
            return null;
        } else {
            this.setState({
                invalidTimes: false,
                message: ""
            });
        }

        // Ask Database if times collide with another reservation
        const court = this.state.court;
        const year  = this.state.date.split('-')[0];
        const month = this.state.date.split('-')[1];
        const day   = this.state.date.split('-')[2];
        const start_time = this.state.start_time;
        const end_time   = this.state.end_time;

        // Ask Database if times collide with another reservation
        const request = new Request(
            `/api/free/${court}/${year}/${month}/${day}/${start_time}/${end_time}`,
            {headers: {}}
        );

        fetch(request)
        .then(response => response.json())
        .then(result => {
            if (result.free === false) {
                this.setState({
                    invalidTimes: true,
                    message: "Already occupied."
                });
                return null;
            } else {
                this.setState({
                    invalidTimes: false,
                    message: ""
                });
                
                const csrftoken = getCookie('csrftoken');

                const post_req = new Request(
                    `api/new`,
                    {headers: {'X-CSRFToken': csrftoken}}
                );

                fetch(post_req, {
                    method: 'POST',
                    mode: 'same-origin',
                    body: JSON.stringify({
                        court: court,
                        date: this.state.date,
                        start_time: start_time,
                        end_time: end_time
                    })
                })
                .then(response => {
                    if (response.status === 201) {
                        console.log("Successfully added reservation");
                        window.location.href = '/?q=profile';
                    }
                })
            }
        });
    }

    handleFormChange(evt) {
        const target = evt.target;
        const name = target.name;

        const value = name != "date" ? parseInt(target.value) : target.value;
        this.setState({
            [name]: value
        });
    }

    render(){
        const heading = SiteHeading({title: "Reserve a court"});
        const today = new Date();
        const twoWeeks = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
        const message = this.state.message ? <div className="text-danger mb-3">{this.state.message}</div> : "";
        const timeClass = this.state.invalidTimes ? "form-control is-invalid" : "form-control";

        return (
            <div>
                {heading}
                <form onSubmit={(evt) => this.handleSubmit(evt)}>
                    <div className="form-group">
                        <label htmlFor="court-choice">Which court?</label>
                        <select id="court-choice" name="court" className="form-control" value={this.state.court} onChange={(evt) => this.handleFormChange(evt)}>
                            <option value="1">Court 1</option>
                            <option value="2">Court 2</option>
                            <option value="3">Court 3</option>
                            <option value="4">Court 4</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input id="date" name="date" className="form-control" type="date" onChange={(evt) => this.handleFormChange(evt)} value={this.state.date} min={today.toISOString().split("T")[0]} max={(new Date(Date.now() + 12096e5)).toISOString().split("T")[0]}></input>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="start_time">Start (h)</label>
                            <TimeSelect id="start_time" className={timeClass} value={this.state.start_time} starttime="8" endtime="22" onChange={(evt) => this.handleFormChange(evt)} />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="end_time">End (h)</label>
                            <TimeSelect id="end_time" className={timeClass} value={this.state.end_time} starttime="9" endtime="23" onChange={(evt) => this.handleFormChange(evt)} />
                        </div>
                    </div>
                    {message}
                    <button type="submit" className="btn btn-primary">Reserve</button>
                </form>
            </div>
        );
    }
}



export default NewReservation;
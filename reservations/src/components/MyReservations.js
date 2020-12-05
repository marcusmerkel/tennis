import React, { Component } from "react";
import getCookie from "./getCookie";
import SiteHeading from "./SiteHeading";
import formatTime from "./formatTime";

class DeleteButton extends Component {
    render() {
        return (
            <button id={this.props.id} className="btn btn-outline-danger mt-2" onClick={this.props.onClick}>{this.props.text}</button>
        )
    }
}

class ResBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            delete: false
        }
    }

    handleDeleteButton() {
        this.setState({
            delete: true 
        });
    } 

    handleCancel() {
        this.setState({
            delete: false
        })
    }
    
    render() {
        const start_time = formatTime(this.props.start_time.split(":")[0]);
        const end_time = formatTime(this.props.end_time.split(":")[0]);

        if (this.state.delete) {
            return (
                <div className="container border border-danger lead p-4 my-3">
                    <h4>Are you sure to delete this?</h4>
                    <strong>Court {this.props.court}</strong> on <strong>{(new Date(this.props.date)).toLocaleString("en-US").split(",")[0]}</strong> from <strong>{start_time}</strong> to <strong>{end_time}</strong><br />
                    <DeleteButton key={this.props.id} id={"delBtn-" + this.props.id} onClick={this.props.handleDelete} text="Delete" />
                    <button className="btn btn-outline-primary ml-2 mt-2" onClick={() => this.handleCancel()}>Cancel</button>
                </div>
            )
        } else {
            return (
                <div className="container border lead p-4 my-3">
                    <strong>Court {this.props.court}</strong> on <strong>{(new Date(this.props.date)).toLocaleString("en-US").split(",")[0]}</strong> from <strong>{start_time}</strong> to <strong>{end_time}</strong>
                    <button className="btn btn-outline-danger float-right" onClick={() => this.handleDeleteButton()}>Delete</button>
                </div>
            )
        }
        
    }
}


class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            res_list: [],
            message: "",
            error: "",
        }
    }

    handleDelete(e) {
        const target_id = e.target.id.split("-")[1];
        const csrftoken = getCookie('csrftoken');

        const delete_req = new Request(
            `api/del`,
            {headers: {'X-CSRFToken': csrftoken}}
        );

        fetch(delete_req, {
            method: 'POST',
            mode: 'same-origin',
            body: JSON.stringify({
                id: target_id
            })
        })
        .then(response => {
            if (response.status === 202) {
                this.setState({
                    message: 'Successfully removed reservation'
                });
                const res_list = this.state.res_list;
                const new_res_list = res_list.filter(res => res.props.id != target_id);
                console.log(new_res_list);
                this.setState({res_list: new_res_list});
            } else {
                this.setState({
                    error: 'Reservation could not be deleted.'
                });
            }
        });
    }

    componentDidMount() {
        const request = new Request(
            `/api/profile`,
            {headers: {}}
        );

        fetch(request)
        .then(response => response.json())
        .then(reservations => {
            console.log(reservations)
            const res_list = reservations.map((res) => <ResBox key={res.id} id={res.id} court={res.court} date={res.day} start_time={res.start} end_time={res.end} handleDelete={(e) => this.handleDelete(e)} />);
            this.setState({res_list: res_list});
        });

    }

    render() {
        const heading = SiteHeading({title: "My Reservations"});
        const message = this.state.message != "" ? <div className="border border-success lead p-4 my-4">{this.state.message}</div> : "";
        const error   = this.state.error != "" ? <div className="border border-danger text-danger lead p-4 my-4">{this.state.error}</div> : "";

        return (
            <div>
                {heading}
                {message}
                {error}
                {this.state.res_list}
            </div>
        );
    }
}

export default Profile;
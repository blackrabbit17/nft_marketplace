import React, { Component } from "react";

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }
  componentDidMount() {
    this.getTimeUntil(this.props.deadline);
    setInterval(() => this.getTimeUntil(this.props.deadline), 1000);
  }
  leading0(num) {
    return num < 10 ? "0" + num : num;
  }
  getTimeUntil(deadline) {
    
    const date_future = new Date(0);
    date_future.setUTCSeconds(deadline);
    const date_now = new Date();

    var delta = Math.abs(date_future - date_now) / 1000;  /* Seconds between timestamps */
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    var seconds = Math.floor(delta % 60);

    if (date_future < 0) {
      this.setState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    } else {
      this.setState({ days, hours, minutes, seconds });
    }
  }
  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state,callback)=>{
        return;
    };
  }
  render() {
    return (
      <div>
        <div className="Clock-days">{this.leading0(this.state.days)}d</div>
        <div className="Clock-hours">
          {this.leading0(this.state.hours)}h
        </div>
        <div className="Clock-minutes">
          {this.leading0(this.state.minutes)}m
        </div>
        <div className="Clock-seconds">
          {this.leading0(this.state.seconds)}s
        </div>
      </div>
    );
  }
}
export default Clock;

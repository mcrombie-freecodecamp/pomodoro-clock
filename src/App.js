import React from 'react';
import logo from './logo.svg';
import './App.css';

function padWithZero(num) {
  let result = num;
  if (num < 10) { result = "0" + num.toString() }
  return result;
}

class PomodoroClock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      started: false,
      running: false,
      type: "Session",
      breakLength: 5,
      sessionLength: 25,
      remainingMinutes: 25,
      remainingSeconds: 0
    }
    this.runTimer = this.runTimer.bind(this);
    this.startOrStopSession = this.startOrStopSession.bind(this);
    this.switchType = this.switchType.bind(this);
    this.incrementBreak = this.incrementBreak.bind(this);
    this.decrementBreak = this.decrementBreak.bind(this);
    this.incrementSession = this.incrementSession.bind(this);
    this.decrementSession = this.decrementSession.bind(this);
    this.reset = this.reset.bind(this);
  }
  runTimer() {
    if (this.state.running) {
      if (this.state.remainingSeconds === 0) {
        if (this.state.remainingMinutes === 0) {
          document.getElementById("beep").play()
          this.switchType();
        }
        else {
          this.setState({
            remainingMinutes: this.state.remainingMinutes - 1,
            remainingSeconds: 59
          })
        }
      }
      else {
        this.setState({ remainingSeconds: this.state.remainingSeconds - 1 })
      }
    }
  }
  startOrStopSession() {
    if (!this.state.started) {
      window.setInterval(this.runTimer, 1000)
    }
    this.setState({
      started: true,
      running: !this.state.running
    })
  }
  switchType() {
    if (this.state.type === "Session") {
      this.setState({
        remainingMinutes: this.state.breakLength,
        remainingSeconds: 0,
        type: "Break"
      })
    }
    else if (this.state.type === "Break") {
      this.setState({
        remainingMinutes: this.state.sessionLength,
        remainingSeconds: 0,
        type: "Session"
      })
    }
  }
  incrementBreak() {
    let newBreakLength = this.state.breakLength;
    if (newBreakLength < 60) { newBreakLength++ }; //can't be more than 60
    this.setState({

        
      breakLength: newBreakLength
    })
    if (this.state.type === "Break") { //if break incremented during break
      this.setState({
        running: false,
        type: "Break",
        remainingMinutes: newBreakLength,
        remainingSeconds: 0,
      })
    }
    let newSize = (newBreakLength * 5) + "px";
    document.getElementById("break-icon").style.fontSize = newSize; //change size of icon
  }
  decrementBreak() {
    let newBreakLength = this.state.breakLength;
    if (newBreakLength > 1) { newBreakLength-- }; //can't be less than 1
    this.setState({
      breakLength: newBreakLength
    })
    if (this.state.type === "Break") { //if break decremented during break
      this.setState({
        running: false,
        type: "Break",
        remainingMinutes: newBreakLength,
        remainingSeconds: 0,
      })
    }
    let newSize = (newBreakLength * 5) + "px";
    document.getElementById("break-icon").style.fontSize = newSize; //change size of icon
  }
  incrementSession() {
    let newSessionLength = this.state.sessionLength;
    if (newSessionLength < 60) { newSessionLength++ }; //can't be more than 60
    this.setState({
      sessionLength: newSessionLength
    })
    if (this.state.type === "Session") {//if session incremented during session
      this.setState({
        running: false,
        type: "Session",
        remainingMinutes: newSessionLength,
        remainingSeconds: 0,
      })
    }
    let newSize = newSessionLength + "px";
    document.getElementById("session-icon").style.fontSize = newSize; //change size of icon
  }
  decrementSession() {
    let newSessionLength = this.state.sessionLength;
    if (newSessionLength > 1) { newSessionLength-- }; //can't be less than 1
    this.setState({
      sessionLength: newSessionLength
    })
    if (this.state.type === "Session") {//if session decremented during session
      this.setState({
        running: false,
        type: "Session",
        remainingMinutes: newSessionLength,
        remainingSeconds: 0,
      })
    }
    let newSize = newSessionLength + "px";
    document.getElementById("session-icon").style.fontSize = newSize; //change size of icon
  }
  reset() {
    document.getElementById("beep").pause()
    document.getElementById("beep").currentTime = 0
    this.setState({
      running: false,
      breakLength: 5,
      sessionLength: 25,
      type: "Session",
      remainingMinutes: 25,
      remainingSeconds: 0
    })
  }
  render() {
    return (

      <div id="pomodoro-clock-container">
        <audio id="beep" src="https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3" controls autoplay></audio>

        <h1>Pomodoro Clock</h1>
        <div id="bubbles-container">
          <div id="break-bubble-container"><i id="break-icon" className="fa fa-coffee" style={{ fontSize: 25 }}></i></div>
          <div id="session-bubble-container"><i id="session-icon" className="fa fa-pencil" style={{ fontSize: 25 }}></i></div>
        </div>

        <div id="length-boxes-container">
          <div className="length-box">
            <div id="break-label" className="smaller-text white-text">Break Length</div>
            <div id="break-length" className="smaller-text boxed">{this.state.breakLength}</div>
            <div className="length-box__buttons">
              <button id="break-decrement" onClick={this.decrementBreak}><i className="fa fa-minus"></i></button>
              <button id="break-increment" onClick={this.incrementBreak}><i className="fa fa-plus"></i></button>
            </div>

          </div>

          <div className="length-box">
            <div id="session-label" className="smaller-text white-text">Session Length</div>
            <div id="session-length" className="smaller-text boxed">{this.state.sessionLength}</div>
            <div className="length-box__buttons">
              <button id="session-decrement" onClick={this.decrementSession}><i className="fa fa-minus"></i></button>
              <button id="session-increment" onClick={this.incrementSession}><i className="fa fa-plus"></i></button>
            </div>

          </div>
        </div>

        <div id="timer-container">
          <div id="timer-container__circle">
            <div id="timer-label" className="larger-text white-text">{this.state.type}</div>
            <div id="time-left" className="larger-text boxed">{padWithZero(this.state.remainingMinutes)}:{padWithZero(this.state.remainingSeconds)}</div>
            <div id="timer-container__circle__buttons">
              <button id="start_stop" onClick={this.startOrStopSession}><i className="fa fa-play"></i> <i className="fa fa-pause"></i></button>
              {/* swith to pause icon while running */}
              <button id="reset" onClick={this.reset}><i className="fa fa-refresh"></i></button>
            </div>

          </div>

        </div>
      </div>
    );
  }
}


// ReactDOM.render(<PomodoroClock />, document.getElementById("pomodoro-clock-app"))

export default PomodoroClock;

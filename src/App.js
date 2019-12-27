import React from 'react';
import './App.css';

const DEFAULT = {
  started: false, //has the clock been started yet?
  running: false, //has the clock been puased yet?
  type: "Session", //type: setting || break
  breakLength: 5,
  sessionLength: 25,
  remainingMinutes: 25,
  remainingSeconds: 0
}

/* --------------------------------- */
/* APPLICATION - POMODORO CLOCK  */
/* --------------------------------- */

class PomodoroClock extends React.Component {
  constructor(props) {
    super(props);
    this.state = DEFAULT
    // OUTDATED BINDINGS
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
    // WHEN RUNNING DECREMENT CLOCK TIME
    if (this.state.running) {
      //DECREMENT REMAINING SECONDS TO 0
      if (this.state.remainingSeconds === 0) {
        // DECREMENT REMAINING MINUTES TO 0, PLAY SOUND, SWITCH SESSION TYPE
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
    // PLAY AND PAUSE
    if (!this.state.started) { window.setInterval(this.runTimer, 1000)}
    this.setState({
      started: true,
      running: !this.state.running
    })
  }
  switchType() {
    // SET SESSION TYPE TO ITS COUNTERPART
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
    //ADD ONE TO THE BREAK LENGTH
    let newBreakLength = this.state.breakLength;
    if (newBreakLength < 60) { newBreakLength++ }; //max: 60
    this.setState( {breakLength: newBreakLength});
    //IF INCREMENTED DURING BREAK, RESET AND PAUSE
    if (this.state.type === "Break") { 
      this.setState({
        running: false,
        type: "Break",
        remainingMinutes: newBreakLength,
        remainingSeconds: 0,
      })
    }
    // UPDATE SIZE OF ICON
    let newSize = (newBreakLength * 5) + "px";
    document.getElementById("break-icon").style.fontSize = newSize; 
  }
  decrementBreak() {
    //SUBTRACT ONE FROM THE BREAK LENGTH
    let newBreakLength = this.state.breakLength;
    if (newBreakLength > 1) { newBreakLength-- }; //min: 1
    this.setState({breakLength: newBreakLength});
    //IF DECREMENTED DURING BREAK, RESET AND PAUSE
    if (this.state.type === "Break") { 
      this.setState({
        running: false,
        type: "Break",
        remainingMinutes: newBreakLength,
        remainingSeconds: 0,
      })
    }
    // UPDATE SIZE OF ICON
    let newSize = (newBreakLength * 5) + "px";
    document.getElementById("break-icon").style.fontSize = newSize; 
  }
  incrementSession() {
    //ADD ONE TO THE SESSION LENGTH
    let newSessionLength = this.state.sessionLength;
    if (newSessionLength < 60) { newSessionLength++ }; //can't be more than 60
    this.setState({
      sessionLength: newSessionLength
    })
    //IF INCREMENTED DURING SESSION, RESET AND PAUSE
    if (this.state.type === "Session") {//if session incremented during session
      this.setState({
        running: false,
        type: "Session",
        remainingMinutes: newSessionLength,
        remainingSeconds: 0,
      })
    }
    // UPDATE SIZE OF ICON
    let newSize = newSessionLength + "px";
    document.getElementById("session-icon").style.fontSize = newSize; 
  }
  decrementSession() {
    //SUBTRACT ONE FROM THE SESSION LENGTH
    let newSessionLength = this.state.sessionLength;
    if (newSessionLength > 1) { newSessionLength-- }; //can't be less than 1
    this.setState({
      sessionLength: newSessionLength
    })
    //IF DECREMENTED DURING SESSION, RESET AND PAUSE
    if (this.state.type === "Session") {//if session decremented during session
      this.setState({
        running: false,
        type: "Session",
        remainingMinutes: newSessionLength,
        remainingSeconds: 0,
      })
    }
    // UPDATE SIZE OF ICON
    let newSize = newSessionLength + "px";
    document.getElementById("session-icon").style.fontSize = newSize; 
  }
  reset() {
    // RETURN SETTINGS TO DEFAULT
    this.setState(DEFAULT)
  }
  padWithZero(num) {
    // PAD WITH ZERO IN FRONT FOR SINGLE DIGIT TIMES
    let result = num;
    if (num < 10) { result = "0" + num.toString() }
    return result;
  }
  render() {
    return (
      <div id="pomodoro-clock-container">
        {/* DRUMBEAT AUDIO TO DENOTE TRANSITIONS */}
        <audio id="beep" src="https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3" controls autoplay></audio>
        <h1>Pomodoro Clock</h1>
        {/* TWO BUBBLES WITH ICONS STRICTLY FOR AESTHETIC APPEAL */}
        <div id="bubbles-container">
          <div id="break-bubble-container"><i id="break-icon" className="fa fa-coffee" style={{ fontSize: 25 }}></i></div>
          <div id="session-bubble-container"><i id="session-icon" className="fa fa-pencil" style={{ fontSize: 25 }}></i></div>
        </div>
        {/* TWO BOXES BELOW BUBBLES DENOTE BREAK LENGTH AND SESSION LENGTH */}
        {/* BUTTONS CHANGE LENGTHS */}
        <div id="length-boxes-container">
          {/* LEFT LENGTH BOX */}
          <div className="length-box">
            <div id="break-label" className="smaller-text white-text">Break Length</div>
            <div id="break-length" className="smaller-text boxed">{this.state.breakLength}</div>
            <div className="length-box__buttons">
              <button className="btn" id="break-decrement" onClick={this.decrementBreak}><i className="fa fa-minus"></i></button>
              <button className="btn" id="break-increment" onClick={this.incrementBreak}><i className="fa fa-plus"></i></button>
            </div>
          </div>
          {/* RIGHT LENGTH BOX */}
          <div className="length-box">
            <div id="session-label" className="smaller-text white-text">Session Length</div>
            <div id="session-length" className="smaller-text boxed">{this.state.sessionLength}</div>
            <div className="length-box__buttons">
              <button className="btn" id="session-decrement" onClick={this.decrementSession}><i className="fa fa-minus"></i></button>
              <button className="btn" id="session-increment" onClick={this.incrementSession}><i className="fa fa-plus"></i></button>
            </div>
          </div>
        </div>
        {/* DISPLAYS LABEL(SESSION OR BREAK), TIME LEFT, START/PAUSE, AND RESET */}
        <div id="timer-container">
          <div id="timer-container__circle">
            <div id="timer-label" className="larger-text white-text">{this.state.type}</div>
            <div id="time-left" className="larger-text boxed">{this.padWithZero(this.state.remainingMinutes)}:{this.padWithZero(this.state.remainingSeconds)}</div>
            <div id="timer-container__circle__buttons">
              <button className="btn" id="start_stop" onClick={this.startOrStopSession}><i className="fa fa-play"></i> <i className="fa fa-pause"></i></button>
              {/* switch to pause icon while running */}
              <button className="btn" id="reset" onClick={this.reset}><i className="fa fa-refresh"></i></button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PomodoroClock;

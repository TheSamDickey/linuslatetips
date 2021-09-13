import React from "react";
import { Row, Container, Col, Nav } from "react-bootstrap"

import "./home.css";

export class Home extends React.Component {
	componentDidMount() {
		// this.getThing();
	}
	render() {
		return (
			<>
				<Container style={{ marginTop: "65px" }}>
					<Row>
						<Col>
							<img alt="I cri" src="images/linusLateTips.png" style={{ width: "333px", marginTop: "-43px" }} />
							<p style={{ display: "inline-block", marginLeft: "25px" }}>Tracking how late Linus is every Friday 7PM CST</p>
						</Col>
					</Row>

					<Row style={{ marginTop: "180px", width: "100%" }}>
						<Col>
							<h2>Live Linus Late Counter:</h2>
							<br />
							<h1 style={{ fontSize: "8em", color: "#DB4105" }} id="lateCounter"><b>40m 22s</b></h1>
							<br />
							<p id="timerStopped">(timer stopped, stream started)</p>
							{/* <h1 style=" color: #DB4105;" id="lateCounter">Timer starts on Friday 7PM CST</h1> */}
							<br />
							<br />
							<br />
							<a href="records.html" id="centerLink">Check out records of previous late shows!</a>
						</Col>
					</Row>
				</Container>
				<p style={{ position: "absolute", bottom: "50px", right: "25px", float: "right" }}>Intended as a joke. Not created by LTT</p>
				<Nav style={{ textTransform: "none", color: "white", padding: "10px", letterSpacing: "normal", marginRight: "0px" }}>
					Created by <a href="http://thesamdickey.com" id="samDickey">Sam Dickey</a>
				</Nav>
			</>)
	}
}
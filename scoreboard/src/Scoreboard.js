import React, { Component } from 'react';
import { UpdateScore } from './UpdateScore';
import './Scoreboard.css';

export class Scoreboard extends Component {

    constructor(props) {
        super(props)
		this.state = {
			team: props.team,
			title: props.title,
            id: props.id,
            matchups: [],
            loading: true,
            sport: props.sport,
            league: props.league,
            homeScores: [],
            awayScores: [],
        };
    }

    async componentWillMount() {
        await this.populateScoreboard();
    }

    populateScoreboard = () => { 
        this.setState({ matchups: [] })
        fetch(`http://site.api.espn.com/apis/site/v2/sports/${this.state.sport}/${this.state.league}/scoreboard`)
        
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                }

                throw new Error("Unable to retrieve required data from server.");
            })
            .then(function (data) {
                let events = data.events;
                var games = [];
                for (var i = 0; i < events.length; i++) {
                    for (var j = 0; j < events[i].competitions.length; j++) {
                        games.push(events[i].competitions[j]);
                    }
                }
                return games
            })
            .then(games => {
                for (let index = 0; index < games.length; index++) {
                    var joined = this.state.matchups.concat(games[index]);
                    var homeScores = this.state.homeScores.concat(games[index].competitors[1].score);
                    var awayScores = this.state.awayScores.concat(games[index].competitors[0].score);
                    this.setState({ 
                        matchups: joined,
                        homeScores: homeScores,
                        awayScores: awayScores
                    })
                }
                console.log("home:" + homeScores)
                console.log("away:" + awayScores)
                this.setState({ loading: false })
            })
            .catch(function (error) {
            console.log("Error: ", error.message);
        });
    }

    render() {
        if (this.state.loading===false){
            let tableData = [];
            let status = '';
            let team1Record = '';
            let team2Record = '';
            for (let x = 0; x < this.state.matchups.length; x++) {
                this.state.league !== 'college-football' ? team1Record = this.state.matchups[x].competitors[1].records[0].summary : team1Record = "0-0"
                this.state.league !== 'college-football' ? team2Record = this.state.matchups[x].competitors[0].records[0].summary : team2Record = "0-0"
                if (this.state.matchups[x].status.type.completed === true) {
                    if (this.state.matchups[x].status.period === 5) {
                        status = <tr id="status"><strong>FINAL/OT</strong></tr>
                    }
                    else if (this.state.matchups[x].status.period > 5){
                        let overtime_period = Number(this.state.matchups[x].status.period) - 4
                        status = <tr id="status"><strong>FINAL/{overtime_period}OT</strong></tr>
                    }
                    else {
                        status = <tr id="status"><strong>FINAL</strong></tr>
                    }
                }
                else if (this.state.matchups[x].status.period < 5 && this.state.matchups[x].status.period > 0) {
                    status = <tr id="status"><strong>Q{this.state.matchups[x].status.period} - {this.state.matchups[x].status.displayClock}</strong></tr>
                } 
                else if (this.state.matchups[x].status.period === 0) {
                    status = <tr id="status">{this.state.matchups[x].status.type.detail}</tr>
                } else {
                    
                }
                let location = "https://www.google.com/maps/search/?api=1&query=" + this.state.matchups[x].venue.fullName
                tableData.push(
                    <span>
                    <tbody className="scoreboard">
                    <tr>
                        <td id="logo"><img id="thumb" alt="" src={this.state.matchups[x].competitors[1].team.logo}/></td>
                        {this.state.matchups[x].competitors[1].winner === true ? <td id="teams"><strong>{this.state.matchups[x].competitors[1].team.displayName} <span id="record">({team1Record})</span></strong></td>: <td id="teams">{this.state.matchups[x].competitors[1].team.displayName} <span id="record">({team1Record})</span></td>}
                        <UpdateScore index={x} teamIndex={1} sport={this.state.sport} league={this.state.league} scores={this.state.homeScores}/>
                        {/* <td id="scores">{this.state.matchups[x].competitors[1].score}</td> */}
                    </tr>
                    <tr>
                        <td id="logo"><img id="thumb" alt="" src={this.state.matchups[x].competitors[0].team.logo}/></td>
                        {this.state.matchups[x].competitors[0].winner === true ? <td id="teams"><strong>{this.state.matchups[x].competitors[0].team.displayName} <span id="record">({team2Record})</span></strong></td>: <td id="teams">{this.state.matchups[x].competitors[0].team.displayName} <span id="record">({team2Record})</span></td>}
                        <UpdateScore index={x} teamIndex={0} sport={this.state.sport} league={this.state.league} scores={this.state.awayScores}/>
                        {/* <td id="scores">{this.state.matchups[x].competitors[0].score}</td> */}
                    </tr>
                    <tr>
                        <td colSpan="3">{status}</td>
                    </tr>
                    </tbody>
                    <tfoot>
                        <td colSpan="3">
                            {this.state.matchups[x].venue.fullName.includes("(" || ")") ? <a href={location} target="_blank" rel="noopener noreferrer" id="venue">{this.state.matchups[x].venue.fullName}</a> : <a href={location} target="_blank" rel="noopener noreferrer" id="venue">{this.state.matchups[x].venue.fullName} ({this.state.matchups[x].venue.address.city}, {this.state.matchups[x].venue.address.state})</a>}
                        </td>
                    </tfoot>
                    <br/>
                    <br/>
                    </span>
                )   
            }
            
            return (
                //image src link found in json under team > links > logo
                <table> 
                    <tr>
                        <td>
                            <table class="card-table">
                                {tableData}
                            </table>
                        </td>
                        <td>            </td>
                        <td>
                            <table class="card-table">
                                {tableData}
                            </table>
                        </td>
                    </tr>
                </table>
            )
        }
        else{
        return(
            <h1>Loading...</h1>
        )}
    }
}
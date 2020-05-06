import React, { Component } from 'react';
import './Team.css';

/*
COMMENTS:
Football has no record element further down in the array currently, for bball this is what has conf record
*/
export class Team extends Component {

    constructor(props) {
        super(props)
		this.state = {
			team: props.team,
			title: props.title,
            id: props.id,
            matchups: [],
            loading: true,
            teamData: null,
            sport: props.sport,
            league: props.league,
            homeScores: [],
            awayScores: [],
            width: 0,
            height: 0,
            selectedTeams: [
                {
                    team: 'BYU',
                    sport: 'basketball',
                    league: 'mens-college-basketball',
                    id: 's:40~l:41~t:252'
                },
                {
                    team: 'BYU',
                    sport: 'football',
                    league: 'college-football',
                    id: 's:20~l:23~t:252'
                },
                {
                    team: 'utah',
                    sport: 'basketball',
                    league: 'nba',
                    id: 's:40~l:46~t:26'
                },
            ],
            data: [],
        };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }    

    componentDidMount() {
        this.populateScoreboard();
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    populateScoreboard = () => {
        var dataarray =[];        
        for (let index = 0; index < this.state.selectedTeams.length; index++) {
        
        fetch(`http://site.api.espn.com/apis/site/v2/sports/${this.state.selectedTeams[index].sport}/${this.state.selectedTeams[index].league}/teams/${this.state.selectedTeams[index].team}`)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                }

                throw new Error("Unable to retrieve required data from server.");
            })
            .then(data => {

                dataarray.push(data)
                this.setState({teamData: data, loading: false, data: dataarray})
            })
            .catch(function (error) {
            console.log("Error: ", error.message);
        });
        }   
    }

    splitScoreTable (array, chunk_size) {
        var tempArray = [];     
        for (var index = 0; index < array.length; index += chunk_size) {
            var myChunk = array.slice(index, index+chunk_size);
            tempArray.push(myChunk);
        }    
        return tempArray;
    }

    testForMatchupScores = (competitorIndex, index) => {
        try {
            return this.state.data[index].team.nextEvent[0].competitions[0].competitors[competitorIndex].team.abbreviation;
        }
        catch {
            return "TBD";
        }
    }

    testForNextEvent = (index) => {
        try {
            return this.state.data[index].team.nextEvent[0].shortName;
        }
        catch {
            return "TBD";
        }
    }

    testForProfessionalTeam = (league) => {
        var professionalLeagues = ["nfl","nba","mlb","nhl","wnba", "usa.1", "uefa.champions"];
        if (professionalLeagues.includes(league)) {
            return "Playoff Seed:";
        }
        else return "AP Ranking:"
    }

    testForRankingPlayoff = (index) => {
        try {
            return this.state.data[index].team.record.items[0].stats[0].value;
        }
        catch {
            return this.state.data[index].team.rank;
        }
    }

    testForRecord = (index) => {
        try {
            return this.state.data[index].team.record.items[0].summary;
        }
        catch {
            return this.state.data[index].team.nextEvent[0].competitions[0].competitors[0].record[0].displayValue;
        }
    }

    render() {

        var tableData= [];

        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt){
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
        
        if (this.state.loading===false){
            //LOGIC NEEDED TO PRODUCE THE TABLE
            //DECLARE VARIABLES
            var homeScores
            var awayScores
            var teamData

            for (let index = 0; index < this.state.data.length; index++) { //data[index] sub this for teamData
                for (let j = 0; j < this.state.selectedTeams.length; j++) {
                    if (this.state.selectedTeams[j].id===this.state.data[index].team.uid){
                        teamData = this.state.selectedTeams[j]                        
                    }
                }
                try {
                    homeScores = this.state.homeScores.concat(this.state.data[index].team.nextEvent[0].competitions[0].competitors[0].score.displayValue);
                    awayScores = this.state.awayScores.concat(this.state.data[index].team.nextEvent[0].competitions[0].competitors[1].score.displayValue);
                }
                catch {
                    homeScores = 0
                    awayScores = 0
                }
                tableData.push(
                    <tbody className="teamboard">
                        <tr>
                            <td id="logo">
                                <img id="teamthumb" alt="" src={this.state.data[index].team.logos[0].href}/>
                            </td>
                            <td id="team-sport">
                                {this.state.data[index].team.displayName} {toTitleCase(teamData.sport)}
                            </td>
                        </tr>
                        <tr>
                            <td>Record:</td>
                            <td id="scores">
                                {this.testForRecord(index)}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {this.testForProfessionalTeam(teamData.league)}
                            </td>
                            <td id="scores">
                                {this.testForRankingPlayoff(index)}
                            </td>
                        </tr>
                        <tr>
                            <td>Matchup:</td>
                            <td id="scores">
                                {this.testForNextEvent(index)}
                            </td>
                        </tr>
                        <tr>
                            <td>Most Recent Score:</td>
                            <td id="scores">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                {this.testForMatchupScores(1, index)}<br/>{awayScores}
                                            </td>
                                            <td>
                                                {this.testForMatchupScores(0, index)}<br/>{homeScores}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <strong>
                                    {this.state.data[index].team.standingSummary !== undefined ? this.state.data[index].team.standingSummary : "Off Season"}
                                </strong>
                            </td>
                        </tr>
                    </tbody>
                )   
                }
                var newData = []
                if (this.state.width > 769) {
                    for (let index = 0; index < tableData.length; index=index+3) {
                        newData.push(                                
                            <div key={this.state.data[index].team.id} className="flexcontainer">
                                <table className="card-table-team">
                                    {tableData[index]}
                                </table>
                                <table className="card-table-team">
                                    {tableData[index+1]}
                                </table>
                                <table className="card-table-team">
                                    {tableData[index+2]}
                                </table>
                            </div>
                        );
                    }
                }
                else {
                    for (let index = 0; index < tableData.length; index++) {
                        newData.push(
                            <div key={this.state.data[index].team.id}>
                                <table className="mobile-card-table-team">
                                    {tableData[index]}
                                    <br/><br/>
                                </table>
                            </div>
                        );
                    }
                }
                return (
                    <div> 
                        {newData}
                    </div>
                )           
        }
        else{
        return(
            <div id="loading">
                <h1>Loading</h1>
                <br/>
                <div className="spinner">
                    <div className="bounce1"></div>
                    <div className="bounce2"></div>
                    <div className="bounce3"></div>
                </div>
                </div> 
        )}
        
    }
}
import React, { Component } from 'react';

export class ResultsPage extends Component {
    constructor(props) {
        super(props);
        this.state = { texts: [], loading: true };
    }

    componentDidMount() {
        this.populateCardData();
    }

    static renderText(text) {
        return (
            <div>{text}</div>
        );
    }
    
    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : ResultsPage.renderText(this.state.texts);
        
        return (
            <h1>{contents}</h1>
        );
    }

    async populateCardData() {
        const response = await fetch('vaccinecards');
        const data = await response.json();
        this.setState({ texts: data, loading: false });
    }
}

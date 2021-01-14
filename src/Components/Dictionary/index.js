import React, { Component } from 'react';
import axios from 'axios';


export default class Dictionary extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dictionary: [],
            searchkeyword: ""
        }

    }



    componentDidUpdate(prevProps, prevState) {
        console.log("prevsta", prevState)
        console.log("prevsta searchTerm", prevState.searchkeyword)
        console.log("prevProps", prevProps)
        console.log("this.state.searchTerm", this.state.searchkeyword)
        if (prevProps.searchTerm != this.state.searchkeyword) {
            return;
        }


        if (prevProps.searchTerm) {
            axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${prevProps.searchTerm}`).then(reseult => {
                console.log(reseult);
                this.setState({
                    dictionary: reseult.data,
                    searchTerm: prevProps.searchTerm
                })
            })
        }
    }

    render() {

        return (
            <>
                {this.state.dictionary.map((result, index) => (
                    <div className="searchResult" key={index}>
                        <h2 className="hwg"><span className="hw" data-headword-id={result.word}>{result.word}</span></h2>

                        <div className="hwg">
                            <div className="entryGroup">
                                <h3 className="pronunciations">Pronunciation
                                {result.phonetics.map((phonetic, inde) => (
                                    <div className="phoneticPronu" key={inde}>
                                        <span className="phoneticspelling">{phonetic.text}</span>
                                        <audio src={phonetic.audio} preload="none"></audio>
                                    </div>
                                ))}
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </>
        )
    }
}
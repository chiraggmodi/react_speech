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

        if (this.props.searchTerm !== prevProps.searchTerm) {
            axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${this.props.searchTerm}`).then(result => {

                this.setState({
                    dictionary: result.data,
                    searchTerm: this.props.searchTerm
                })
            }).catch(err => {

                if (err.response.status === 404) {
                    this.setState({
                        dictionary: false,
                        searchTerm: this.props.searchTerm
                    })
                }
            })
        } else {
            return;
        }

    }

    render() {
        if (!this.state.dictionary) {
            return (
                <div className="searchResult">
                    <h2 className="hwg"><span className="hw" data-headword-id={this.state.searchTerm}>{this.state.searchTerm}</span></h2>

                    <div className="hwg">
                        <div className="entryGroup">
                            <h3 className="pronunciations">No Result Found. Click on Button again to search another word.</h3>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <>
                    {this.state.dictionary.map((result, index) => (

                        <div className="searchResult" key={index}>
                            <h2 className="hwg"><span className="hw" data-headword-id={result.word}>{result.word}</span></h2>

                            <div className="hwg">
                                <div className="entryGroup">
                                    <h3 className="pronunciations">Pronunciation
                                    {result.phonetics.map((phonetic, inde) => {
                                        let audio = new Audio(phonetic.audio);
                                        const start = () => {
                                            audio.play()
                                        }
                                        return (
                                            <div className="phoneticPronu" key={inde}>
                                                <span className="phoneticspelling">{phonetic.text}</span>
                                                <a className="speaker" onClick={start}><audio src={phonetic.audio} preload="none"></audio></a>
                                            </div>
                                        )
                                    })}
                                    </h3>
                                </div>
                            </div>

                            {result.meanings.map((meaning, index) => (
                                <section className="gramb" key={index}>
                                    <h3 className="ps pos">
                                        <span className="pos">{meaning.partOfSpeech}</span>
                                    </h3>
                                    <span className="transitivity"></span>
                                    <ul className="semb">
                                        {meaning.definitions.map((defination, index) => (
                                            <li key={index}>
                                                <div className="trg">
                                                    <p>
                                                        <span className="ind">{defination.definition}</span>
                                                    </p>
                                                    <span className="indicators"></span>
                                                    <div className="exg">
                                                        <div className="ex"><em>{defination.example}</em></div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}

                        </div>
                    ))}
                </>
            )
        }

    }
}
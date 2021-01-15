import React, { useState, useEffect } from 'react';

import './App.css';
import Dictionary from './Components/Dictionary';


const speechRecg = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new speechRecg();

recognition.lang = "en-US";
// recognition.continuous = true
// recognition.interimResults = true

function App() {

  const [isListening, setListening] = useState(false);
  const [searchTerm, setSearchTerm] = useState(null);


  useEffect(() => {
    handleListen()
  }, [isListening])


  const readOutLoud = message => {
    const speech = new SpeechSynthesisUtterance();
    const voices = speechSynthesis.getVoices();
    speech.volume = 1;
    speech.voice = voices[0];
    speech.text = message;
    speech.pitch = 1;
    speech.rate = 1;

    window.speechSynthesis.speak(speech);
  }


  const handleListen = () => {
    if (isListening) {
      recognition.start();

    } else {
      recognition.stop();
      recognition.end = () => {
        console.log("mic end");
      }
    }

    recognition.onStart = () => {
      console.log("listening...")
    }

    recognition.onresult = event => {

      const transcript = Array.from(event.results).map(result => result[0]).map(result => result.transcript).join('');
      readOutLoud(transcript);
      setSearchTerm(transcript);
      setListening(false);
      recognition.onerror = event => console.log(event.error)
      // readOutLoud(transcript);
    }

  } // handleListening

  return (
    <div className="speechRecognization">

      <h3 onClick={() => { setListening(prestate => !prestate) }}>Click here and then Speak word or phrase... </h3>
      
      {isListening ? <h5>Speak now! we are listening...</h5> : ''}
      <Dictionary searchTerm={searchTerm} />
    </div>
  );
}

export default App;

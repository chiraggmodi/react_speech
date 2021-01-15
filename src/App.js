import React, { Component } from 'react';
import io from 'socket.io-client';
import './App.css';
import Dictionary from './Components/Dictionary';

const DOWNSAMPLING_WORKER = './audio_worker.js';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			connected: false,
			recording: false,
			recordingStart: 0,
			recordingTime: 0,
			recognitionOutput: ''
		};
	}

	componentDidMount() {
		let recognitionCount = 0;

		this.socket = io.connect('http://localhost:4000', {});

		this.socket.on('connect', () => {
			console.log('socket connected');
			this.setState({ connected: true });
		});

		this.socket.on('disconnect', () => {
			console.log('socket disconnected');
			this.setState({ connected: false });
			this.stopRecording();
		});

		this.socket.on('recognize', (results) => {
			console.log('recognized:', results);
			let { recognitionOutput } = this.state;
			results.id = recognitionCount++;
			recognitionOutput = results;

			this.setState({ recognitionOutput });

			if(results.text) {
				this.stopRecording();
				this.readOutLoud(results.text);
			}
		});
	}

	readOutLoud(message) {
		const speech = new SpeechSynthesisUtterance();
		const voices = speechSynthesis.getVoices();
		speech.volume = 1;
		speech.voice = voices[0];
		speech.text = message;
		speech.pitch = 1;
		speech.rate = 1;
	
		window.speechSynthesis.speak(speech);
		
	  }

	render() {

		return (

			<div className="speechRecognization">

				<h3 disabled={!this.state.connected || this.state.recording} onClick={this.startRecording}>Click here and then Speak word or phrase... </h3>

				{this.state.recording ? <h5>Speak now! we are listening...</h5> : ''}
				{this.renderRecognitionOutput()}
			</div>

		);
	}

	renderTime() {
		return (Math.round(this.state.recordingTime / 100) / 10).toFixed(0);
	}

	renderRecognitionOutput() {
		
		return (
			<Dictionary searchTerm={this.state.recognitionOutput.text} />
		)
	}

	createAudioProcessor(audioContext, audioSource) {
		let processor = audioContext.createScriptProcessor(4096, 1, 1);

		const sampleRate = audioSource.context.sampleRate;
		let downsampler = new Worker(DOWNSAMPLING_WORKER);
		console.log("audio pro", downsampler)
		downsampler.postMessage({ command: "init", inputSampleRate: sampleRate });
		downsampler.onmessage = (e) => {
			if (this.socket.connected) {
				this.socket.emit('stream-data', e.data.buffer);
			}
		};

		processor.onaudioprocess = (event) => {
			var data = event.inputBuffer.getChannelData(0);
			downsampler.postMessage({ command: "process", inputFrame: data });
		};

		processor.shutdown = () => {
			processor.disconnect();
			this.onaudioprocess = null;
		};

		processor.connect(audioContext.destination);

		return processor;
	}

	startRecording = e => {
		if (!this.state.recording) {
			this.recordingInterval = setInterval(() => {
				let recordingTime = new Date().getTime() - this.state.recordingStart;
				this.setState({ recordingTime });
			}, 100);

			this.setState({
				recording: true,
				recordingStart: new Date().getTime(),
				recordingTime: 0
			}, () => {
				this.startMicrophone();
			});

			setTimeout(() => {
				this.stopRecording()
			}, 3000)
		}
	};

	startMicrophone() {
		this.audioContext = new AudioContext();

		const success = (stream) => {
			console.log('started recording');
			this.mediaStream = stream;
			this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
			this.processor = this.createAudioProcessor(this.audioContext, this.mediaStreamSource);
			this.mediaStreamSource.connect(this.processor);
		};

		const fail = (e) => {
			console.error('recording failure', e);
		};

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({
				video: false,
				audio: true
			})
				.then(success)
				.catch(fail);
		}
		else {
			navigator.getUserMedia({
				video: false,
				audio: true
			}, success, fail);
		}
	}

	stopRecording = e => {
		if (this.state.recording) {
			if (this.socket.connected) {
				this.socket.emit('stream-reset');
			}
			clearInterval(this.recordingInterval);
			this.setState({
				recording: false
			}, () => {
				this.stopMicrophone();
			});
		}
	};

	stopMicrophone() {
		if (this.mediaStream) {
			this.mediaStream.getTracks()[0].stop();
		}
		if (this.mediaStreamSource) {
			this.mediaStreamSource.disconnect();
		}
		if (this.processor) {
			this.processor.shutdown();
		}
		if (this.audioContext) {
			this.audioContext.close();
		}
	}
}

export default App;

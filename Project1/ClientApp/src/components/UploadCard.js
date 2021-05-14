import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import * as Icon from 'react-feather';
import './UploadCard.scss';

export class UploadCard extends Component {
    //static displayName = FetchData.name;

    constructor(props) {
        super(props);
        this.state = { loading: true };
    }

    componentDidMount() {
        //this.captureVaccineCard();

        //feather.replace();

        const controls = document.querySelector('.controls');
        const cameraOptions = document.querySelector('.video-options>select');
        const video = document.querySelector('video');
        const canvas = document.querySelector('canvas');
        const screenshotImage = document.querySelector('img');
        const buttons = [...controls.querySelectorAll('button')];
        let streamStarted = false;

        const [play, pause, screenshot] = buttons;

        const constraints = {
            video: {
                width: {
                    min: 1280,
                    ideal: 1920,
                    max: 2560,
                },
                height: {
                    min: 720,
                    ideal: 1080,
                    max: 1440
                },
            }
        };

        cameraOptions.onchange = () => {
            const updatedConstraints = {
                ...constraints,
                deviceId: {
                    exact: cameraOptions.value
                }
            };

            startStream(updatedConstraints);
        };

        play.onclick = () => {
            if (streamStarted) {
                video.play();
                play.classList.add('d-none');
                pause.classList.remove('d-none');
                return;
            }
            if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
                const updatedConstraints = {
                    ...constraints,
                    deviceId: {
                        exact: cameraOptions.value
                    }
                };
                startStream(updatedConstraints);
            }
        };

        const pauseStream = () => {
            video.pause();
            play.classList.remove('d-none');
            pause.classList.add('d-none');
        };

        const doScreenshot = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            screenshotImage.src = canvas.toDataURL();
            screenshotImage.classList.remove('d-none');

            //console.log(screenshotImage.src);

            this.captureVaccineCard(screenshotImage.src);
        };

        pause.onclick = pauseStream;
        screenshot.onclick = doScreenshot;

        const startStream = async (constraints) => {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            handleStream(stream);
        };

        const handleStream = (stream) => {
            video.srcObject = stream;
            play.classList.add('d-none');
            pause.classList.remove('d-none');
            screenshot.classList.remove('d-none');

        };

        const getCameraSelection = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            const options = videoDevices.map(videoDevice => {
                return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
            });
            cameraOptions.innerHTML = options.join('');
        };

        getCameraSelection();
    }

    static renderCameraAction() {
        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
            console.log("Let's get this party started");

            navigator.mediaDevices.getUserMedia({ video: true });

            return (
                <p>In renderCameraAction</p>
            );
        } else {
            console.log("Not compatible. Sorry.");

            return (<p>Nothing to see here</p>);
        }
    }
    
    static renderForecastsTable(forecasts) {
        return (
            <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Date</th>
            <th>Temp. (C)</th>
            <th>Temp. (F)</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map(forecast =>
              <tr key={forecast.date}>
              <td>{forecast.date}</td>
              <td>{forecast.temperatureC}</td>
              <td>{forecast.temperatureF}</td>
              <td>{forecast.summary}</td>
            </tr>
          )}
        </tbody>
      </table>
        );
    }

    render() {
        let contents = this.state.loading ? <div></div> : <Link to="/results-page"><button className="results-btn" type="button">Click to see the results</button></Link>;
        
        return (
            <div className="display-cover">
                <video autoPlay></video>
                <canvas className="d-none"></canvas>

                <div className="video-options">
                    <select name="" id="" className="custom-select">
                        <option value="">Select camera</option>
                    </select>
                </div>

                <img className="screenshot-image d-none" alt=""/>

                <div className="controls">
                    <button className="btn btn-danger play" title="Play"><i data-feather="play-circle"></i></button>
                    <button className="btn btn-info pause d-none" title="Pause"><i data-feather="pause"></i></button>
                    <button className="btn btn-outline-success screenshot d-none" title="Screenshot"><i data-feather="image"></i></button>
                </div>

                {contents}
            </div>
        );
    }

    async captureVaccineCard(screenshot) {
        let data = {
            id: new Date().toISOString(),
            base64: screenshot
        };

        const response = await fetch('vaccinecards',
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            console.log(response, 'response');
            if (response.status === 200) {
                this.setState({ loading: false });
            }
        }).catch((err) => {
            console.log(err);
        });
    }
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var DEBUGCANVAS = null;
var mediaStreamSource = null;
var canvasElem,
    waveCanvas,
    pitchElem,
    noteElem,
    detuneElem,
    detuneAmount;
var ac = null;

let numberOfSamples = 10;
let voiceVolumeTriggerLevel = 250;
let voiceFrequencyTriggerLevel = 1000;
let triggered = false;
let freq = false;

window.onload = function () {
    toggleLiveInput();
    audioContext = new AudioContext();
    MAX_SIZE = Math.max(4, Math.floor(audioContext.sampleRate / 5000));	// corresponds to a 5kHz signal
    canvasElem = document.getElementById("output");
    DEBUGCANVAS = document.getElementById("waveform");
    if (DEBUGCANVAS) {
        waveCanvas = DEBUGCANVAS.getContext("2d");
        waveCanvas.strokeStyle = "black";
        waveCanvas.lineWidth = 1;
    }
    pitchElem = document.getElementById("pitch");
    noteElem = document.getElementById("note");
    detuneElem = document.getElementById("detune");
    detuneAmount = document.getElementById("detune_amt");
}

function error() {
    alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Connect it to the destination.
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    mediaStreamSource.connect(analyser);
    updatePitch();
}

function toggleLiveInput() {
    if (isPlaying) {
        //stop playing and return
        sourceNode.stop(0);
        sourceNode = null;
        analyser = null;
        isPlaying = false;
        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame(rafID);
    }
    getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream);
}

var rafID = null;
var buflen = 1024;
var buf = new Float32Array(buflen);

var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be

function autoCorrelate(buf, sampleRate) {
    var SIZE = buf.length;
    var MAX_SAMPLES = Math.floor(SIZE / 2);
    var best_offset = -1;
    var best_correlation = 0;
    var rms = 0;
    var foundGoodCorrelation = false;
    var correlations = new Array(MAX_SAMPLES);

    for (var i = 0; i < SIZE; i++) {
        var val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) // not enough signal
        return -1;

    var lastCorrelation = 1;
    for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
        var correlation = 0;

        for (var i = 0; i < MAX_SAMPLES; i++) {
            correlation += Math.abs((buf[i]) - (buf[i + offset]));
        }
        correlation = 1 - (correlation / MAX_SAMPLES);
        correlations[offset] = correlation; // store it, for the tweaking we need to do below.
        if ((correlation > GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
            foundGoodCorrelation = true;
            if (correlation > best_correlation) {
                best_correlation = correlation;
                best_offset = offset;
            }
        } else if (foundGoodCorrelation) {
            var shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
            return sampleRate / (best_offset + (8 * shift));
        }
        lastCorrelation = correlation;
    }
    if (best_correlation > 0.01) {
        return sampleRate / best_offset;
    }
    return -1;
//	var best_frequency = sampleRate/best_offset;
}

function updatePitch(time) {
    analyser.getFloatTimeDomainData(buf);
    ac = autoCorrelate(buf, audioContext.sampleRate);
    if (ac !== -1) {
        console.log(Math.round(ac));
    }
    setFrequency();

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    rafID = window.requestAnimationFrame(updatePitch);
}

function setVoiceVolume(volume) {
    //console.log(volume);
    if (volume >= voiceVolumeTriggerLevel)
        triggered = true;
}

function setFrequency() {
    if (ac >= voiceFrequencyTriggerLevel)
        freq = true;
    else
        freq = false;
}

function isJumpTriggered() {
    let tempTriggerValue = triggered;
    triggered = false;
    return tempTriggerValue;
}

function isMovingTriggered() {
    // TODO
    let freqTriggerValue = freq;
    freq = false;
    return freqTriggerValue;
}

const microphoneController = function () {
    const audioContext = new AudioContext();
    console.log("audio is starting up ...");
    const BUFF_SIZE = 16384;
    let audioInput = null,
        microphone_stream = null,
        gain_node = null,
        script_processor_node = null,
        script_processor_fft_node = null,
        analyserNode = null;
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
        navigator.getUserMedia({audio: true},
            function (stream) {
                start_microphone(stream);
            },
            function (e) {
                alert('Error capturing audio.');
            }
        );
    } else {
        alert('getUserMedia not supported in this browser.');
    }
    function show_some_data(given_typed_array, num_row_to_display, label) {
        let size_buffer = given_typed_array.length;
        let index = 0;
        let max_index = num_row_to_display;
        // console.log("__________ " + label);
        let maxVolume = 0;
        for (; index < max_index && index < size_buffer; index += 1) {
            maxVolume = maxVolume < given_typed_array[index] ? given_typed_array[index] : maxVolume;
            // console.log(given_typed_array[index]);
        }
        setVoiceVolume(maxVolume);
    }
    function process_microphone_buffer(event) {
        var i, N, inp, microphone_output_buffer;
        microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now
        // microphone_output_buffer  <-- this buffer contains current gulp of data size BUFF_SIZE
        show_some_data(microphone_output_buffer, numberOfSamples, "from getChannelData");
    }
    function start_microphone(stream) {
        gain_node = audioContext.createGain();
        gain_node.connect(audioContext.destination);
        gain_node.gain.value = 0;
        microphone_stream = audioContext.createMediaStreamSource(stream);
        microphone_stream.connect(gain_node);
        script_processor_node = audioContext.createScriptProcessor(BUFF_SIZE, 1, 1);
        script_processor_node.onaudioprocess = process_microphone_buffer;
        microphone_stream.connect(script_processor_node);
        script_processor_fft_node = audioContext.createScriptProcessor(2048, 1, 1);
        script_processor_fft_node.connect(gain_node);
        analyserNode = audioContext.createAnalyser();
        analyserNode.smoothingTimeConstant = 0;
        analyserNode.fftSize = 2048;
        microphone_stream.connect(analyserNode);
        analyserNode.connect(script_processor_fft_node);
        script_processor_fft_node.onaudioprocess = function () {
            // get the average for the first channel
            var array = new Uint8Array(analyserNode.frequencyBinCount);
            analyserNode.getByteFrequencyData(array);
            // draw the spectrogram
            if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {
                show_some_data(array, numberOfSamples, "from fft");
            }
        };
    }
}();
let numberOfSamples = 10;
let voiceVolumeTriggerLevel = 250;
let triggered = false;

function setVoiceVolume(volume) {
    console.log(volume);
    if (volume >= voiceVolumeTriggerLevel)
        triggered = true;
}

function isJumpTriggered() {
    let tempTriggerValue = triggered;
    triggered = false;
    return tempTriggerValue;
}

function isMovingTriggered() {
    // TODO
    return false;
}

function isMovingStopped() {
    // TODO
    return false;
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
        microphone_stream = audioContext.createMediaStreamSource(stream);
        // microphone_stream.connect(gain_node);
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
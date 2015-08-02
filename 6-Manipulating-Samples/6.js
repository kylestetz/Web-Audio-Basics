$( function() {

  // Set up our Audio Context
  var context = new AudioContext();
  window.context = context;

  // here's where we'll store our sample once it's loaded.
  var sampleBuffer  = null;
  var sampleNode    = null;
  // how fast is the sample playing?
  var playbackRate  = 1;
  // what part of the sample are we playing?
  var loopStart     = 0;
  var loopEnd       = 1;

  // load the sample
  loadSample('drums.mp3', function(sample) {
    sampleBuffer = sample;
  });

  // a jquery ui component for controlling the playback speed
  $('#speed-range').slider({
    min: 0.1,
    max: 4,
    step: 0.01,
    value: 1,
    // this callback is fired every time the slider is moved
    slide: function(e, ui) {
      playbackRate = ui.value;
      if(sampleNode) {
        sampleNode.playbackRate.value = playbackRate;
      }
    }
  });

  // a jquery ui component for controlling the sample range
  $('#sample-range').slider({
    range: true,
    min: 0,
    max: 1,
    step: 0.01,
    values: [0, 1],
    // this callback is fired every time either slider is moved
    slide: function(e, ui) {
      loopStart = ui.values[0];
      loopEnd   = ui.values[1];
      if(sampleNode) {
        sampleNode.loopStart = loopStart;
        sampleNode.loopEnd   = loopEnd;
      }
    }
  });

  $('#start-sample').on('click', function(e) {
    // don't play the sample unless it has loaded and it's not already playing
    if(sampleBuffer) {
      if(sampleNode) {
        sampleNode.stop(0);
      }
      // create an AudioBufferSource, which can hold and play a sample.
      sampleNode = context.createBufferSource();
      // set its buffer to our sampleBuffer
      sampleNode.buffer = sampleBuffer;
      // apply our loop, playbackRate, and sample loop points
      sampleNode.loop = true;
      sampleNode.playbackRate.value = playbackRate;
      sampleNode.loopStart = loopStart;
      sampleNode.loopEnd = loopEnd;
      // now we can treat it like any audio node
      sampleNode.connect(context.destination);
      sampleNode.start(0);
    }
  });

  $('#stop-sample').on('click', function(e) {
    if(sampleBuffer && sampleNode) {
      sampleNode.stop(0);
      sampleNode = null;
    }
  });

});

// Here's an abstraction of the sample loading process. Since this
// involves an asynchronous request, we give it a callback to signal
// its completion. The callback gets the decoded sample buffer.

function loadSample(path, callback) {
  // create a new http request
  var request = new XMLHttpRequest();
  // it's a GET request for the url `synth.mp3`, which in a more
  // typical setup might be `/sounds/synth.mp3` or some other static
  // file route.
  request.open('GET', path, true);
  // we want the browser to interpret the data as an arraybuffer,
  // which is the format the web audio API expects samples in.
  request.responseType = 'arraybuffer';
  // tell the request what to do when it's done
  request.onload = function() {
    // this function turns our arraybuffer into an AudioBuffer
    // that the web audio api can understand.
    context.decodeAudioData(request.response, callback);
  };
  // send the request
  request.send();
}
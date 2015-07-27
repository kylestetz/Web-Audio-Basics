$( function() {

  // Set up our Audio Context
  var context = new AudioContext();
  window.context = context;

  // here's where we'll store our sample once it's loaded.
  var sampleBuffer = null;

  loadSample('synth.mp3', function(sample) {
    sampleBuffer = sample;
  });

  $('#play-sample').on('click', function(e) {
    // don't play the sample unless it has loaded!
    if(sampleBuffer) {
      // create an AudioBufferSource, which can hold and play a sample.
      var source = context.createBufferSource();
      // set its buffer to our sampleBuffer
      source.buffer = sampleBuffer;
      // now we can treat it like any audio node
      source.connect(context.destination);
      source.start(0);
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
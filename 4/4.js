$( function() {

  // Set up our Audio Context
  var context = new AudioContext();
  window.context = context;

  // Use this array to store the values of all the sliders.
  var values = [69, 69, 69, 69, 69, 69, 69, 69];

  // grab the sliders from the DOM and bind a `change` event.
  var $sliders = $('.slider');
  $sliders.on('change', function(e) {
    // if the slider changes, store its new value in the appropriate
    // index of the `values` array.
    values[ $(this).index() ] = $(this).val();
  });

  // the checkbox will control the start & stop of the sequencer.
  $('.checkbox').on('change', function(e) {
    if( this.checked ) {
      // start the sequencer
      nextNoteTime = context.currentTime;
      scheduleSequence();
      intervalId = setInterval(scheduleSequence, intervalTime);
    } else {
      // stop the sequencer
      intervalId = clearInterval(intervalId);
    }
  });

  // ================================================================
  // TIMING
  // ================================================================

  var bpm          = 120;
  // an eighth note at the given bpm
  var noteLength   = bpm / 60 * (1/8);
  var attack       = 1/64;

  var lookahead    = 0.04; // 40ms expressed in seconds
  var intervalTime = 25;   // 25ms expressed in milliseconds

  // these will keep track of the state of the sequencer:
      // when the next note is happening
  var nextNoteTime = null;
      // the index of the current note from 0 - 7
  var currentNote  = 0;
      // the id of the setInterval lookahead
  var intervalId   = null;

  function scheduleSequence() {
    while(nextNoteTime < context.currentTime + lookahead) {
      // schedule the next note
      scheduleNote( values[currentNote], nextNoteTime, currentNote );
      // advance the time
      nextNoteTime += noteLength;
      // keep track of which note we're on
      currentNote = ++currentNote % values.length;
    }
  }

  function scheduleNote(note, time, current) {
    var oscillator = context.createOscillator();
    // create an envelope using gain
    var gain       = context.createGain();

    oscillator.frequency.value = mtof(note);

    // connect the oscillator to the gain and the gain to the output
    oscillator.connect(gain);
    gain.connect(context.destination);

    // let's make an envelope with almost no attack and a sharp decay...
    // starting value of 0:
    gain.gain.setValueAtTime(0, time);
    // very quick attack to a value of 1:
    gain.gain.linearRampToValueAtTime(1, time + attack);
    // immediate decay to a value of 0:
    gain.gain.linearRampToValueAtTime(0, time + noteLength);

    // schedule the oscillator to start at `time` and end
    // at `time + noteLength`
    oscillator.start(time);
    oscillator.stop(time + noteLength);

    // add the time and slider index to our animation queue so that
    // we can highlight the correct slider when it's time.
    animationQueue.push({ time: time, slider: current });
  }

  // ================================================================
  // VISUAL
  // ================================================================

  // The animation queue is an array with scheduled notes in it.
  // Within `requestFrameAnimation` we will check the next `time` in
  // the queue against `context.currentTime` to determine when we
  // should highlight a slider or not.

  var animationQueue = [];

  function highlightCurrentSlider() {
    while(animationQueue.length && context.currentTime > animationQueue[0].time) {
      // turn off all `highlight` classes
      $sliders.toggleClass('highlight', false);
      // highlight the current slider
      $sliders.eq(animationQueue[0].slider).addClass('highlight');
      // remove this item from the queue
      animationQueue.splice(0, 1);
    }
    // request the next frame
    requestAnimationFrame(highlightCurrentSlider);
  }

  highlightCurrentSlider();

});

// mtof = Midi note to Frequency
// input: 0 - 127 (although you could go higher if you wanted)
// output: frequency in Hz from ~8Hz to ~12543Hz
function mtof(note) {
  return ( Math.pow(2, ( note-69 ) / 12) ) * 440.0;
}
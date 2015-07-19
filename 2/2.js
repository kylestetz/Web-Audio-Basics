$( function() {

  // Set up our Audio Context
  var context = new AudioContext();
  window.context = context;

  // this is where our oscillator will live
  var oscillator;

  // numbers we'll need later
  var width   = $(window).width();
  var height  = $(window).height();
  var xValue  = 0;
  var yValue  = 0;

  // recalculate the width and height if the window size changes
  $(window).resize( function() {
    width   = $(this).width();
    height  = $(this).height();
  });

  $('body').on('mousedown', function(e) {
    if (oscillator) {
      oscillator.stop(0);
    }
    // create the oscillator
    oscillator = context.createOscillator();
    // set the type of the oscillator
    oscillator.type = 'triangle'; // sine, triangle, sawtooth
    // set the frequency based on our stored values
    oscillator.frequency.value = mtof(xValue + yValue);
    // connect it to the output
    oscillator.connect(context.destination);
    // start the note
    oscillator.start(0);
  });

  $('body').on('mouseup', function(e) {
    // stop the note
    oscillator.stop(0);
  });

  $('body').on('mousemove', function(e) {
    // do some math to put the values in useful number ranges:
    // convert (0 <-> window width) to (0 <-> 13) and chop off the decimal
    xValue = 45 + Math.floor( e.clientX / width * 13 );
    // convert (0 <-> window height) to (0 <-> 4) and chop off the decimal
    yValue = Math.floor( e.clientY / height * 4 ) * 12;

    if (!oscillator) {
      return;
    }

    // the "de-zippered" (smoothed) version
    // oscillator.frequency.value = mtof(xValue + yValue);

    // the "zippered" (unsmoothed) version
    oscillator.frequency.setValueAtTime( mtof(xValue + yValue), context.currentTime );
  });

});

// mtof = Midi note to Frequency
// input: 0 - 127 (although you could go higher if you wanted)
// output: frequency in Hz from ~8Hz to ~12543Hz
function mtof(note) {
  return ( Math.pow(2, ( note-69 ) / 12) ) * 440.0;
}
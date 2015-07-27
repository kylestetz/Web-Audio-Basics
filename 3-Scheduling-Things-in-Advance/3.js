$( function() {

  // Set up our Audio Context
  var context = new AudioContext();
  window.context = context;

  var melody     = [69, 71, 73, 74, 76, 78, 80, 81];

  var noteLength = 1/4;
  var attack     = 1/64;

  function scheduleNote(note, time) {
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
  }

  $('.play').on('click', function(e) {
    // when the play button is clicked, schedule the melody
    for(var i = 0; i < melody.length; i++) {
      scheduleNote( melody[i], context.currentTime + (1/4 * i) );
    }
  });

});

// mtof = Midi note to Frequency
// input: 0 - 127 (although you could go higher if you wanted)
// output: frequency in Hz from ~8Hz to ~12543Hz
function mtof(note) {
  return ( Math.pow(2, ( note-69 ) / 12) ) * 440.0;
}
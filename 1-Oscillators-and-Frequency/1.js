$( function() {

  // Set up our Audio Context
  var context = new AudioContext();
  window.context = context;

  // this is where our oscillator will live
  var oscillator;

  // grab our button elements so we can attach events to them
  var noteOn  = $('#note-on');
  var noteOff = $('#note-off');
  // get the x and y span elements so we can display values in them
  var x       = $('#x');
  var y       = $('#y');

  noteOn.on('click', function(e) {
    // if the oscillator has a value, let's assume that means
    // it's playing and go away. If we don't do this, we'll create
    // a new reference and the old one will hang around forever,
    // inaccessible to us.
    if (oscillator) {
      return;
    }
    // create the oscillator node
    oscillator = context.createOscillator();
    // set its type
    oscillator.type = 'sine'; // sine, triangle, sawtooth, square
    // set its frequency in Hertz
    // oscillator.frequency.value = 334;
    // connect it to the output
    oscillator.connect(context.destination);
    // play it!
    // a value other than 0 will allow us to schedule it in the future
    oscillator.start(0);
  });

  noteOff.on('click', function(e) {
    if(oscillator) {
      // stop the oscillator immediately
      oscillator.stop(0);
      // set the variable to null so that we know nothing is playing.
      oscillator = null;
    }
  });

  $('body').on('mousemove', function(e) {
    // we could do some math to put the values in useful number ranges...!
    var xValue = e.clientX;
    var yValue = e.clientY;

    // take a look at the values of the text
    x.text(xValue);
    y.text(yValue);

    // if we don't have an oscillator running right now then we have
    // nothing else to do here and should return.
    if (!oscillator) {
      return;
    }

    // set the frequency to the x position of the mouse!
    oscillator.frequency.value = xValue;
  });

});
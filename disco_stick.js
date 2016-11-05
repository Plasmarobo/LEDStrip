/**
 * disco_stick.js
 * Austen Higgins-Cassidy, 9-5-2016
 */
function DiscoStick(ledstrip) {

  this.ledstrip = ledstrip;
  this.size = ledstrip.size();
  this.ledstrip.clear();
  this.count = 0;
  this.sound = new AudioSystem();
  this.sound_playing = false;
  this.average_depth = 10;
  // Initialize some sub-animations
  this.spectra_plot = new HBarPlot('fourier_graph');
  this.sine_plot = new SinePlot('sines_graph');
  this.xyz_plot = new Vector3Plot('accelerometer_graph');
  this.color_plot = new ColorPlot('color_graph');
  
  this.spectral_modifiers = [ 5,
  10,
  5,
  10,
  5,
  10,
  10,
  7,
  7,
  10,
  10,
  20,
  7,
  30,
  40,
  50,
  60
  ];
  
  this.Sines = {};
}

DiscoStick.prototype.init = function() {
  var target = document.getElementById('fourier_graph');
 
  var data = [];
  var array = this.sound.getFrequencyBuckets();
  this.step = this.sound.stepSize();
  this.mag_step = 0;
  this.Sines = {};
  this.spectra_plot.clear();
  this.sine_plot.clear();
  var phase = 0;
  this.last_buckets = [];
  for(var i = 0; i < array.length; ++i) {
    this.last_buckets.push(255);
  }
  this.generateSines(array); 
  this.xyz_plot.plot(new THREE.Vector3(50,25,5));
  var color = {};
  color.r = 255;
  color.g = 128;
  color.b = 0;
  this.color_plot.update(color);
}

DiscoStick.prototype.resize = function() {
  this.spectra_plot.resize();
  this.sine_plot.resize();
  this.xyz_plot.resize();
  this.color_plot.resize();
}

DiscoStick.prototype.animate = function() {
  //EXTERN ANIMATION;
  animation = requestAnimationFrame(this.animate.bind(this));
    // Step through each sub-animation
  for ( var freq in this.Sines ) {
    this.Sines[freq].step(this.ledstrip);
  }
  for (var i = 0; i < this.ledstrip.size(); i++) {
    this.ledstrip.buffer[i][0] = Math.floor(this.ledstrip.buffer[i][0] / this.sound.n_buckets);
    this.ledstrip.buffer[i][1] = Math.floor(this.ledstrip.buffer[i][1] / this.sound.n_buckets);
    this.ledstrip.buffer[i][2] = Math.floor(this.ledstrip.buffer[i][2] / this.sound.n_buckets);
  }
  this.update(this.sound.getFrequencyBuckets());
  this.spectra_plot.draw();
  this.sine_plot.draw();
  this.xyz_plot.draw();
  this.color_plot.draw();
  this.ledstrip.send();
}

/**
 * Sine 
 */
DiscoStick.prototype.Sine = function(frequency, amplitude, phase, shift) {
  this.parent = {};
  this.frequency = frequency;
  this.amplitude = amplitude;
  this.phase = phase;
  this.shift = shift;
  this.basic_rate = 4;
  this.frequency_to_angle = 1500;
  return this;
}

DiscoStick.prototype.Sine.prototype.update = function(amplitude) {
  this.amplitude = amplitude;
}

DiscoStick.prototype.Sine.prototype.step = function(strip) {
  this._step(this.parent.size);
  this._draw(strip);
}

DiscoStick.prototype.Sine.prototype._step = function(size) {
}

DiscoStick.prototype.Sine.prototype._draw = function(strip) {
    // Do something to fill the buffer
    for (var i = 0; i < strip.size(); i++) {
      var rads = (this.frequency / this.frequency_to_angle) * (i * Math.PI / this.basic_rate);
      var mag = (this.amplitude * Math.sin(rads + this.phase)) + this.shift;
      if (mag < 0) mag = 0;
      strip.buffer[i][0] += mag;
      strip.buffer[i][1] += mag;
      strip.buffer[i][2] += mag;
    }
}

DiscoStick.prototype.setAudio = function(file) {
  Reader = new FileReader();

  var File = file[0];

  Reader.addEventListener("loadend", (function() {
    if(this.sound_playing) {
      this.sound.stop();
    }
    this.sound.load(Reader.result, (function() {
    this.sound.start();
    this.sound_playing = true;
    this.init();
    }).bind(this));
  }).bind(this));

  Reader.readAsArrayBuffer(File);
}

DiscoStick.prototype.DeltaFilter = function(array) {
  var newarray = [];
  console.log(array.toString());
  console.log(this.last_buckets.toString());
  for(var i = 0; i < array.length; ++i) {
    newarray.push(array[i] - this.last_buckets[i]);
    this.last_buckets[i] *= (this.average_depth-1)/this.average_depth;
    this.last_buckets[i] = (array[i] + this.last_buckets[i])/2;
    
  }
  return newarray;
}

DiscoStick.prototype.generateSines = function(array) {
  var phase = 0;
  array = this.DeltaFilter(array);
  for(var i = 0; i < array.length; ++i) {
    this.spectra_plot.plot((i * this.step) + " hz", array[i] * this.spectral_modifiers[i]);
    this.sine_plot.plot((i * this.step), array[i] * this.spectral_modifiers[i], phase, i * this.mag_step);
    this.Sines[i * this.step] = new this.Sine((i * this.step), array[i] * this.spectral_modifiers[i], phase, i * this.mag_step);
    phase += Math.PI / array.length;
  }
}

DiscoStick.prototype.update = function(fourier_buckets) {
  this.generateSines(fourier_buckets);
}

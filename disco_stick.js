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
  this.last_x = 0;
  this.last_y = 0;
  this.last_xy_time = Date.now();
  this.last_z = 0;
  this.last_z_time = Date.now();
  this.spectral_modifiers = [ 15, //50
  15, //50
  35, //70
  35, //70
  40, //80
  35, //70
  45, //90
  45, //90
  50, //100
  55, //110
  55, //110
  55, //110
  60, //120
  50, //100
  50,
  50,
  50
  ];
  
  this.Sines = {};
}

DiscoStick.prototype.init = function() {
  var target = document.getElementById('fourier_graph');
 
  var data = [];
  var array = this.sound.getFrequencyBuckets();
  this.step = this.sound.stepSize();
  this.mag_step = 2;
  this.Sines = {};
  this.spectra_plot.clear();
  this.sine_plot.clear();
  var phase = 0;
  this.sine_scale = 0.05;
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
    this.Sines[freq].step(this.ledstrip, this.color_plot.getWeights());
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
  this.basic_rate = 2;
  this.frequency_to_angle = 500;
  return this;
}

DiscoStick.prototype.Sine.prototype.update = function(amplitude) {
  this.amplitude = amplitude;
}

DiscoStick.prototype.Sine.prototype.step = function(strip, color) {
  this._step(strip.size);
  this._draw(strip, color);
}

DiscoStick.prototype.Sine.prototype._step = function(size) {
}

DiscoStick.prototype.Sine.prototype._draw = function(strip, cv) {
    // Do something to fill the buffer
    if (this.amplitude == 0) return;
    var rate = ((this.basic_rate * this.frequency) / this.frequency_to_angle);
    var rads_per_pixel = ((2 * Math.PI) * rate) / strip.size();
    for (var i = 0; i < strip.size(); i++) {
      var wave = Math.sin((rads_per_pixel * i) + this.phase);
      var mag = Math.abs((this.amplitude * wave) + this.shift);
      if (mag < 0) mag = 0;
      strip.buffer[i][0] += mag * cv[0];
      strip.buffer[i][1] += mag * cv[1];
      strip.buffer[i][2] += mag * cv[2];
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
  var n = 0;
  for(var i = 0; i < array.length; ++i) {
    n = i + 1;
    this.spectra_plot.plot((n * this.step) + " hz", array[i] * this.spectral_modifiers[i]);
    this.sine_plot.plot((n * this.step), this.sine_scale * array[i] * this.spectral_modifiers[i], phase, 0);
    this.Sines[i * this.step] = new this.Sine((n * this.step), array[i] * this.spectral_modifiers[i], phase, 30 - (n * this.mag_step));
    phase = (i % 2) ? Math.PI / 2 : 0;
  }
}

DiscoStick.prototype.update = function(fourier_buckets) {
  this.generateSines(fourier_buckets);
}

DiscoStick.prototype.motion_xy = function(new_x,new_y) {
  var dt = Date.now() - this.last_xy_time;
  if (dt <= 0) dt = 1;
  var x = (new_x - this.last_x) * 1000/dt;
  var y = (new_y - this.last_y) * 1000/dt;
  this.last_x = new_x;
  this.last_y = new_y;
  this.last_xy_time = Date.now();
  this.color_plot.R(x);
  this.color_plot.G(y);
}

DiscoStick.prototype.motion_z = function(x,y,factor) {
  var dt = Date.now() - this.last_z_time;
  if (dt <= 0) dt = 1;
  var delta = y * (1000/dt);
  this.last_z_time = Date.now();
  this.color_plot.B(delta);
}

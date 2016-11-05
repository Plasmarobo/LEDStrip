function AudioSystem() {
  this.context = new (window.AudioContext || window.webkitAudioContext)();
  this.analyser = this.context.createAnalyser();
  this.gainNode = this.context.createGain();
  this.source = this.context.createBufferSource();
  this.loaded = false;
  this.n_buckets = 16; //Minimum
}

AudioSystem.prototype.load = function(file, callback) {
  this.context.decodeAudioData(file,(function(buffer){
    this.source = this.context.createBufferSource();
    this.source.buffer = buffer;
    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.analyser.fftSize = this.n_buckets * 2;
    //this.analyser.freqData = this.n_buckets;
    this.fourier_array = new Uint8Array(this.n_buckets); // create an array to store the data
    //this.freqData = new Uint8Array(buffer.getChannelData(0));
    this.loaded = true;
    callback();
  }).bind(this));
}

AudioSystem.prototype.size = function() {
  return this.n_buckets;
}

AudioSystem.prototype.stepSize = function() {
  return this.context.sampleRate / this.n_buckets;
}

AudioSystem.prototype.start = function() {
  this.source.start(0);
}

AudioSystem.prototype.stop = function() {
  this.source.stop(true, false);
}

AudioSystem.prototype.getFrequencyBuckets = function() {
  if (this.loaded == false) {
    return [0];
  }
  this.analyser.getByteFrequencyData(this.fourier_array);
  return this.fourier_array;
}

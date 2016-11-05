function SinePlot(target_id) {

  this.graph = document.getElementById(target_id);

  this.context = this.graph.getContext("2d");
  this.context.font = '18px sans-serif';
  this.context.strokeStyle = '#000';
  this.context.lineJoin = 'round';

  this.sines = {};
  this.margin = {};
  this.margin.top = 10;
  this.margin.bottom = 10;
  this.margin.left = 10;
  this.margin.right = 10;
  
  this.resolution_x = 2 * 44100 * Math.PI;
  this.resolution_y = 0.05;
  this.sample_rate = 44100;
  //this
  //canvas, context, canvas2, context2,
  this.xAxis = 5;
  this.yAxis = 5;
}

SinePlot.prototype.resize = function(width, height) {
  this.height = $(this.graph).height();
  this.width = $(this.graph).width();
    
  this.xAxis = Math.floor(this.height/2);
  this.context.save();
}

SinePlot.prototype.plot = function(frequency, amplitude, phase, shift) {
  this.sines[frequency] = {"amplitude" : amplitude, "phase" : phase, "shift" : shift};
  var y = (2*amplitude)/(this.height-this.xAxis);
  //var x = frequency/(this.width-this.yAxis);
  //var x = (frequency/this.step) * 2 * Math.PI;
  if(this.resolution_y < y) {
    this.resolution_y = y;
  }
  //if(this.resolution_x < x) {
  //  this.resolution_x = x;
  //}
}

SinePlot.prototype.draw = function() {
  // Clear the canvas
  this.context.clearRect(0, 0, this.width, this.height);

  // Draw the axes in their own path
  this.context.beginPath();
  // Draw X and Y axes
  this.context.moveTo(0, this.xAxis);
  this.context.lineTo(this.width, this.xAxis);
  this.context.moveTo(this.yAxis, 0);
  this.context.lineTo(this.yAxis, this.height);
    
  // Draw X axis tick at PI
  this.context.moveTo(this.yAxis+Math.PI*this.resolution_x, this.xAxis+5);
  this.context.lineTo(this.yAxis+Math.PI*this.resolution_x, this.xAxis-5);
  this.context.stroke();  
  // Set styles for animated graphics
  this.context.save();
  this.context.strokeStyle = '#00f';
  this.context.fillStyle = '#c7c7c7';
  this.context.lineWidth = 2;

  for(var freq in this.sines) {
    this.draw_sine(freq, this.sines[freq]);
  }

  // Restore original styles
  this.context.restore();
}

SinePlot.prototype.getColor = function(value) {
    //value from 0 to 1
    var hue=(value*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}

SinePlot.prototype.draw_sine = function(frequency, sine) {
  this.context.beginPath();
  this.context.strokeStyle = this.getColor(frequency/this.sample_rate);
  var y = (sine["amplitude"] * Math.sin(frequency + sine["phase"])) + sine["shift"];
  this.context.moveTo(this.yAxis, this.resolution_y*y+this.xAxis);
  
  // Loop to draw segments
  for (i = this.yAxis; i <= this.width; i += 1) {
    x = (sine["phase"] + (frequency) * (-this.yAxis+i))/this.resolution_x;
    y = Math.sin(x);
    this.context.lineTo(i, sine["amplitude"]*this.resolution_y*y+this.xAxis+sine["shift"]);
  }
  this.context.stroke();
}

SinePlot.prototype.clear = function() {
  this.sines = {};
}
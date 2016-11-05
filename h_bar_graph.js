function HBarPlot(target_id) {

  this.graph = document.getElementById(target_id);

  this.context = this.graph.getContext("2d");
  this.context.font = '18px sans-serif';
  this.context.strokeStyle = '#000';
  this.context.lineJoin = 'round';

  this.margin = {};
  this.margin.top = 10;
  this.margin.bottom = 10;
  this.margin.left = 10;
  this.margin.right = 10;
  this.pad = 10;
  this.innerPad = 2;
  this.colors = [];
  this.data = {};
  this.max = 0;
  
   this.color_array = [
    '#c0392b',
    '#e74c3c',
    '#d35400',
    '#e67e22',
    '#f39c12',
    '#f1c40f',
    '#27ae60',
    '#2ecc71',
    '#1abc9c',
    '#16a085',
    '#4aa3df',
    '#2980b9',
    '#8e44ad',
    '#9b59b6',
    '#bdc3c7',
    '#ecf0f1',
    '#95a5a6'
  ];
  this.color_index = 0;
  this.bucket_height = 0;
}

HBarPlot.prototype.nextColor = function() {
  var tmp = this.color_index;
  this.color_index += 1;
  return this.color_array[tmp];
}

HBarPlot.prototype.adjustScale = function() {
  var current_max = 0;
  for(var name in this.data) {
    if(current_max < this.data[name].value) {
      current_max = this.data[name].value;
    }
  }
  
  if (current_max < this.max) {
    this.max = (this.max + current_max) / 2;
  } else {
    this.max = current_max;
  }
  if (this.max < 1) this.max = 1;
  this.bucket_height = ((this.height - this.margin.top - this.margin.bottom - this.pad) / Object.keys(this.data).length) - this.pad;
}

HBarPlot.prototype.resize = function(width, height) {
  this.height = $(this.graph).height();
  this.width = $(this.graph).width();
    
  this.bucket_height = (this.height - this.margin.top - this.margin.bottom - (this.pad * 3))/(Object.keys(this.data).length);
}

HBarPlot.prototype.plot = function(name, value) {
  //Color
  //Value
  //Name
  if (this.data.hasOwnProperty(name)) {
    this.data[name].value = value;
  } else {
    var datum = {};
    datum.name = name;
    datum.value = value;
    datum.color = this.nextColor();
    this.data[name] = datum;
  }
}

HBarPlot.prototype.draw = function() {
  this.adjustScale();
  // Clear the canvas
  this.context.clearRect(0, 0, this.width, this.height);
  
  this.context.strokeStyle = '#000';
  this.context.fillStyle = '#c7c7c7';
  this.context.lineWidth = 1;
  this.context.save();

  // Draw the sine curve at time draw.t, as well as the circle.
  this.context.beginPath();
  var y = this.margin.top;
  for(var i = 0; i < Object.keys(this.data).length; ++i) {
    this.context.moveTo(this.margin.left, y);
    y += this.bucket_height;
    this.context.lineTo(this.margin.left, y);
    
    y += this.pad;
  }
  this.context.stroke();
  this.context.moveTo(0,0);
  // Loop to draw segments
  var y = this.margin.top + this.innerPad;
  var x = this.margin.left;
  var w = this.width - this.pad - this.margin.right - this.margin.left;
  var h = this.bucket_height - (this.innerPad * 2);
  for (i = 0; i < Object.keys(this.data).length; ++i) {
    var datum = this.data[Object.keys(this.data)[i]];
    this.context.fillStyle = datum.color;
    this.context.fillRect(x, y, w * datum.value / this.max, h);
    this.context.strokeRect(x,y,w * datum.value / this.max,h);
    y += this.bucket_height + this.pad;
  }

  this.context.restore();
  
  // Draw the xAxis PI tick and the time
  //this.context.fillText("Ï�", xAxis + 59+3*unit, 18+xAxis);
}

HBarPlot.prototype.clear = function() {
  this.data = {};
  this.color_index = 0;
}
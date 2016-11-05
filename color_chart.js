function ColorPlot(target_id) {

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
  this.innerPad = 10;
  
  this.color = []
  this.color[0] = 0;
  this.color[1] = 0;
  this.color[2] = 0;
  
  this.colors = ['#FF0000', '#00FF00', '#0000FF'];

}

ColorPlot.prototype.resize = function(width, height) {
  this.height = $(this.graph).height();
  this.width = $(this.graph).width();
    
  this.bucket_height = (this.height - this.margin.top - this.margin.bottom - (this.pad * 3))/4;
}

ColorPlot.prototype.update = function(color) {
 this.color[0] = color.r;
 this.color[1] = color.g;
 this.color[2] = color.b;
}

ColorPlot.prototype.draw = function() {
  // Clear the canvas
  this.context.clearRect(0, 0, this.width, this.height);
  
  this.context.strokeStyle = '#000';
  this.context.fillStyle = '#c7c7c7';
  this.context.lineWidth = 1;
  this.context.save();

  // Draw the sine curve at time draw.t, as well as the circle.
  this.context.beginPath();
  var y = this.margin.top;
  for(var i = 0; i < 3; ++i) {
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
  for (i = 0; i < 3; ++i) {
    this.context.fillStyle = this.colors[i];
    this.context.fillRect(x, y, w * this.color[i]/255, h);
    this.context.strokeRect(x,y,w * this.color[i]/255,h);
    y += this.bucket_height + this.pad;
  }
  this.context.fillStyle = 'rgb(' + this.color[0], + ',' +this.color[1] + ',' + this.color[2] + ')';
  this.context.fillRect(this.margin.left + this.innerPad, y, this.bucket_height-this.pad, this.bucket_height-this.pad);
  this.context.strokeRect(this.margin.left + this.innerPad, y, this.bucket_height-this.pad, this.bucket_height-this.pad);
  
  // Restore original styles
  this.context.restore();
  
  // Draw the xAxis PI tick and the time
  //this.context.fillText("Ï�", xAxis + 59+3*unit, 18+xAxis);
}

ColorPlot.prototype.clear = function() {
  this.color[0] = 0;
  this.color[1] = 0;
  this.color[2] = 0;
}
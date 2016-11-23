function Vector3Plot(target_id) {
  this.graph = document.getElementById(target_id);

  this.margin = {};
  this.margin.top = 10;
  this.margin.bottom = 10;
  this.margin.left = 10;
  this.margin.right = 10;
  
  this.unit = 100;
  
  this.weights = [ 1/16, 1/16, 1/8, 1/4, 1/2];
  this.averages = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)];

	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setClearColor(0xc7c7c7, 1.0 );
	this.graph.appendChild(this.renderer.domElement);
	this.scene = new THREE.Scene();
	// Add some objects to the scene, one per quadrant
  this.xAxis = this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 1.0, 0, 0 ), 0xFF0000, false ); // +X
	//axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -vec3.x, 0, 0 ), 0xFF0000, true) ); // -X
	this.yAxis = this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 1.0, 0 ), 0x00FF00, false ); // +Y
	//axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -vec3.y, 0 ), 0x00FF00, true ) ); // -Y
	this.zAxis = this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 1.0 ), 0x0000FF, false ); // +Z
	//axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -vec3.z ), 0x0000FF, true ) ); // -Z
  
	this.scene.add( this.xAxis );
	this.scene.add( this.yAxis );
	this.scene.add( this.zAxis );
	this.next = new THREE.Vector3(0,0,0);
}

Vector3Plot.prototype.resize = function(width, height) {
  this.height = $(this.graph).height();
  this.width = $(this.graph).width();
  this.renderer.setSize( this.width, this.height );
  this.camera = new THREE.PerspectiveCamera( 45, this.width / this.height, 1, 1000);
	this.camera.position.set( 50, 50, 50);
	this.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
}

Vector3Plot.prototype.update = function() {
  this.plot(this.next);
}

Vector3Plot.prototype.plot = function(vec3) {
  this.averages.shift();
  this.averages.push(vec3);
  //Exponential weighting
  var avg = new THREE.Vector3(0,0,0);
  for(var i = 0; i < this.averages.length; ++i) {
    avg.x += this.averages[i].x * this.weights[i];
    avg.y += this.averages[i].y * this.weights[i];
    avg.z += this.averages[i].z * this.weights[i];
  }
  this.xAxis.scale.x = avg.x;
  this.yAxis.scale.y = avg.y;
  this.zAxis.scale.z = avg.z;
}

Vector3Plot.prototype.X = function(x) {
  this.next.x = x;
}

Vector3Plot.prototype.Y = function(y) {
  this.next.y = y; 
}

Vector3Plot.prototype.Z = function(z) {
  this.next.z = z;
}

Vector3Plot.prototype.draw = function(){
  this.renderer.render( this.scene, this.camera );
}

Vector3Plot.prototype.buildAxis = function(src, dst, colorHex, dashed ) {
		var geom = new THREE.Geometry(),
			mat; 

		if(dashed) {
			mat = new THREE.LineDashedMaterial({ linewidth: 8, color: colorHex, dashSize: 3, gapSize: 3 });
		} else {
			mat = new THREE.LineBasicMaterial({ linewidth: 8, color: colorHex });
		}

		geom.vertices.push( src.clone() );
		geom.vertices.push( dst.clone() );
		geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

		var axis = new THREE.Line( geom, mat, THREE.LineSegments );

		return axis;
}

Vector3Plot.prototype.clear = function() {
  this.xAxis.scale.x = 1;
  this.yAxis.scale.y = 1;
  this.zAxis.scale.z = 1;
}

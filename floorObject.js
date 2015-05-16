var floorObject = function(sideLength, segmentLength, color) {
	
	this.sideLength = sideLength

	this.color = color

	this.segmentLength = segmentLength

	this.geometry = new THREE.Geometry()

	this.createVertices =  function(this.sideLength, this.Geometry, this.segmentLength) {
    var limit = Math.floor(sideLength / segmentLength) 
    for (var y = 0; y <= limit; y++) 
      for (var x = 0; x <= limit; x++) {
        geometry.vertices.push(new THREE.Vector3( x * segmentLength, y * segmentLength, 0 ))
      }
  }

	this.createFaces = function(geometry, limit) {
    for (y = 0; y < limit - 1; y++)
      for (var x = 0; x < limit; x++) {
        //Connects the floor faces. Basically the floor is made up of smalller squares which are alway comprised of two triangles
        //whose vertices are (0, 1, 2) and (0, 2, 3) [the four square vertices], I automate this by acting like each part-square
        //has an index (limit) which gets as an offset, and the x and y level of the current square
        geometry.faces.push(new THREE.Face3( (limit + 1) * y + x, (limit + 1) * y + 1 + x, (limit + 1) * y + (limit + 2) + x))
        geometry.faces.push(new THREE.Face3( (limit + 1) * y + x, (limit + 1) * (y + 1) + 1 + x, (limit + 1) * (y + 1) + x ))
      }
  }

  this.transform = function(floorObject) {
    floorObject.geometry.vertices.forEach(function(vertex) {
      // if (vertex.x == -2500 || vertex.x == 2500)
      //   vertex.z += 3000
      // else

        vertex.z = getRandom(-100, 100)
    })
  }
}
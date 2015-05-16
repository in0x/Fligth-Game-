window.onload = function() {
      
  var RENDER_WIDTH, RENDER_HEIGHT, clock, mesh_list = [], obstacles_list = [],
      lastCheckPosition, scene, camera, controls, treeGeo, renderer, floor, floorColor,
      skycolor, meshcolor, pickup_list = [], score = 0, start, pickup, timer, multiplicator = 1, treeColors

  var pickupMaterial = new THREE.MeshPhongMaterial({
      color: 0x33FF33, 
      specular: 0x00FF33, 
      emissive: 0x009900, 
      shininess: 70, 
      shading: THREE.FlatShading, 
      blending: THREE.NormalBlending  
    });

   function init() {

    RENDER_WIDTH = window.innerWidth 
    RENDER_HEIGHT = window.innerHeight  
    clock = new THREE.Clock()
    lastCheckPosition = -2000
    skycolor = 0x5AE8CD//0x96e0e7
    meshcolor = 'hotpink' //0xE27A3F //'hotpink'
    floorColor = 'hotpink' //0xEFC94C
    timer = new THREE.Clock(),
    treeColors = [0xE27A3F, 0xCB5333, 0xE2490B]

     clock.start()
      ///pointer locking////
      var userHasPointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document
      var element = document.body
      
      if (userHasPointerLock) {  
        
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock
        
        var pointerlockchange = function ( event ) {
          if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
            controls.enabled = true
          } 
        } 
        
        document.addEventListener('keypress', function(e) {
        
        if (e.keyCode == 13) {
          //element.webkitRequestFullscreen()
          element.requestPointerLock()
          $('#splash').remove()
          start = true
          //element.webkitRequestFullscreen()
         // renderer.setSize(screen.width, screen.height) 
        }
          document.addEventListener( 'pointerlockchange', pointerlockchange, false )
          document.addEventListener( 'mozpointerlockchange', pointerlockchange, false )
          document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false )
        })
      } 
      ///pointer locking end////

      scene = new THREE.Scene()
      renderer = new THREE.WebGLRenderer({antialias: true})
      renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT)
      renderer.setClearColor( skycolor, 1 ) 
      document.body.appendChild(renderer.domElement)
    
      camera = new THREE.PerspectiveCamera(60, RENDER_WIDTH / RENDER_HEIGHT, 1, 8000)
      camera.lookAt(0, 0, 0)
      scene.add(camera)
     
      controls = new THREE.PointerLockControls(camera)
      scene.add(controls.getObject())

      scene.add(new THREE.AmbientLight(0x333333))
      var directionalLight = new THREE.DirectionalLight(0xffffff)
      directionalLight.position.set(200, 200, 200);
      directionalLight.target.position.set(0, 0, 0);

      scene.add(directionalLight)

      scene.fog = new THREE.FogExp2( skycolor, 0.00030)

      pickup = new THREE.Mesh(new THREE.IcosahedronGeometry(70, 0), pickupMaterial)

      //Danger! May cause null reference in current state, since load completion isn't
      //guaranteed before the mesh is used.   
      var loader = new THREE.JSONLoader()
      function createScene(geometry) {
          treeGeo = geometry
          spawnObstacles(treeGeo, -3000)
          spawnObstacles(treeGeo, -6000)
      }
      var callback = function(geometry) {createScene(geometry)}
      loader.load("better_tree.js", callback)
      
      floorGeo = new THREE.Geometry()
      createVertices(6000, floorGeo, 250)
      floorGeo.computeFaceNormals() // Need to compute face normals to apply directional lighting
      floorGeo.computeVertexNormals()
      floor = new THREE.Mesh(floorGeo,  new THREE.MeshPhongMaterial( {color: floorColor, fog: true, shading: THREE.FlatShading})) //, side: THREE.DoubleSide
      transformFloor(floor)
     //floor = new THREE.Mesh(new THREE.PlaneGeometry(7000, 10000, 4), new THREE.MeshLambertMaterial( {color: floorColor, fog: true} )) //side: THREE.DoubleSide,
      floor.rotation.x = 90 * Math.PI / 180
      floor.rotation.y = 180 * Math.PI / 180
      floor.position.x += 3000
      floor.position.z -= 6000
      floor.position.y = 0
      scene.add(floor)

      stats = new Stats()
      stats.domElement.style.position = 'absolute'
      stats.domElement.style.bottom = '0px'
      stats.domElement.style.right = '0px'
      document.body.appendChild( stats.domElement )

      var boop = new floorObject(6000, 250, 'hotpink')
      boop.createVertices()
  }

  function createVertices(sideLength, geometry, segmentLength) {
    var limit = Math.floor(sideLength / segmentLength) 
    for (var y = 0; y <= limit; y++) 
      for (var x = 0; x <= limit; x++) {
        geometry.vertices.push(new THREE.Vector3( x * segmentLength, y * segmentLength, 0 ))
      }
    createFaces(geometry, limit)
  }

  function createFaces(geometry, limit) {
    for (y = 0; y < limit - 1; y++)
      for (var x = 0; x < limit; x++) {
        //Connects the floor faces. Basically the floor is made up of smalller squares which are alway comprised of two triangles
        //whose vertices are (0, 1, 2) and (0, 2, 3) [the four square vertices], I automate this by acting like each part-square
        //has an index (limit) which gets as an offset, and the x and y level of the current square
        geometry.faces.push(new THREE.Face3( (limit + 1) * y + x, (limit + 1) * y + 1 + x, (limit + 1) * y + (limit + 2) + x))
        geometry.faces.push(new THREE.Face3( (limit + 1) * y + x, (limit + 1) * (y + 1) + 1 + x, (limit + 1) * (y + 1) + x ))
      }
  }

  function transformFloor(floorObject) {
    floorObject.geometry.vertices.forEach(function(vertex) {
      // if (vertex.x == 0 || vertex.x == 6000)
      //   vertex.z += 4000
      // else
        vertex.z = getRandom(-100, 100)
    })
  }

  function resetFloor(curViewPos) {
    var tempFloor = floor.clone()
    tempFloor.position.z = (curViewPos - 7000)
    tempFloor.rotation.z = 180 * Math.PI / 180
    scene.add(tempFloor)
  }

  function reloadWorld() {
    var currentViewingPosition = controls.getObject().position.z
    //Happens at -2000, -4000, -6000, etc.
    if (lastCheckPosition + (-1*currentViewingPosition) > 0) {
      lastCheckPosition -= 2000
      resetFloor(lastCheckPosition)
      spawnObstacles(treeGeo, lastCheckPosition - 5000)
    }
  }

  function spawnObstacles(mesh, curViewPos) {
    mesh_list.forEach(function(el) {
      if (el.position.z > controls.getObject().position.z)
        mesh_list.splice(mesh_list.indexOf(el), 1)
    })    
    //Pickups and trees
    for (var y = 0; y < 3; y++)
      for (var x = 0; x < 3; x++) {
       
        var x_pos = getRandom(-1500 + 1000 * x, -1500 + 1000 * (x + 1)),
            z_pos = getRandom(curViewPos, curViewPos - 1000 * y),
            y_pos = getRandom(-900, 0)

        if (y == 1 && x == 1 && getRandom(0, 11) > 6) {
          var tempPickup = pickup.clone()
          tempPickup.position.set(x_pos + 300, 300, z_pos)
          tempPickup.rotation.y = 45 * Math.PI/180
          tempPickup.rotation.x = 45 * Math.PI/180
          scene.add(tempPickup)
          pickup_list.push(tempPickup)
          mesh_list.push(tempPickup)
        }

        var tempMesh = new THREE.Mesh(treeGeo, new THREE.MeshLambertMaterial( { color: meshcolor} )) 
        tempMesh.scale.set(60, 100, 60)
        tempMesh.position.set(x_pos, y_pos, z_pos)
        tempMesh.rotation.y = (Math.random() * 10)
        scene.add(tempMesh)
        mesh_list.push(tempMesh)
      }
    } 

    function getRandom(min, max) {
      return Math.floor((Math.random() * (max - min) + min))
    }

    function animatePickups() {
      pickup_list.forEach(function(el) {
        el.rotation.y += 2 * Math.PI / 180
      })
    }

    function checkCollisions() {
      var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone()
      var raycaster = new THREE.Raycaster( controls.getObject().position, cameraDirection.clone().normalize(), 0, 100)
      var collisionResults = raycaster.intersectObjects(mesh_list, true)
      
      if(collisionResults.length > 0 && collisionResults[0].distance < 50) {
        if (collisionResults[0].object.material === pickupMaterial) {
          scene.remove(collisionResults[0].object)
          // NEED TO REMOVE ELEMENT FROM MESHLIST!!!!! //
          mesh_list.splice(mesh_list.indexOf(collisionResults[0].object), 1)
          multiplicator *= 2
          if (timer.elapsedTime == 0) {
            timer.start()
          } else 
            timer.elapsedTime = 0
        } else {
          document.location.reload(true)
        }
      }
    }

    function drawUI() {
      $('#score').html('Score: ' + multiplicator + 'x')

      if (start)
        score += Math.floor(controls.velocity.z * -1 / 1000) * multiplicator
   
      $('#speed').html("Vel: " + controls.velocity.z)
      $('#distance').html(Math.round(score / 100)) 
    }

    function render() {
      controls.update(clock.getElapsedTime())
      checkCollisions()

      if (multiplicator > 0) {
        if (timer.getElapsedTime() >= 4) {
          multiplicator = 1
          timer.stop()
          timer.elapsedTime = 0
        }
      }

      drawUI()
      //floor.position.z = controls.getObject().position.z - 2000
      animatePickups()
      reloadWorld()
      stats.update()
    }

    function animate() {
      requestAnimationFrame( animate )
      render()
      renderer.render(scene, camera)
    }

    init()
    animate()
  }

var floorObject = function(side, segments, meshColor) {
  var sideLength = side,
      color = meshColor,
      segmentLength = segmentLength,
      geometry = new THREE.Geometry()

  //this.createObject = function()
  this.createVertices =  function() {
    var limit = Math.floor(sideLength / segmentLength) 
    for (var y = 0; y <= limit; y++) 
      for (var x = 0; x <= limit; x++) {
        this.geometry.vertices.push(new THREE.Vector3( x * segmentLength, y * segmentLength, 0 ))
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
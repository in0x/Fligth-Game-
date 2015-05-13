window.onload = function() {
      
  var RENDER_WIDTH, RENDER_HEIGHT, clock, mesh_list = [], obstacles_list = [],
      lastCheckPosition, scene, camera, controls, treeGeo, renderer, floor, floorColor,
      skycolor, meshcolor, pickup_list = [], score = 0, start, pickup, timer, multiplicator = 0

  var pickupMaterial = new THREE.MeshPhongMaterial({
      color: 0x33FF33, 
      specular: 0x00FF33, 
      emissive: 0x009900, 
      shininess: 60, 
      shading: THREE.FlatShading, 
      blending: THREE.NormalBlending, 
      depthTest: true,
      transparent: false,
      opacity: 1.0    
    });


   function init() {

    RENDER_WIDTH = window.innerWidth
    RENDER_HEIGHT = window.innerHeight
    clock = new THREE.Clock()
    lastCheckPosition = -2000
    skycolor = 0x5AE8CD//0x96e0e7
    meshcolor = 0xE27A3F //'hotpink'
    floorColor = 0xEFC94C
    timer = new THREE.Clock()

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
    
      camera = new THREE.PerspectiveCamera(70, RENDER_WIDTH / RENDER_HEIGHT, 0.1, 8000)
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

      pickup = new THREE.Mesh(new THREE.IcosahedronGeometry(50, 0), pickupMaterial)

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
      
      floor = new THREE.Mesh(new THREE.PlaneGeometry(7000, 10000, 4), new THREE.MeshLambertMaterial( {color: floorColor, side: THREE.DoubleSide, fog: true} ))
      floor.rotation.x = 90 * Math.PI / 180
      floor.position.y = 0
      scene.add(floor)

      stats = new Stats()
      stats.domElement.style.position = 'absolute'
      stats.domElement.style.bottom = '0px'
      stats.domElement.style.right = '0px'
      document.body.appendChild( stats.domElement )
      console.log(floor.geometry.vertices)  

      transformFloor()
  }

  function transformFloor() {
    floor.geometry.vertices.forEach(function(vertex) {
      if (vertex.x == -3500 || vertex.x == 3500)
        vertex.z -= 3000
      else 
        vertex.z = getRandom(-200, 200)
    })
  }

  function reloadWorld() {
    var currentViewingPosition = controls.getObject().position.z
    //Happens at -2000, -4000, -6000, etc.
    if (lastCheckPosition + (-1*currentViewingPosition) > 0) {
      lastCheckPosition -= 2000
      spawnObstacles(treeGeo, lastCheckPosition - 5000)
    }
  }
  
  function spawnObstacles(mesh, curViewPos) {
    for (var y = 0; y < 3; y++)
      for (var x = 0; x < 3; x++) {
       
        var x_pos = getRandom(-1500 + 1000 * x, -1500 + 1000 * (x + 1)),
            z_pos = getRandom(curViewPos, curViewPos - 1000 * y),
            y_pos = getRandom(-900, 0)

        if (y == 1 && x == 1) {
          var tempPickup = pickup.clone()
          tempPickup.position.set(x_pos + 300, 300, z_pos)
          tempPickup.rotation.y = 45 * Math.PI/180
          tempPickup.rotation.x = 45 * Math.PI/180
          scene.add(tempPickup)
          pickup_list.push(tempPickup)
          mesh_list.push(tempPickup)
        }

        var tempMesh = new THREE.Mesh(treeGeo, new THREE.MeshLambertMaterial( { color: meshcolor } )) 
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
          multiplicator += 2
          if (time.elapsedTime == 0) {
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
        score += Math.floor(controls.velocity.z * -1 / 100)
   
      $('#speed').html("Vel: " + controls.velocity.z)
      $('#distance').html(score) 
    }

    function animate() {
      requestAnimationFrame( animate )
      controls.update(clock.getElapsedTime())
      checkCollisions()
      

      if (multiplicator > 0) {
        if (timer.getElapsedTime() >= 4) {
          multiplicator = 0
          timer.stop()
          timer.elapsedTime = 0
        }
      }
      drawUI()
            
      floor.position.z = controls.getObject().position.z - 2000

      animatePickups()
      reloadWorld()
      stats.update()
      renderer.render(scene, camera)
    }

    init()
    animate()
  }
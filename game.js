window.onload = function() {
      
      var RENDER_WIDTH = window.innerWidth, RENDER_HEIGHT = window.innerHeight
      var clock = new THREE.Clock()
      clock.start()
      var mesh_list = []
   
     ///pointer locking////
     var iHazPointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document

     var element = document.body

      if (iHazPointerLock) {  
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
        }
          document.addEventListener( 'pointerlockchange', pointerlockchange, false )
          document.addEventListener( 'mozpointerlockchange', pointerlockchange, false )
          document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false )
        })
      } 
    ///pointer locking end////

    // Creating scene
    var scene = new THREE.Scene()
  
    // Camera
    var camera = new THREE.PerspectiveCamera(45, RENDER_WIDTH / RENDER_HEIGHT, 0.1, 10000)
    scene.add(camera)
   
    var controls = new THREE.PointerLockControls(camera)
    scene.add( controls.getObject() )

    //First front left cube
    var cube = new THREE.Mesh(new THREE.BoxGeometry(100, 1000, 3000), new THREE.MeshLambertMaterial({
      color: 'blue' 
    }))
    cube.side = THREE.DoubleSide
    cube.overdraw = true
    cube.rotation.x = Math.PI * 0.1
    cube.translateX(-1500)
  
    //back lef cube
    var cube1front = new THREE.Mesh(new THREE.BoxGeometry(100, 1000, 3000), new THREE.MeshLambertMaterial({
      color: 'green' 
    }))
    cube1front.overdraw = true
    cube1front.rotation.x = Math.PI * 0.1
    cube1front.translateX(-1500)
    cube1front.translateZ(-3000)
 
    // front right cube
    var cube2 = cube.clone()
    cube2.translateX(3000)
   
    // back right cube
    var cube2left = cube1front.clone()
    cube2left.translateX(3000)

    // Light
    scene.add(new THREE.AmbientLight(0x333333))
    // directional lighting
    var directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.position.set(1, 1, 1).normalize()
    scene.add(directionalLight)

    //fog to mask reloading
    //scene.fog = new THREE.Fog('#0xeeeeee', 3000, 4000)
    //scene.fog = new THREE.FogExp2( 0x96e0e7, 0.0005 )
    scene.fog = new THREE.FogExp2( 0x96e0e7, 0.00025)

    // Add a check value and only start the game when all meshes have been loaded    
    var loader = new THREE.JSONLoader()
    function createScene(geometry, x, y, z, scale) {
        zmesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 'green'}))
        zmesh.position.set(x, y, z)
        zmesh.scale.set(scale, scale, scale)
        mesh_list.push(zmesh)
        zmesh.translateZ(-200)
        zmesh.rotation.x += 18 * Math.PI / 180
        zmesh.rotation.y = (Math.random() * 10)
        scene.add(zmesh)
    }
    var callback = function(geometry) {createScene(geometry, 0, 0, -80, 100 )}
    loader.load("tree.js", callback)
    
  

    // My cube for detecting collisions with
    var detectionBody = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshLambertMaterial({color: 'blue'}))
    detectionBody.translateZ(-300)
    //detectionBody.rotation.y +=  45 * 180 / Math.PI
    //scene.add(detectionBody)
    //camera.add(detectionBody)

    var hitSphere = new THREE.Mesh(new THREE.SphereGeometry( 30, 32, 32), new THREE.MeshLambertMaterial({color: 'pink'}))
    hitSphere.translateZ(-500)
    hitSphere.translateX(300)
    hitSphere.translateY(100)
  
    scene.add(cube)
    scene.add(cube2)
    scene.add(cube1front)
    scene.add(cube2left) 
    scene.add(hitSphere)

    //These are the objects to check raycasting intersection with
    mesh_list.push(cube)
    mesh_list.push(cube2)
    mesh_list.push(cube1front)
    mesh_list.push(cube2left)
    mesh_list.push(hitSphere)
   
    // Render
    var renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT)
    renderer.setClearColor( 0x96e0e7, 1 )
    document.body.appendChild(renderer.domElement)


    var lastCheckPosition = -1000
    function reloadWorld() {
      var currentViewingPosition = controls.getObject().position.z
      //if (currentViewingPosition + (lastCheckPosition * - 1) < -1000) {
      if (lastCheckPosition + (-1*currentViewingPosition) > 0) {
        mesh_list.forEach(function(mesh) {
          mesh.translateZ(-2000)
        })
        lastCheckPosition -= 2000
      }
    }
    
    var obstacles_list = []

    function spawnObstacles(mesh, currentViewingPosition) {
      if (obstacles_list.length == 9) {
        for (var i = 0; i < 5; i++)
          scene.remove(obstacles_list[i])
        obstacles_list = obstacles_list.slice(5, 9)
      }

      var limit = obstacles_list.length == 9 ? 9 : 6

      for (var y = 0; y < limit / 3; y++)  
        for(var x = 0; x < 3; x++) {
          var leftBound = -1500 + 1000 * x,
              rightBound = leftBound + 1000,
              backBound = 1000 * y


        }

    } 

    function getRandom(min, max) {
      return Math.floor((Math.random() * (max - min) + min) * 100)
    }
    //getRandom(6,9)


    //Actually no dependencies anymore, collision body is the Object3D of the camera
    //Raycaster uses intersectObjects method of objects, these only return a result if the distance between
    //intersection and origin indicates a collision (< 0)
      function animate() {
        requestAnimationFrame( animate )
        controls.update()
        var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone()
        //THREE.Raycaster( origin, direction, near, far)
        var raycaster = new THREE.Raycaster( controls.getObject().position, cameraDirection.clone().normalize(), 0, 100)
        var collisionResults = raycaster.intersectObjects(mesh_list, true)
        if(collisionResults.length > 0 && collisionResults[0].distance < 30)
        {
            if(collisionResults[0].object === hitSphere) {
              console.log("Sphere hit!")
              scene.remove(hitSphere)
            }
            console.log('pew pew pew')
        }
        reloadWorld()
        renderer.render(scene, camera)
        //mesh_list[mesh_list.length - 1].rotation.y = Math.sin(clock.getElapsedTime())
      }
      animate()
    }
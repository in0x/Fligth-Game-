window.onload = function() {
      
  var RENDER_WIDTH = window.innerWidth, 
      RENDER_HEIGHT = window.innerHeight,
      clock = new THREE.Clock(),
      mesh_list = [],
      obstacles_list = [],
      lastCheckPosition = -2000,
      scene, 
      camera, 
      controls,
      treeGeo,
      renderer


   function init() {
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
        }
          document.addEventListener( 'pointerlockchange', pointerlockchange, false )
          document.addEventListener( 'mozpointerlockchange', pointerlockchange, false )
          document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false )
        })
      } 
      ///pointer locking end////

      scene = new THREE.Scene()
    
    
      camera = new THREE.PerspectiveCamera(45, RENDER_WIDTH / RENDER_HEIGHT, 0.1, 10000)
      camera.lookAt(0, 0, 0)
      scene.add(camera)
     
      controls = new THREE.PointerLockControls(camera)
      scene.add(controls.getObject())

      // Light
      scene.add(new THREE.AmbientLight(0x333333))
      // directional lighting
      var directionalLight = new THREE.DirectionalLight(0xffffff)
      directionalLight.position.set(1, 1, 1).normalize()
      scene.add(directionalLight)

      scene.fog = new THREE.FogExp2( 0x96e0e7, 0.00025)

     //First front left cube
      // var cube = new THREE.Mesh(new THREE.BoxGeometry(100, 1000, 3000), new THREE.MeshLambertMaterial({
      //   color: 'blue' 
      // }))
      // cube.side = THREE.DoubleSide
      // cube.overdraw = true
      // //cube.rotation.x = Math.PI * 0.1
      // cube.translateX(-2000)
    
      // //back lef cube
      // var cube1front = new THREE.Mesh(new THREE.BoxGeometry(100, 1000, 3000), new THREE.MeshLambertMaterial({
      //   color: 'green' 
      // }))
      // cube1front.overdraw = true
      // //cube1front.rotation.x = Math.PI * 0.1
      // cube1front.translateX(-2000)
      // cube1front.translateZ(-3000)
   
      // // front right cube
      // var cube2 = cube.clone()
      // cube2.translateX(4000)
     
      // // back right cube
      // var cube2left = cube1front.clone()
      // cube2left.translateX(4000)

      //Danger! May cause null reference in current state, since load completion isn't
      //guaranteed before the mesh is used.   
      var loader = new THREE.JSONLoader()
      function createScene(geometry, x, y, z, scale) {
          // zmesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 'green'}))
          // zmesh.position.set(x, y, z)
          // zmesh.scale.set(scale, scale, scale)
          //mesh_list.push(zmesh)
          // zmesh.translateZ(-200)
          // zmesh.rotation.y = (Math.random() * 10)
          treeGeo = geometry
          //scene.add(zmesh)
          //spawnObstacles(treeGeo, 0)
          spawnObstacles(treeGeo, -3000)
          spawnObstacles(treeGeo, -6000)

      }
      var callback = function(geometry) {createScene(geometry, 0, 0, -80, 100 )}
      loader.load("tree.js", callback)
      

      // scene.add(cube)
      // scene.add(cube2)
      // scene.add(cube1front)
      // scene.add(cube2left) 
      
      //These are the objects to check raycasting intersection with
      // mesh_list.push(cube)
      // mesh_list.push(cube2)
      // mesh_list.push(cube1front)
      // mesh_list.push(cube2left)
     
      renderer = new THREE.WebGLRenderer({antialias: true})
      renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT)
      renderer.setClearColor( 0x96e0e7, 1 )
      document.body.appendChild(renderer.domElement)

      // I want to spawn in 2 levels of trees before i start the game, 
      //but the mesh isn't loaded at this point -> find a way to guarantee mesh load
      // -> maybe a node module
  }


  function reloadWorld() {
    var currentViewingPosition = controls.getObject().position.z
    //Happens at -2000, -4000, -6000, etc.
    if (lastCheckPosition + (-1*currentViewingPosition) > 0) {
      // mesh_list.forEach(function(mesh) {
      //   mesh.translateZ(-2000)
      // })
      lastCheckPosition -= 2000
      //spawnObstacles(treeGeo, lastCheckPosition - 3000)
      spawnObstacles(treeGeo, lastCheckPosition - 5000)
    }
  }
    
    //First x -1500, -500; z position, 1000
    //Second x -500, 500
    //Third x 500, 1500 
  function spawnObstacles(mesh, curViewPos) {
    for (var y = 0; y < 3; y++)
      for (var x = 0; x < 3; x++) {
        // var x_pos = -1500 + 1000 * x,
        //     z_pos = curViewPos - 1000 * y

        var x_pos = getRandom(-1500 + 1000 * x, -1500 + 1000 * (x + 1)),
            z_pos = getRandom(curViewPos, curViewPos - 1000 * y)

        var tempMesh = new THREE.Mesh(treeGeo, new THREE.MeshLambertMaterial( { color: 'hotpink' } ))
        tempMesh.position.set(x_pos, 0, z_pos)
        tempMesh.scale.set(60, 60, 60)
        tempMesh.rotation.y = (Math.random() * 10)
        scene.add(tempMesh)
        mesh_list.push(tempMesh)
      }
    } 

    function getRandom(min, max) {
      return Math.floor((Math.random() * (max - min) + min))
    }
 
    //Actually no dependencies anymore, collision body is the Object3D of the camera
    //Raycaster uses intersectObjects method of objects, these only return a result if the distance between
    //intersection and origin indicates a collision (< 0)
      
    function animate() {
      requestAnimationFrame( animate )
      controls.update(clock.getElapsedTime())
      var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone()
      //THREE.Raycaster( origin, direction, near, far)
      var raycaster = new THREE.Raycaster( controls.getObject().position, cameraDirection.clone().normalize(), 0, 100)
      var collisionResults = raycaster.intersectObjects(mesh_list, true)
      if(collisionResults.length > 0 && collisionResults[0].distance < 30) {
          console.log('pew pew pew')
          alert('*boop* Reload the page to play again')
      }
      $('#speed').html("Vel: " + controls.velocity.z)
      $('#distance').html("Distance: " + Math.floor(controls.getObject().position.z * -1 / 100))
      reloadWorld()
      renderer.render(scene, camera)
    }

    init()
    animate()
  }
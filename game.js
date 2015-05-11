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
      renderer,
      floor


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
    
      renderer = new THREE.WebGLRenderer({antialias: true})
      renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT)
      renderer.setClearColor( 0x96e0e7, 1 )
      document.body.appendChild(renderer.domElement)
    
      camera = new THREE.PerspectiveCamera(50, RENDER_WIDTH / RENDER_HEIGHT, 0.1, 9000)
      camera.lookAt(0, 0, 0)
      scene.add(camera)
     
      controls = new THREE.PointerLockControls(camera)
      scene.add(controls.getObject())

      // Light
      scene.add(new THREE.AmbientLight(0x333333))
      // directional lighting
      var directionalLight = new THREE.DirectionalLight(0xffffff)
      //directionalLight.position.set(1, 1, 1).normalize()
      directionalLight.position.set(200, 200, 200);
      directionalLight.target.position.set(0, 0, 0);

      scene.add(directionalLight)

      scene.fog = new THREE.FogExp2( 0x96e0e7, 0.00025)

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
      
      floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000), new THREE.MeshPhongMaterial( {color: 'hotpink', side: THREE.DoubleSide} ))
      floor.rotation.x = 90 * Math.PI / 180
      floor.position.y = 0
      scene.add(floor)

      // I want to spawn in 2 levels of trees before i start the game, 
      //but the mesh isn't loaded at this point -> find a way to guarantee mesh load
      // -> maybe a node module

      stats = new Stats()
      stats.domElement.style.position = 'absolute'
      stats.domElement.style.bottom = '0px'
      stats.domElement.style.right = '0px'
      document.body.appendChild( stats.domElement )
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
  // Remove all tree meshes behind camera from list so that they wont be checked,
  // it doesn't matter if they are in the scene since they wont be rendered anyways
  function spawnObstacles(mesh, curViewPos) {
    for (var y = 0; y < 3; y++)
      for (var x = 0; x < 3; x++) {
        // var x_pos = -1500 + 1000 * x,
        //     z_pos = curViewPos - 1000 * y

        var x_pos = getRandom(-1500 + 1000 * x, -1500 + 1000 * (x + 1)),
            z_pos = getRandom(curViewPos, curViewPos - 1000 * y),
            y_pos = getRandom(-900, 0)

        // if (y == 1 && x == 1) {
        //   var tempSphere = new THREE.Mesh(new THREE.SphereGeometry(50, 20, 20), new THREE.MeshPhongMaterial({color: 'hotpink', transparent: true, opacity: 0.6}))
        //   tempSphere.position.set(x_pos + 300, 300, z_pos)
        //   scene.add(tempSphere)
        // }

        var tempMesh = new THREE.Mesh(treeGeo, new THREE.MeshLambertMaterial( { color: 'hotpink' } ))
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
      if(collisionResults.length > 0 && collisionResults[0].distance < 100) {
          console.log('pew pew pew')
          //alert('*boop* Reload the page to play again')
          document.location.reload(true)
      }
      $('#speed').html("Vel: " + controls.velocity.z)
      $('#distance').html("Distance: " + Math.floor(controls.getObject().position.z * -1 / 100))
      floor.position.z = controls.getObject().position.z - 2000
      reloadWorld()
      stats.update()
      renderer.render(scene, camera)
    }

    init()
    animate()
  }
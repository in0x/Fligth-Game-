window.onload = function() {
      
      var RENDER_WIDTH = window.innerWidth, 
          RENDER_HEIGHT = window.innerHeight,
          clock = new THREE.Clock(),
          mesh_list = [],
          obstacles_list = [],
          lastCheckPosition = -1000,
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

      // var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry( 1000, 1000, 1, 1), new THREE.MeshLambertMaterial({
      //   color: 0xF0E98B}))
      // //floor.rotation.x = 90 * Math.PI / 180
      // scene.add(floor)

      var testCube = new THREE.Mesh(new THREE.BoxGeometry(300, 300, 300), new THREE.MeshLambertMaterial( {color: 'blue'} ))
      testCube.translateZ(-1200)
      scene.add(testCube)

      //First front left cube
      var cube = new THREE.Mesh(new THREE.BoxGeometry(100, 1000, 3000), new THREE.MeshLambertMaterial({
        color: 'blue' 
      }))
      cube.side = THREE.DoubleSide
      cube.overdraw = true
      //cube.rotation.x = Math.PI * 0.1
      cube.translateX(-2000)
    
      //back lef cube
      var cube1front = new THREE.Mesh(new THREE.BoxGeometry(100, 1000, 3000), new THREE.MeshLambertMaterial({
        color: 'green' 
      }))
      cube1front.overdraw = true
      //cube1front.rotation.x = Math.PI * 0.1
      cube1front.translateX(-2000)
      cube1front.translateZ(-3000)
   
      // front right cube
      var cube2 = cube.clone()
      cube2.translateX(4000)
     
      // back right cube
      var cube2left = cube1front.clone()
      cube2left.translateX(4000)

      // Add a check value and only start the game when all meshes have been loaded    
      var loader = new THREE.JSONLoader()
      function createScene(geometry, x, y, z, scale) {
          zmesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 'green'}))
          zmesh.position.set(x, y, z)
          zmesh.scale.set(scale, scale, scale)
          mesh_list.push(zmesh)
          zmesh.translateZ(-200)
          zmesh.rotation.y = (Math.random() * 10)
          treeGeo = geometry;
          //scene.add(zmesh)
      }
      var callback = function(geometry) {createScene(geometry, 0, 0, -80, 100 )}
      loader.load("tree.js", callback)
      
      scene.add(cube)
      scene.add(cube2)
      scene.add(cube1front)
      scene.add(cube2left) 
      
      //These are the objects to check raycasting intersection with
      mesh_list.push(cube)
      mesh_list.push(cube2)
      mesh_list.push(cube1front)
      mesh_list.push(cube2left)
     
      renderer = new THREE.WebGLRenderer({antialias: true})
      renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT)
      renderer.setClearColor( 0x96e0e7, 1 )
      document.body.appendChild(renderer.domElement)
  }


    function reloadWorld() {
      var currentViewingPosition = controls.getObject().position.z
      if (lastCheckPosition + (-1*currentViewingPosition) > 0) {
        mesh_list.forEach(function(mesh) {
          mesh.translateZ(-2000)
        })
        lastCheckPosition -= 2000
        spawnObstacles(treeGeo, lastCheckPosition)
      }
    }
    
    function spawnObstacles(mesh, curViewPos) {
      for (var y = 0; y < 3; y++)
        for (var x = 0; x < 3; x++) {
          var x_pos = -1500 + 1000 * x,
              z_pos = curViewPos - 1000 * y
          
          var tempMesh = new THREE.Mesh(treeGeo, new THREE.MeshLambertMaterial( { color: 'hotpink' } ))
          tempMesh.position.set(x_pos, 0, z_pos)
          tempMesh.scale.set(10, 10, 10)
          scene.add(tempMesh)
        }
    } 

    function getRandom(min, max) {
      return Math.floor((Math.random() * (max - min) + min) * 100)
    }
 
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
          console.log('pew pew pew')
      }
      reloadWorld()
      renderer.render(scene, camera)
    }

    init()
    animate()
  }
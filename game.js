window.onload = function() {
      
      var RENDER_WIDTH = window.innerWidth, RENDER_HEIGHT = window.innerHeight;
      var clock = new THREE.Clock();
   
     ///pointer locking////
     var iHazPointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

     var element = document.body;

      if (iHazPointerLock) {  
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        var pointerlockchange = function ( event ) {
          if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
            controls.enabled = true;
          } 
        } 
        document.addEventListener('keypress', function(e) {
        if (e.keyCode == 13) {
          element.requestPointerLock();
        }
          document.addEventListener( 'pointerlockchange', pointerlockchange, false );
          document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
          document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
        })
      } 
    ///pointer locking end////

    // Creating scene
    var scene = new THREE.Scene();
  
    // Camera
    var camera = new THREE.PerspectiveCamera(45, RENDER_WIDTH / RENDER_HEIGHT, 0.1, 10000);
    scene.add(camera);
   
    var controls = new THREE.PointerLockControls(camera);
    scene.add( controls.getObject() );

    //First front left cube
    var cube = new THREE.Mesh(new THREE.BoxGeometry(200, 200, 3000), new THREE.MeshLambertMaterial({
      color: 'blue' 
    }));
    cube.side = THREE.DoubleSide;
    cube.overdraw = true;
    cube.rotation.x = Math.PI * 0.1;
  
    //back lef cube
    var cube1front = new THREE.Mesh(new THREE.BoxGeometry(200, 200, 3000), new THREE.MeshLambertMaterial({
      color: 'green' 
    }));
    cube1front.overdraw = true;
    cube1front.rotation.x = Math.PI * 0.1;
    cube1front.translateZ(-3000);
 
    // front right cube
    var cube2 = cube.clone();
    cube2.translateX(600);
   
    // back right cube
    var cube2left = cube1front.clone();
    cube2left.translateX(600);

    // Light
    scene.add(new THREE.AmbientLight(0x333333));
    // directional lighting
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    //fog to mask reloading
    //scene.fog = new THREE.Fog('#0xeeeeee', 3000, 4000);
    scene.fog = new THREE.FogExp2( 0x96e0e7, 0.0005 );


    // My cube for detecting collisions with
    var detectionBody = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), new THREE.MeshLambertMaterial({color: 'blue'}));
    detectionBody.translateZ(-300);
    //detectionBody.rotation.y +=  45 * 180 / Math.PI;
    scene.add(detectionBody);
    camera.add(detectionBody);

    //These are the objects to check raycasting intersection with
    var obj_group = new THREE.Group();
    obj_group.add(cube);
    obj_group.add(cube2);
    obj_group.add(cube1front);
    obj_group.add(cube2left); 
    scene.add(obj_group);

    var mesh_list = [];
    mesh_list.push(cube);
    mesh_list.push(cube2);
    mesh_list.push(cube1front);
    mesh_list.push(cube2left);
   
    // Render
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT);
    renderer.setClearColor( 0x96e0e7, 1 );
    document.body.appendChild(renderer.domElement);


    var lastCheckPosition = -1000;
    function reloadWorld() {
      var currentViewingPosition = controls.getObject().position.z;
      if (currentViewingPosition + (lastCheckPosition * - 1) < -1000) {
        mesh_list.forEach(function(mesh) {
          mesh.translateZ(-2000);
        });
        lastCheckPosition = currentViewingPosition;
      }
    }
    

    //Actually no dependencies anymore, collision body is the Object3D of the camera
    //Raycaster uses intersectObjects method of objects, these only return a result if the distance between
    //intersection and origin indicates a collision (< 0)
      function animate() {
        requestAnimationFrame( animate );
        controls.update();
        var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();
        //THREE.Raycaster( origin, direction, near, far)
        var raycaster = new THREE.Raycaster( controls.getObject().position, cameraDirection.clone().normalize(), 0, 100);
        var collisionResults = raycaster.intersectObjects(mesh_list, true);
        if(collisionResults.length > 0)
        {
            console.log('pew pew pew');
        }
        reloadWorld();
        renderer.render(scene, camera);

      }
      animate();
    };
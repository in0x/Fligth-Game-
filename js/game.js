// Created by Philipp Welsch
// for MMP1(Multimediaprojekt 1)
// at FH Salzburg (UAS Salzburg) MMT (Multimediatechnology)

window.onload = function () {
  var RENDER_WIDTH, RENDER_HEIGHT, clock, mesh_list = [], obstacles_list = [],
    lastCheckPosition, scene, camera, controls, treeGeo, renderer, floorColor, floor,
    skycolor, meshcolor, pickup_list = [], score = 0, start, pickup, pointTimer, multiplicator = 1, treeColors,
    boostTimer, speedStamp = 0, slowTimer, slowStamp, stop = false, scores, sound 

  var pickupMaterial = new THREE.MeshPhongMaterial({
    color: 0x33FF33,
    specular: 0x2AFF5A, // 0x00FF33, 
    emissive: 0x009900,
    shininess: 70,
    shading: THREE.FlatShading,
    blending: THREE.NormalBlending,
  })

  var pickupBlueMaterial = new THREE.MeshPhongMaterial({
    color: 0x3A52FF,
    specular: 0x2786FF,
    emissive: 0x082B99,
    shininess: 70,
    shading: THREE.FlatShading,
    blending: THREE.NormalBlending
  })

  var pickupRedMaterial = new THREE.MeshPhongMaterial({
    color: 0xFF3744,
    specular: 0xFF4B3C,
    emissive: 0x991701,
    shininess: 70,
    shading: THREE.FlatShading,
    blending: THREE.NormalBlending
  })

  function init () {
    RENDER_WIDTH = window.innerWidth
    RENDER_HEIGHT = window.innerHeight
    clock = new THREE.Clock()
    lastCheckPosition = -2000
    skycolor = 0x5AE8CD// 0x96e0e7
    meshcolor = 'hotpink' // 0xE27A3F //'hotpink'
    floorColor = 'hotpink' // 0xEFC94C
    pointTimer = new THREE.Clock(),
    boostTimer = new THREE.Clock(),
    slowTimer = new THREE.Clock(),
    treeColors = [0xE27A3F, 0xCB5333, 0xE2490B]
    sound = new Audio("Collect_Point_01.mp3")

    clock.start()
    // /pointer locking////
    var userHasPointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document
    var element = document.body

    if (userHasPointerLock) {
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock
      var pointerlockchange = function ( event ) {
        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
          controls.enabled = true
        }
      }
      document.addEventListener('keypress', function (e) {
        if (e.keyCode == 13) {
          // element.webkitRequestFullscreen()
          element.requestPointerLock()
          $('#splash').detach()
          start = true
          console.log(controls.getObject().position.z)
        // element.webkitRequestFullscreen()
        // renderer.setSize(screen.width, screen.height) 
        }
        document.addEventListener('pointerlockchange', pointerlockchange, false)
        document.addEventListener('mozpointerlockchange', pointerlockchange, false)
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false)
      })
    }
    // /pointer locking end////

    scene = new THREE.Scene()
    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT)
    renderer.setClearColor(skycolor, 1)
    document.body.appendChild(renderer.domElement)

    camera = new THREE.PerspectiveCamera(75, RENDER_WIDTH / RENDER_HEIGHT, 1, 8000)
    camera.lookAt(0, 0, 0)
    scene.add(camera)

    controls = new THREE.PointerLockControls(camera)
    scene.add(controls.getObject())

    scene.add(new THREE.AmbientLight(0x333333))
    var directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.position.set(200, 200, 200)
    directionalLight.target.position.set(0, 0, 0)

    scene.add(directionalLight)  // deactivate for spooky mode

    scene.fog = new THREE.FogExp2(skycolor, 0.00030)

    pickup = new THREE.Mesh(new THREE.IcosahedronGeometry(70, 0), pickupMaterial)

    // Danger! May cause null reference in current state, since load completion isn't
    // guaranteed before the mesh is used.   
    var loader = new THREE.JSONLoader()
    function createScene (geometry) {
      treeGeo = geometry
      spawnObstacles(treeGeo, -3000)
      spawnObstacles(treeGeo, -6000)
    } 

    var callback = function (geometry) {createScene(geometry)}
    loader.load('js/better_tree.js', callback)

    floorGeo = new THREE.Geometry()
    createVertices(6000, floorGeo, 250)
    floorGeo.computeFaceNormals() // Need to compute face normals to apply directional lighting
    floorGeo.computeVertexNormals()
    floor = new THREE.Mesh(floorGeo, new THREE.MeshPhongMaterial({color: floorColor, fog: true, shading: THREE.FlatShading})) // , side: THREE.DoubleSide
    transformFloor(floor)
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
    document.body.appendChild(stats.domElement)
  }

  //// INIT END ////

  function getTopScores(el, num, callback) {
    console.log('Getting', num, 'top scores')
    if (!num) num = 3

    $.ajax({
      type: 'GET',
      dataType: 'text',
      url: 'https://flightapi-flightscore.rhcloud.com/top/' + num,
      success: function (data) {
        //console.log('Scores downloaded', data)
        el = JSON.parse(data)
        console.log(JSON.parse(data))
        if (callback) callback(el)
      },
      error: function (xhr, msg) {
        console.error('AJAX error', xhr.status, msg)
      }
    })
  }

  function postScore(name, score, callback) {
    console.log('Posting score', name, score)
 
    $.ajax({
        type: 'POST',
        url: 'https://flightapi-flightscore.rhcloud.com/post',
        data: {
            name: name,
            score: score,
        },
        success: function(data) {
            console.log('Score posted', data)
            if (callback) callback()
        },
        error: function(xhr, msg) {
            console.error('AJAX error', xhr.status, msg)
        }
    })
  }

  function createVertices (sideLength, geometry, segmentLength) {
    var limit = Math.floor(sideLength / segmentLength)
    for (var y = 0; y <= limit; y++)
      for (var x = 0; x <= limit; x++) {
        geometry.vertices.push(new THREE.Vector3(x * segmentLength, y * segmentLength, 0))
    }
    createFaces(geometry, limit)
  }

  function createFaces (geometry, limit) {
    for (y = 0; y < limit - 1; y++)
      for (var x = 0; x < limit; x++) {
        // Connects the floor faces. Basically the floor is made up of smalller squares which are alway comprised of two triangles
        // whose vertices are (0, 1, 2) and (0, 2, 3) [the four square vertices], I automate this by acting like each part-square
        // has an index (limit) which gets as an offset, and the x and y level of the current square
        geometry.faces.push(new THREE.Face3((limit + 1) * y + x, (limit + 1) * y + 1 + x, (limit + 1) * y + (limit + 2) + x))
        geometry.faces.push(new THREE.Face3((limit + 1) * y + x, (limit + 1) * (y + 1) + 1 + x, (limit + 1) * (y + 1) + x))
    }
  }

  function transformFloor (floorObject) {
    floorObject.geometry.vertices.forEach(function (vertex) {
      if (vertex.x == 0 || vertex.x == 6000)
        vertex.z += 4000
      else
        vertex.z = getRandom(-100, 100)
    })
  }

  function resetFloor (curViewPos) {
    var tempFloor = floor.clone()
    tempFloor.position.z = (curViewPos - 7000)
    tempFloor.rotation.z = 180 * Math.PI / 180
    scene.add(tempFloor)
  }
  // // FLOOR FUNCTIONS END ////

  function handlePickups () {
    if (multiplicator > 0) {
      if (pointTimer.getElapsedTime() >= 4) {
        multiplicator = 1
        pointTimer.stop()
        pointTimer.elapsedTime = 0
      }
    }
    if (controls.hasBoost) {
      if (boostTimer.getElapsedTime() >= 2.5) {
        controls.hasBoost = false
        boostTimer.stop()
        boostTimer.elapsedTime = 0
        controls.velocity.z = speedStamp * 1.1
        speedStamp = 0
      }
    }
    if (controls.isSlowed) {
      if (slowTimer.getElapsedTime() >= 2) {
        controls.isSlowed = false
        slowTimer.stop()
        slowTimer.elapsedTime = 0
        controls.velocity.z = slowStamp
      }
    }
  }

  // When you have a speedboost and then get a slowmo, the boost timer still
  // runs and sets the speed back to normal after running out
  function triggerPickUp (modifier) {
    scene.remove(modifier)
    sound.play()
    mesh_list.splice(mesh_list.indexOf(modifier), 1)
    if (modifier.material === pickupMaterial) {
      multiplicator *= 2
      if (pointTimer.elapsedTime == 0)
        pointTimer.start()
      else
        pointTimer.elapsedTime = 0
    } else if (modifier.material === pickupRedMaterial) {
      if (boostTimer.elapsedTime == 0) {
        controls.hasBoost = true
        speedStamp = controls.velocity.z
        controls.velocity.z *= 1.7
        boostTimer.start()
      } else
        boostTimer.elapsedTime = 0
    } else if (modifier.material === pickupBlueMaterial) {
      if (slowTimer.elapsedTime == 0) {
        controls.isSlowed = true

        if (speedStamp != 0)
          slowStamp = speedStamp
        else
          slowStamp = controls.velocity.z

        controls.velocity.z = -700
        slowTimer.start()
      } else
        slowTimer.elapsedTime = 0
    }
  }

  function animatePickups () {
    pickup_list.forEach(function (el) {
      el.rotation.y += 2 * Math.PI / 180
    })
  }
  // // PICKUP FUNCTIONS END ////

  function reloadWorld () {
    var currentViewingPosition = controls.getObject().position.z
    // Happens at -2000, -4000, -6000, etc.
    if (lastCheckPosition + (-1 * currentViewingPosition) > 0) {
      lastCheckPosition -= 2000
      resetFloor(lastCheckPosition)
      spawnObstacles(treeGeo, lastCheckPosition - 5000)
    }
  }

  function spawnObstacles (mesh, curViewPos) {
    mesh_list.forEach(function (el) {
      if (el.position.z > controls.getObject().position.z)
        mesh_list.splice(mesh_list.indexOf(el), 1)
    })
    // Overwrite array indices instead of splicing
    // Pickups and trees
    for (var y = 0; y < 3; y++)
      for (var x = 0; x < 3; x++) {
        var x_pos = getRandom(-1500 + 1000 * x, -1500 + 1000 * (x + 1)),
          z_pos = getRandom(curViewPos, curViewPos - 1000 * y),
          y_pos = getRandom(-900, 0)

        if (y == 1 && x == 1 && getRandom(0, 11) > 6) {
          var tempPickup = pickup.clone()
          var prob = getRandom(0, 3)
          if (prob == 0)
            tempPickup.material = pickupRedMaterial
          else if (prob == 1)
            tempPickup.material = pickupBlueMaterial
          tempPickup.position.set(x_pos + 300, 300, z_pos)
          tempPickup.rotation.y = 45 * Math.PI / 180
          tempPickup.rotation.x = 45 * Math.PI / 180
          scene.add(tempPickup)
          pickup_list.push(tempPickup)
          mesh_list.push(tempPickup)
        }

        var tempMesh = new THREE.Mesh(treeGeo, new THREE.MeshLambertMaterial({ color: meshcolor}))
        tempMesh.scale.set(60, 100, 60)
        tempMesh.position.set(x_pos, y_pos, z_pos)
        tempMesh.rotation.y = (Math.random() * 10)
        scene.add(tempMesh)
        mesh_list.push(tempMesh)
    }
  }

  function getRandom (min, max) {
    return Math.floor((Math.random() * (max - min) + min))
  }

  function checkCollisions () {
    var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone()
    var raycaster = new THREE.Raycaster(controls.getObject().position, cameraDirection.clone().normalize(), 0, 100)
    var collisionResults = raycaster.intersectObjects(mesh_list, true)

    if(collisionResults.length > 0 && collisionResults[0].distance < 50) {
      var hitObject = collisionResults[0].object
      if (hitObject.material === pickupMaterial || hitObject.material === pickupRedMaterial || hitObject.material === pickupBlueMaterial)
        triggerPickUp(hitObject)
      else
        endGame()
    }
  }

  function drawUI () {
    $('#score').html('Score: ' + multiplicator + 'x')
    $('#speed').html('Vel: ' + Math.floor(-controls.velocity.z))
    $('#distance').html(Math.round(score / 100))
  }

  function endGame() {
    stop = true
    $('#ajax').load('end.html')
    getTopScores(scores, 5, drawScoreBoard)
  }

  function drawScoreBoard(data) {
    console.log(data)
    
    function compare(a,b) {
      if (a.score > b.score)
        return -1;
      if (a.score < b.score)
        return 1;
      return 0;
    }
    
    data.sort(compare)
    console.log(data)
    $('#spin').remove()
    $('#result').text("Your score: " + Math.round(score / 100))
    for (var i = 0; i < 5; i++) {
      $('#scores').append('<li style="font-size:20px;text-align:"center";>Name: ' + data[i].name + ' ||| Score: ' + data[i].score + '</li>')
    }

    $('#sendScore').on('click', function() {
      var playerName = $('#postScore').val()
      if (playerName.trim() === '')
        console.log('not valid')
      else {
        postScore($('#postScore').val(), score)
        $('#sendScore').remove()
        $('#postScore').remove()
        $('#end').prepend('<p style="margin-top:80px;">Thanks!</p>')
        $('#thanks').remove()
      }
    })

    $('#restart').on('click', function() {
      location.reload()
    })
  }

  function render () {
    controls.update(clock.getElapsedTime())
    if (start)
      score += Math.floor(controls.velocity.z * -2 / 1000) * multiplicator
    checkCollisions()
    handlePickups()
    drawUI()
    animatePickups()
    reloadWorld()
    stats.update()
    if (controls.hasBoost)
      console.log('vrooom')
  }
  function animate () {
    if (stop) return
    requestAnimationFrame(animate)
    render()
    renderer.render(scene, camera)
  }
  init()
  animate()
}

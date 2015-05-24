
window.game = {
  clock: new THREE.Clock(),
  skycolor: 0x5AE8CD,
  meshcolor: 'hotpink',
  floorColor: 'hotpink',
  pickupMaterial: new THREE.MeshPhongMaterial({
    color: 0x33FF33,
    specular: 0x2AFF5A,
    emissive: 0x009900,
    shininess: 70,
    shading: THREE.FlatShading,
    blending: THREE.NormalBlending,
  }),
  pickupBlueMaterial: new THREE.MeshPhongMaterial({
    color: 0x3A52FF,
    specular: 0x2786FF,
    emissive: 0x082B99,
    shininess: 70,
    shading: THREE.FlatShading,
    blending: THREE.NormalBlending
  }),

  pickupRedMaterial: new THREE.MeshPhongMaterial({
    color: 0xFF3744,
    specular: 0xFF4B3C,
    emissive: 0x991701,
    shininess: 70,
    shading: THREE.FlatShading,
    blending: THREE.NormalBlending
  })
}

game.player = {
  score: 0,
  multiplicator: 1,
  pointTimer: new THREE.Clock(),
  boostTimer: new THREE.Clock(),
  slowTimer: new THREE.Clock(),
  lastCheckPosition: -2000
}

game.init = function(player) {
  this.clock.start()
  console.log('go')
  this.controls= new THREE.PointerLockControls(this.renderElements.camera)
    this.scene.add(this.controls.getObject())
}

game.getPointerLock = function () {
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
        element.requestPointerLock()
        $('#splash').remove()
        start = true
      }
      document.addEventListener('pointerlockchange', pointerlockchange, false)
      document.addEventListener('mozpointerlockchange', pointerlockchange, false)
      document.addEventListener('webkitpointerlockchange', pointerlockchange, false)
    })
  }
}

game.init(game.renderElements)


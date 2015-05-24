game.renderElements = {
    scene: new THREE.Scene(),
    renderer: new THREE.WebGLRenderer({antialias: true})
}

game.renderElements.init = function() {
	this.renderer.setSize(window.innerWidth / window.innerHeight)
  	this.renderer.setClearColor(this.skycolor)
  	document.body.appendChild(renderElements.renderer.domElement)
  	this.Camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 8000)
  	this.Camera.lookAt(0,0,0)
  	this.scene.add(this.Camera)
}
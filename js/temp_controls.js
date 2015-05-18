/**
 * @author mrdoob / http://mrdoob.com/
 * modified by philipp welsch / github.com/in0x
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;
	camera.rotation.set( 0, 0, 0 );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 250;
	yawObject.add( camera );

	var isSlowed = false;
	var hasBoost = false;
	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var isOnObject = false;
	var canJump = false;

	var prevTime = performance.now();

	var velocity = new THREE.Vector3();
	this.velocity = velocity;

	var PI_2 = Math.PI / 2;

	velocity.z = -1300;
	var speedCounter = 0;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		// pitchObject.rotation.x -= movementY * 0.002;

		// pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
		yawObject.rotation.x -= movementY * 0.002;

		yawObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, yawObject.rotation.x ) );

		if (yawObject.rotation.y * 100 > 110)
			yawObject.rotation.y = 1.1;
		else if ((yawObject.rotation.y * 100 < -110))
			yawObject.rotation.y = -1.1;
	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

		// 	case 38: // up
		// 	case 87: // w
		// 		moveForward = true;
		// 		break;

			// case 37: // left
			// case 65: // a
			// 	moveLeft = true; 
			// 	break;

		// 	case 40: // down
		// 	case 83: // s
		// 		moveBackward = true;
		// 		break;

			// case 39: // right
			// case 68: // d
			// 	moveRight = true;
			// 	break;

		// 	case 32: // space
		// 		if ( canJump === true ) velocity.y += 350;
		// 		canJump = false;
		// 		break;

		}

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

		// 	case 38: // up
		// 	case 87: // w
		// 		moveForward = false;
		// 		break;

			// case 37: // left
			// case 65: // a
			// 	moveLeft = false;
			// 	break;

		// 	case 40: // down
		// 	case 83: // s
		// 		moveBackward = false;
		// 		break;

			// case 39: // right
			// case 68: // d
			// 	moveRight = false;
			// 	break;

		}

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};

	this.isOnObject = function ( boolean ) {

		isOnObject = boolean;
		canJump = boolean;

	};

	this.getDirection = function() {

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {
			rotation.set( yawObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;
		}
	}();

	//modefied version, velocities originaly at 400
	this.update = function (time) {
		if ( scope.enabled === false ) return;

		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		//velocity.z -= velocity.z * 10.0 * delta;
		velocity.y -= velocity.y * 10.0 * delta;

		speedCounter++;
		if (speedCounter % 50 == 0)
			velocity.z -= 10;
		if (hasBoost)
			velocity.z *= 2;

		//if ( moveForward ) velocity.z -= 7000.0 * delta;
		//if ( moveBackward ) velocity.z += 7000.0 * delta;

		// if ( moveLeft ) {
		// 	velocity.x -= 5000;
		// 	moveLeft = false;
		// }
		// if ( moveRight ) {
		// 	velocity.x += 5000;
		// 	moveRight = false;
		// }

		if (yawObject.position.y < 10) 
			yawObject.position.y = 10;
		else if (yawObject.position.y > 1200)
		 	yawObject.position.y = 1200;

		if (yawObject.position.x < -1400)
			yawObject.position.x = -1400

		if (yawObject.position.x > 1400)
			yawObject.position.x = 1400

		yawObject.translateX( velocity.x * delta );
		yawObject.translateY( velocity.y * delta ); 
		yawObject.translateZ( velocity.z * delta );

		prevTime = time;

	};

};

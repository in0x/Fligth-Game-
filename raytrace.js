for (var vertexIndex = 0; vertexIndex < detectionBody.geometry.vertices.length; vertexIndex++)
          {       
              var localVertex = detectionBody.geometry.vertices[vertexIndex].clone();
              var globalVertex = detectionBody.matrix.multiplyVector3(localVertex);
              var directionVector = globalVertex.subSelf( camera.position );

              var ray = new THREE.Ray( camera.position, directionVector.clone().normalize() );
              var collisionResults = ray.intersectObjects( collidableMeshList );
              if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
              {
                  console.log('pew pew');
              }
        } 
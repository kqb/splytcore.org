// wired3d
(function ($) {
	$(function () {
		var container;
		var camera, cameraTarget, scene, renderer;


		init()
		startAnimating();

		var firstFrame = true;
		var fps, fpsInterval, startTime, now, then, elapsed;
		fps = 30;

		function init() {
			container = document.getElementById('wired3d');
			var widthSize = $(window).width();
			var heightSize = $(window).height();
			var fov = 8;
			var aspect = 1;
			if ((widthSize / heightSize) < 1) {
				fov = 10;
				aspect = (window.innerWidth * 1.1 / window.innerHeight);
			} else {
				aspect = (window.innerWidth * 0.92 / window.innerHeight);
			}

			//document.body.appendChild(container);
			camera = new THREE.PerspectiveCamera(fov, aspect, 2, 4000);
			camera.position.set(-300, 200, 300); //(0,0,700);
			camera.rotation.x = Math.PI / 2;
			var controls = new THREE.OrbitControls(camera, container); //, renderer.domElement);
			controls.target = new THREE.Vector3(0, -0.1, 0);
			//controls.enableDamping = true;
			//controls.dampingFactor = 0.1;
			controls.enableZoom = false;
			controls.userPan = true; //true:パン操作可能,false:パン操作不可
			controls.userPanSpeed = 0.02; //パン速度
			controls.rotateSpeed = 0.1;
			controls.minDistance = 40;
			controls.maxDistance = 700.0;
			//controls.autoRotate = true;     //true:自動回転する,false:自動回転しない
			//controls.autoRotateSpeed = 0.1;    //自動回転する時の速度
			//controls.minPolarAngle = - Math.PI / 2; 
			//controls.maxPolarAngle = Math.PI; 
			controls.staticMoving = false;
			controls.dynamicDampingFactor = 0.3;

			//cameraTarget = new THREE.Vector3( 0, -0.25, 0 );
			scene = new THREE.Scene();

			// ASCII file
			var loader = new THREE.OBJLoader();
			loader.load('./img/parachain5.obj', function (geometry) {
				//var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
				var path = "./img/textures/";
				var format = '.jpg';
				var urls = [
					path + 'px' + format, path + 'nx' + format,
					path + 'py' + format, path + 'ny' + format,
					path + 'pz' + format, path + 'nz' + format
				];
				var reflectionCube = new THREE.CubeTextureLoader().load(urls);
				reflectionCube.format = THREE.RGBFormat;

				var material = new THREE.MeshLambertMaterial({
					color: 0xE7007A,
					wireframe: true,
					envMap: reflectionCube,
					combine: THREE.MixOperation,
					reflectivity: 0.9
				});
				var mesh = geometry.children[0];
				// mesh.geometry.computeTangents();
				mesh.material = material;
				mesh.position.set(0, 0, 20);
				mesh.rotation.set(-Math.PI / 2, -Math.PI / 2, -Math.PI / 2);
				mesh.scale.set(0.8, 0.8, 0.8);
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				scene.add(mesh);

			});


			// Binary files
			//var material = new THREE.MeshPhongMaterial( { color: 0xAAAAAA, specular: 0x111111, shininess: 200 } );

			// Lights
			// scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
			// addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
			// addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );
			// renderer
			renderer = new THREE.WebGLRenderer({
				antialias: true
			});
			renderer.setPixelRatio(window.devicePixelRatio);
			//renderer.setClearColor( scene.fog.color );
			//renderer.setPixelRatio( window.devicePixelRatio );
			//renderer.setSize( window.innerWidth -500, window.innerHeight -20 );
			renderer.setSize(container.clientWidth, container.clientHeight);

			//renderer.gammaInput = true;
			//renderer.gammaOutput = true;
			//renderer.shadowMap.enabled = true;
			//renderer.shadowMap.cullFace = THREE.CullFaceBack;

			var effect = new THREE.ParallaxBarrierEffect(renderer);
			effect.setSize(window.innerWidth || 2, window.innerHeight || 2);
			// effect.setSize( container.clientWidth, container.clientHeight );

			container.appendChild(renderer.domElement);

			window.addEventListener('resize', onWindowResize, false);

			$('canvas').css('width', container.clientWidth); //widthSize * 8.5/10
			$('canvas').css('height', container.clientHeight);
			// $('canvas').css('max-height', '1200px');
			//$('#wired3d').css('float', 'right');
			//$('#wired3d').css('width', '85%');
			//$('#wired3d').css('min-height', '480px');

		}

		function addShadowedLight(x, y, z, color, intensity) {
			var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
			directionalLight.position.z = 3; //( x, y, z );
			scene.add(directionalLight);
			//directionalLight.castShadow = true;
		}

		function onWindowResize() {
			camera.aspect = (window.innerWidth / window.innerHeight);
			camera.updateProjectionMatrix();
			renderer.setSize($(window).width(), container.clientHeight);
			// effect.setSize( window.innerWidth, window.innerHeight );
			// $('canvas').css('width', container.clientWidth); //widthSize * 8.5/10
			// $('canvas').css('height', container.clientHeight);
			// canvas.width  = container.clientWidth;
			// canvas.height = container.clientHeight;
		}

		function startAnimating() {
			fpsInterval = 1000 / fps;
			then = Date.now();
			startTime = then;
			console.log(startTime);
			animate();
		}

		function animate() {

			requestAnimationFrame(animate);
			// request another frame 

			// requestAnimationFrame(animate);

			// calc elapsed time since the last loop 

			now = Date.now();
			elapsed = now - then;

			// if enough time has elapsed, draw the next frame 

			if (elapsed > fpsInterval) {
				then = now - (elapsed % fpsInterval);

				// draw animating objects here... 
				render();
			}
			//stats.update();
			// console.log($(".hero__overlay"));
		}

		function render() {
			var timer = Date.now() * 0.0005;
			//camera.position.x = Math.cos( timer );
			//camera.position.z = Math.sin( timer );
			for (var i = 0, l = scene.children.length; i < l; i++) {
				var object = scene.children[i];
				object.rotation.x = timer * 0.1;
				object.rotation.y = timer * 0.3;
			}

			//camera.lookAt( cameraTarget );
			//controls.update();
			//effect.render( scene, camera );
			renderer.render(scene, camera);

			// Set overlay to done loading
			// if (firstFrame) {
			// 	$(".hero__overlay").addClass("done");
			// 	firstFrame = !firstFrame;
			// }

		}
	});
})(jQuery);
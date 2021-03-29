const THREE = require('three');
// import(/* webpackPreload: true */ "../img/textures/px.jpg")
// import(/* webpackPreload: true */ "../img/textures/py.jpg")
// import(/* webpackPreload: true */ "../img/textures/pz.jpg")
// import(/* webpackPreload: true */ "../img/textures/nx.jpg")
// import(/* webpackPreload: true */ "../img/textures/ny.jpg")
// import(/* webpackPreload: true */ "../img/textures/nz.jpg")
// import(/* webpackPreload: true */ "../img/parachain5.obj")
// parallex barrier
/**
 * @author mrdoob / http://mrdoob.com/
 * @author marklundin / http://mark-lundin.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ParallaxBarrierEffect = function ( renderer ) {

	var _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

	var _scene = new THREE.Scene();

	var _stereo = new THREE.StereoCamera();

	var _params = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };

	var _renderTargetL = new THREE.WebGLRenderTarget( 512, 512, _params );
	var _renderTargetR = new THREE.WebGLRenderTarget( 512, 512, _params );

	var _material = new THREE.ShaderMaterial( {

		uniforms: {

			"mapLeft": { type: "t", value: _renderTargetL.texture },
			"mapRight": { type: "t", value: _renderTargetR.texture }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = vec2( uv.x, uv.y );",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D mapLeft;",
			"uniform sampler2D mapRight;",
			"varying vec2 vUv;",

			"void main() {",

			"	vec2 uv = vUv;",

			"	if ( ( mod( gl_FragCoord.y, 2.0 ) ) > 1.00 ) {",

			"		gl_FragColor = texture2D( mapLeft, uv );",

			"	} else {",

			"		gl_FragColor = texture2D( mapRight, uv );",

			"	}",

			"}"

		].join( "\n" )

	} );

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), _material );
	_scene.add( mesh );

	this.setSize = function ( width, height ) {

		renderer.setSize( width, height );

		var pixelRatio = renderer.getPixelRatio();

		_renderTargetL.setSize( width * pixelRatio, height * pixelRatio );
		_renderTargetR.setSize( width * pixelRatio, height * pixelRatio );

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		_stereo.update( camera );

		renderer.render( scene, _stereo.cameraL, _renderTargetL, true );
		renderer.render( scene, _stereo.cameraR, _renderTargetR, true );
		renderer.render( _scene, _camera );

	};

};
    // obj loader
    THREE.OBJLoader = ( function () {

        // o object_name | g group_name
        var object_pattern = /^[og]\s*(.+)?/;
        // mtllib file_reference
        var material_library_pattern = /^mtllib /;
        // usemtl material_name
        var material_use_pattern = /^usemtl /;
        // usemap map_name
        var map_use_pattern = /^usemap /;
    
        var vA = new THREE.Vector3();
        var vB = new THREE.Vector3();
        var vC = new THREE.Vector3();
    
        var ab = new THREE.Vector3();
        var cb = new THREE.Vector3();
    
        function ParserState() {
    
            var state = {
                objects: [],
                object: {},
    
                vertices: [],
                normals: [],
                colors: [],
                uvs: [],
    
                materials: {},
                materialLibraries: [],
    
                startObject: function ( name, fromDeclaration ) {
    
                    // If the current object (initial from reset) is not from a g/o declaration in the parsed
                    // file. We need to use it for the first parsed g/o to keep things in sync.
                    if ( this.object && this.object.fromDeclaration === false ) {
    
                        this.object.name = name;
                        this.object.fromDeclaration = ( fromDeclaration !== false );
                        return;
    
                    }
    
                    var previousMaterial = ( this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined );
    
                    if ( this.object && typeof this.object._finalize === 'function' ) {
    
                        this.object._finalize( true );
    
                    }
    
                    this.object = {
                        name: name || '',
                        fromDeclaration: ( fromDeclaration !== false ),
    
                        geometry: {
                            vertices: [],
                            normals: [],
                            colors: [],
                            uvs: [],
                            hasUVIndices: false
                        },
                        materials: [],
                        smooth: true,
    
                        startMaterial: function ( name, libraries ) {
    
                            var previous = this._finalize( false );
    
                            // New usemtl declaration overwrites an inherited material, except if faces were declared
                            // after the material, then it must be preserved for proper MultiMaterial continuation.
                            if ( previous && ( previous.inherited || previous.groupCount <= 0 ) ) {
    
                                this.materials.splice( previous.index, 1 );
    
                            }
    
                            var material = {
                                index: this.materials.length,
                                name: name || '',
                                mtllib: ( Array.isArray( libraries ) && libraries.length > 0 ? libraries[ libraries.length - 1 ] : '' ),
                                smooth: ( previous !== undefined ? previous.smooth : this.smooth ),
                                groupStart: ( previous !== undefined ? previous.groupEnd : 0 ),
                                groupEnd: - 1,
                                groupCount: - 1,
                                inherited: false,
    
                                clone: function ( index ) {
    
                                    var cloned = {
                                        index: ( typeof index === 'number' ? index : this.index ),
                                        name: this.name,
                                        mtllib: this.mtllib,
                                        smooth: this.smooth,
                                        groupStart: 0,
                                        groupEnd: - 1,
                                        groupCount: - 1,
                                        inherited: false
                                    };
                                    cloned.clone = this.clone.bind( cloned );
                                    return cloned;
    
                                }
                            };
    
                            this.materials.push( material );
    
                            return material;
    
                        },
    
                        currentMaterial: function () {
    
                            if ( this.materials.length > 0 ) {
    
                                return this.materials[ this.materials.length - 1 ];
    
                            }
    
                            return undefined;
    
                        },
    
                        _finalize: function ( end ) {
    
                            var lastMultiMaterial = this.currentMaterial();
                            if ( lastMultiMaterial && lastMultiMaterial.groupEnd === - 1 ) {
    
                                lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
                                lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
                                lastMultiMaterial.inherited = false;
    
                            }
    
                            // Ignore objects tail materials if no face declarations followed them before a new o/g started.
                            if ( end && this.materials.length > 1 ) {
    
                                for ( var mi = this.materials.length - 1; mi >= 0; mi -- ) {
    
                                    if ( this.materials[ mi ].groupCount <= 0 ) {
    
                                        this.materials.splice( mi, 1 );
    
                                    }
    
                                }
    
                            }
    
                            // Guarantee at least one empty material, this makes the creation later more straight forward.
                            if ( end && this.materials.length === 0 ) {
    
                                this.materials.push( {
                                    name: '',
                                    smooth: this.smooth
                                } );
    
                            }
    
                            return lastMultiMaterial;
    
                        }
                    };
    
                    // Inherit previous objects material.
                    // Spec tells us that a declared material must be set to all objects until a new material is declared.
                    // If a usemtl declaration is encountered while this new object is being parsed, it will
                    // overwrite the inherited material. Exception being that there was already face declarations
                    // to the inherited material, then it will be preserved for proper MultiMaterial continuation.
    
                    if ( previousMaterial && previousMaterial.name && typeof previousMaterial.clone === 'function' ) {
    
                        var declared = previousMaterial.clone( 0 );
                        declared.inherited = true;
                        this.object.materials.push( declared );
    
                    }
    
                    this.objects.push( this.object );
    
                },
    
                finalize: function () {
    
                    if ( this.object && typeof this.object._finalize === 'function' ) {
    
                        this.object._finalize( true );
    
                    }
    
                },
    
                parseVertexIndex: function ( value, len ) {
    
                    var index = parseInt( value, 10 );
                    return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;
    
                },
    
                parseNormalIndex: function ( value, len ) {
    
                    var index = parseInt( value, 10 );
                    return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;
    
                },
    
                parseUVIndex: function ( value, len ) {
    
                    var index = parseInt( value, 10 );
                    return ( index >= 0 ? index - 1 : index + len / 2 ) * 2;
    
                },
    
                addVertex: function ( a, b, c ) {
    
                    var src = this.vertices;
                    var dst = this.object.geometry.vertices;
    
                    dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
                    dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
                    dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );
    
                },
    
                addVertexPoint: function ( a ) {
    
                    var src = this.vertices;
                    var dst = this.object.geometry.vertices;
    
                    dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
    
                },
    
                addVertexLine: function ( a ) {
    
                    var src = this.vertices;
                    var dst = this.object.geometry.vertices;
    
                    dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
    
                },
    
                addNormal: function ( a, b, c ) {
    
                    var src = this.normals;
                    var dst = this.object.geometry.normals;
    
                    dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
                    dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
                    dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );
    
                },
    
                addFaceNormal: function ( a, b, c ) {
    
                    var src = this.vertices;
                    var dst = this.object.geometry.normals;
    
                    vA.fromArray( src, a );
                    vB.fromArray( src, b );
                    vC.fromArray( src, c );
    
                    cb.subVectors( vC, vB );
                    ab.subVectors( vA, vB );
                    cb.cross( ab );
    
                    cb.normalize();
    
                    dst.push( cb.x, cb.y, cb.z );
                    dst.push( cb.x, cb.y, cb.z );
                    dst.push( cb.x, cb.y, cb.z );
    
                },
    
                addColor: function ( a, b, c ) {
    
                    var src = this.colors;
                    var dst = this.object.geometry.colors;
    
                    if ( src[ a ] !== undefined ) dst.push( src[ a + 0 ], src[ a + 1 ], src[ a + 2 ] );
                    if ( src[ b ] !== undefined ) dst.push( src[ b + 0 ], src[ b + 1 ], src[ b + 2 ] );
                    if ( src[ c ] !== undefined ) dst.push( src[ c + 0 ], src[ c + 1 ], src[ c + 2 ] );
    
                },
    
                addUV: function ( a, b, c ) {
    
                    var src = this.uvs;
                    var dst = this.object.geometry.uvs;
    
                    dst.push( src[ a + 0 ], src[ a + 1 ] );
                    dst.push( src[ b + 0 ], src[ b + 1 ] );
                    dst.push( src[ c + 0 ], src[ c + 1 ] );
    
                },
    
                addDefaultUV: function () {
    
                    var dst = this.object.geometry.uvs;
    
                    dst.push( 0, 0 );
                    dst.push( 0, 0 );
                    dst.push( 0, 0 );
    
                },
    
                addUVLine: function ( a ) {
    
                    var src = this.uvs;
                    var dst = this.object.geometry.uvs;
    
                    dst.push( src[ a + 0 ], src[ a + 1 ] );
    
                },
    
                addFace: function ( a, b, c, ua, ub, uc, na, nb, nc ) {
    
                    var vLen = this.vertices.length;
    
                    var ia = this.parseVertexIndex( a, vLen );
                    var ib = this.parseVertexIndex( b, vLen );
                    var ic = this.parseVertexIndex( c, vLen );
    
                    this.addVertex( ia, ib, ic );
                    this.addColor( ia, ib, ic );
    
                    // normals
    
                    if ( na !== undefined && na !== '' ) {
    
                        var nLen = this.normals.length;
    
                        ia = this.parseNormalIndex( na, nLen );
                        ib = this.parseNormalIndex( nb, nLen );
                        ic = this.parseNormalIndex( nc, nLen );
    
                        this.addNormal( ia, ib, ic );
    
                    } else {
    
                        this.addFaceNormal( ia, ib, ic );
    
                    }
    
                    // uvs
    
                    if ( ua !== undefined && ua !== '' ) {
    
                        var uvLen = this.uvs.length;
    
                        ia = this.parseUVIndex( ua, uvLen );
                        ib = this.parseUVIndex( ub, uvLen );
                        ic = this.parseUVIndex( uc, uvLen );
    
                        this.addUV( ia, ib, ic );
    
                        this.object.geometry.hasUVIndices = true;
    
                    } else {
    
                        // add placeholder values (for inconsistent face definitions)
    
                        this.addDefaultUV();
    
                    }
    
                },
    
                addPointGeometry: function ( vertices ) {
    
                    this.object.geometry.type = 'Points';
    
                    var vLen = this.vertices.length;
    
                    for ( var vi = 0, l = vertices.length; vi < l; vi ++ ) {
    
                        var index = this.parseVertexIndex( vertices[ vi ], vLen );
    
                        this.addVertexPoint( index );
                        this.addColor( index );
    
                    }
    
                },
    
                addLineGeometry: function ( vertices, uvs ) {
    
                    this.object.geometry.type = 'Line';
    
                    var vLen = this.vertices.length;
                    var uvLen = this.uvs.length;
    
                    for ( var vi = 0, l = vertices.length; vi < l; vi ++ ) {
    
                        this.addVertexLine( this.parseVertexIndex( vertices[ vi ], vLen ) );
    
                    }
    
                    for ( var uvi = 0, l = uvs.length; uvi < l; uvi ++ ) {
    
                        this.addUVLine( this.parseUVIndex( uvs[ uvi ], uvLen ) );
    
                    }
    
                }
    
            };
    
            state.startObject( '', false );
    
            return state;
    
        }
    
        //
    
        function OBJLoader( manager ) {
    
            THREE.Loader.call( this, manager );
    
            this.materials = null;
    
        }
    
        OBJLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {
    
            constructor: OBJLoader,
    
            load: function ( url, onLoad, onProgress, onError ) {
    
                var scope = this;
    
                var loader = new THREE.FileLoader( this.manager );
                loader.setPath( this.path );
                loader.setRequestHeader( this.requestHeader );
                loader.setWithCredentials( this.withCredentials );
                loader.load( url, function ( text ) {
    
                    try {
    
                        onLoad( scope.parse( text ) );
    
                    } catch ( e ) {
    
                        if ( onError ) {
    
                            onError( e );
    
                        } else {
    
                            console.error( e );
    
                        }
    
                        scope.manager.itemError( url );
    
                    }
    
                }, onProgress, onError );
    
            },
    
            setMaterials: function ( materials ) {
    
                this.materials = materials;
    
                return this;
    
            },
    
            parse: function ( text ) {
    
                var state = new ParserState();
    
                if ( text.indexOf( '\r\n' ) !== - 1 ) {
    
                    // This is faster than String.split with regex that splits on both
                    text = text.replace( /\r\n/g, '\n' );
    
                }
    
                if ( text.indexOf( '\\\n' ) !== - 1 ) {
    
                    // join lines separated by a line continuation character (\)
                    text = text.replace( /\\\n/g, '' );
    
                }
    
                var lines = text.split( '\n' );
                var line = '', lineFirstChar = '';
                var lineLength = 0;
                var result = [];
    
                // Faster to just trim left side of the line. Use if available.
                var trimLeft = ( typeof ''.trimLeft === 'function' );
    
                for ( var i = 0, l = lines.length; i < l; i ++ ) {
    
                    line = lines[ i ];
    
                    line = trimLeft ? line.trimLeft() : line.trim();
    
                    lineLength = line.length;
    
                    if ( lineLength === 0 ) continue;
    
                    lineFirstChar = line.charAt( 0 );
    
                    // @todo invoke passed in handler if any
                    if ( lineFirstChar === '#' ) continue;
    
                    if ( lineFirstChar === 'v' ) {
    
                        var data = line.split( /\s+/ );
    
                        switch ( data[ 0 ] ) {
    
                            case 'v':
                                state.vertices.push(
                                    parseFloat( data[ 1 ] ),
                                    parseFloat( data[ 2 ] ),
                                    parseFloat( data[ 3 ] )
                                );
                                if ( data.length >= 7 ) {
    
                                    state.colors.push(
                                        parseFloat( data[ 4 ] ),
                                        parseFloat( data[ 5 ] ),
                                        parseFloat( data[ 6 ] )
    
                                    );
    
                                } else {
    
                                    // if no colors are defined, add placeholders so color and vertex indices match
    
                                    state.colors.push( undefined, undefined, undefined );
    
                                }
    
                                break;
                            case 'vn':
                                state.normals.push(
                                    parseFloat( data[ 1 ] ),
                                    parseFloat( data[ 2 ] ),
                                    parseFloat( data[ 3 ] )
                                );
                                break;
                            case 'vt':
                                state.uvs.push(
                                    parseFloat( data[ 1 ] ),
                                    parseFloat( data[ 2 ] )
                                );
                                break;
    
                        }
    
                    } else if ( lineFirstChar === 'f' ) {
    
                        var lineData = line.substr( 1 ).trim();
                        var vertexData = lineData.split( /\s+/ );
                        var faceVertices = [];
    
                        // Parse the face vertex data into an easy to work with format
    
                        for ( var j = 0, jl = vertexData.length; j < jl; j ++ ) {
    
                            var vertex = vertexData[ j ];
    
                            if ( vertex.length > 0 ) {
    
                                var vertexParts = vertex.split( '/' );
                                faceVertices.push( vertexParts );
    
                            }
    
                        }
    
                        // Draw an edge between the first vertex and all subsequent vertices to form an n-gon
    
                        var v1 = faceVertices[ 0 ];
    
                        for ( var j = 1, jl = faceVertices.length - 1; j < jl; j ++ ) {
    
                            var v2 = faceVertices[ j ];
                            var v3 = faceVertices[ j + 1 ];
    
                            state.addFace(
                                v1[ 0 ], v2[ 0 ], v3[ 0 ],
                                v1[ 1 ], v2[ 1 ], v3[ 1 ],
                                v1[ 2 ], v2[ 2 ], v3[ 2 ]
                            );
    
                        }
    
                    } else if ( lineFirstChar === 'l' ) {
    
                        var lineParts = line.substring( 1 ).trim().split( ' ' );
                        var lineVertices = [], lineUVs = [];
    
                        if ( line.indexOf( '/' ) === - 1 ) {
    
                            lineVertices = lineParts;
    
                        } else {
    
                            for ( var li = 0, llen = lineParts.length; li < llen; li ++ ) {
    
                                var parts = lineParts[ li ].split( '/' );
    
                                if ( parts[ 0 ] !== '' ) lineVertices.push( parts[ 0 ] );
                                if ( parts[ 1 ] !== '' ) lineUVs.push( parts[ 1 ] );
    
                            }
    
                        }
    
                        state.addLineGeometry( lineVertices, lineUVs );
    
                    } else if ( lineFirstChar === 'p' ) {
    
                        var lineData = line.substr( 1 ).trim();
                        var pointData = lineData.split( ' ' );
    
                        state.addPointGeometry( pointData );
    
                    } else if ( ( result = object_pattern.exec( line ) ) !== null ) {
    
                        // o object_name
                        // or
                        // g group_name
    
                        // WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
                        // var name = result[ 0 ].substr( 1 ).trim();
                        var name = ( ' ' + result[ 0 ].substr( 1 ).trim() ).substr( 1 );
    
                        state.startObject( name );
    
                    } else if ( material_use_pattern.test( line ) ) {
    
                        // material
    
                        state.object.startMaterial( line.substring( 7 ).trim(), state.materialLibraries );
    
                    } else if ( material_library_pattern.test( line ) ) {
    
                        // mtl file
    
                        state.materialLibraries.push( line.substring( 7 ).trim() );
    
                    } else if ( map_use_pattern.test( line ) ) {
    
                        // the line is parsed but ignored since the loader assumes textures are defined MTL files
                        // (according to https://www.okino.com/conv/imp_wave.htm, 'usemap' is the old-style Wavefront texture reference method)
    
                        console.warn( 'THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.' );
    
                    } else if ( lineFirstChar === 's' ) {
    
                        result = line.split( ' ' );
    
                        // smooth shading
    
                        // @todo Handle files that have varying smooth values for a set of faces inside one geometry,
                        // but does not define a usemtl for each face set.
                        // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
                        // This requires some care to not create extra material on each smooth value for "normal" obj files.
                        // where explicit usemtl defines geometry groups.
                        // Example asset: examples/models/obj/cerberus/Cerberus.obj
    
                        /*
                         * http://paulbourke.net/dataformats/obj/
                         * or
                         * http://www.cs.utah.edu/~boulos/cs3505/obj_spec.pdf
                         *
                         * From chapter "Grouping" Syntax explanation "s group_number":
                         * "group_number is the smoothing group number. To turn off smoothing groups, use a value of 0 or off.
                         * Polygonal elements use group numbers to put elements in different smoothing groups. For free-form
                         * surfaces, smoothing groups are either turned on or off; there is no difference between values greater
                         * than 0."
                         */
                        if ( result.length > 1 ) {
    
                            var value = result[ 1 ].trim().toLowerCase();
                            state.object.smooth = ( value !== '0' && value !== 'off' );
    
                        } else {
    
                            // ZBrush can produce "s" lines #11707
                            state.object.smooth = true;
    
                        }
    
                        var material = state.object.currentMaterial();
                        if ( material ) material.smooth = state.object.smooth;
    
                    } else {
    
                        // Handle null terminated files without exception
                        if ( line === '\0' ) continue;
    
                        console.warn( 'THREE.OBJLoader: Unexpected line: "' + line + '"' );
    
                    }
    
                }
    
                state.finalize();
    
                var container = new THREE.Group();
                container.materialLibraries = [].concat( state.materialLibraries );
    
                var hasPrimitives = ! ( state.objects.length === 1 && state.objects[ 0 ].geometry.vertices.length === 0 );
    
                if ( hasPrimitives === true ) {
    
                    for ( var i = 0, l = state.objects.length; i < l; i ++ ) {
    
                        var object = state.objects[ i ];
                        var geometry = object.geometry;
                        var materials = object.materials;
                        var isLine = ( geometry.type === 'Line' );
                        var isPoints = ( geometry.type === 'Points' );
                        var hasVertexColors = false;
    
                        // Skip o/g line declarations that did not follow with any faces
                        if ( geometry.vertices.length === 0 ) continue;
    
                        var buffergeometry = new THREE.BufferGeometry();
    
                        buffergeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( geometry.vertices, 3 ) );
    
                        if ( geometry.normals.length > 0 ) {
    
                            buffergeometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( geometry.normals, 3 ) );
    
                        }
    
                        if ( geometry.colors.length > 0 ) {
    
                            hasVertexColors = true;
                            buffergeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( geometry.colors, 3 ) );
    
                        }
    
                        if ( geometry.hasUVIndices === true ) {
    
                            buffergeometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( geometry.uvs, 2 ) );
    
                        }
    
                        // Create materials
    
                        var createdMaterials = [];
    
                        for ( var mi = 0, miLen = materials.length; mi < miLen; mi ++ ) {
    
                            var sourceMaterial = materials[ mi ];
                            var materialHash = sourceMaterial.name + '_' + sourceMaterial.smooth + '_' + hasVertexColors;
                            var material = state.materials[ materialHash ];
    
                            if ( this.materials !== null ) {
    
                                material = this.materials.create( sourceMaterial.name );
    
                                // mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
                                if ( isLine && material && ! ( material instanceof THREE.LineBasicMaterial ) ) {
    
                                    var materialLine = new THREE.LineBasicMaterial();
                                    THREE.Material.prototype.copy.call( materialLine, material );
                                    materialLine.color.copy( material.color );
                                    material = materialLine;
    
                                } else if ( isPoints && material && ! ( material instanceof THREE.PointsMaterial ) ) {
    
                                    var materialPoints = new THREE.PointsMaterial( { size: 10, sizeAttenuation: false } );
                                    THREE.Material.prototype.copy.call( materialPoints, material );
                                    materialPoints.color.copy( material.color );
                                    materialPoints.map = material.map;
                                    material = materialPoints;
    
                                }
    
                            }
    
                            if ( material === undefined ) {
    
                                if ( isLine ) {
    
                                    material = new THREE.LineBasicMaterial();
    
                                } else if ( isPoints ) {
    
                                    material = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false } );
    
                                } else {
    
                                    material = new THREE.MeshPhongMaterial();
    
                                }
    
                                material.name = sourceMaterial.name;
                                material.flatShading = sourceMaterial.smooth ? false : true;
                                material.vertexColors = hasVertexColors;
    
                                state.materials[ materialHash ] = material;
    
                            }
    
                            createdMaterials.push( material );
    
                        }
    
                        // Create mesh
    
                        var mesh;
    
                        if ( createdMaterials.length > 1 ) {
    
                            for ( var mi = 0, miLen = materials.length; mi < miLen; mi ++ ) {
    
                                var sourceMaterial = materials[ mi ];
                                buffergeometry.addGroup( sourceMaterial.groupStart, sourceMaterial.groupCount, mi );
    
                            }
    
                            if ( isLine ) {
    
                                mesh = new THREE.LineSegments( buffergeometry, createdMaterials );
    
                            } else if ( isPoints ) {
    
                                mesh = new THREE.Points( buffergeometry, createdMaterials );
    
                            } else {
    
                                mesh = new THREE.Mesh( buffergeometry, createdMaterials );
    
                            }
    
                        } else {
    
                            if ( isLine ) {
    
                                mesh = new THREE.LineSegments( buffergeometry, createdMaterials[ 0 ] );
    
                            } else if ( isPoints ) {
    
                                mesh = new THREE.Points( buffergeometry, createdMaterials[ 0 ] );
    
                            } else {
    
                                mesh = new THREE.Mesh( buffergeometry, createdMaterials[ 0 ] );
    
                            }
    
                        }
    
                        mesh.name = object.name;
    
                        container.add( mesh );
    
                    }
    
                } else {
    
                    // if there is only the default parser state object with no geometry data, interpret data as point cloud
    
                    if ( state.vertices.length > 0 ) {
    
                        var material = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false } );
    
                        var buffergeometry = new THREE.BufferGeometry();
    
                        buffergeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( state.vertices, 3 ) );
    
                        if ( state.colors.length > 0 && state.colors[ 0 ] !== undefined ) {
    
                            buffergeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( state.colors, 3 ) );
                            material.vertexColors = true;
    
                        }
    
                        var points = new THREE.Points( buffergeometry, material );
                        container.add( points );
    
                    }
    
                }
    
                return container;
    
            }
    
        } );
    
        return OBJLoader;
    
    } )();
    

// STL loader

/**
 * @author aleeper / http://adamleeper.com/
 * @author mrdoob / http://mrdoob.com/
 * @author gero3 / https://github.com/gero3
 *
 * Description: A THREE loader for STL ASCII files, as created by Solidworks and other CAD programs.
 *
 * Supports both binary and ASCII encoded files, with automatic detection of type.
 *
 * Limitations:
 *  Binary decoding supports "Magics" color format (http://en.wikipedia.org/wiki/STL_(file_format)#Color_in_binary_STL).
 *  There is perhaps some question as to how valid it is to always assume little-endian-ness.
 *  ASCII decoding assumes file is UTF-8. Seems to work for the examples...
 *
 * Usage:
 *  var loader = new THREE.STLLoader();
 *  loader.load( './models/stl/slotted_disk.stl', function ( geometry ) {
 *    scene.add( new THREE.Mesh( geometry ) );
 *  });
 *
 * For binary STLs geometry might contain colors for vertices. To use it:
 *  // use the same code to load STL as above
 *  if (geometry.hasColors) {
 *    material = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: THREE.VertexColors });
 *  } else { .... }
 *  var mesh = new THREE.Mesh( geometry, material );
 */


THREE.STLLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.STLLoader.prototype = {

	constructor: THREE.STLLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	parse: function ( data ) {

		var isBinary = function () {

			var expect, face_size, n_faces, reader;
			reader = new DataView( binData );
			face_size = ( 32 / 8 * 3 ) + ( ( 32 / 8 * 3 ) * 3 ) + ( 16 / 8 );
			n_faces = reader.getUint32( 80, true );
			expect = 80 + ( 32 / 8 ) + ( n_faces * face_size );

			if ( expect === reader.byteLength ) {

				return true;

			}

			// some binary files will have different size from expected,
			// checking characters higher than ASCII to confirm is binary
			var fileLength = reader.byteLength;
			for ( var index = 0; index < fileLength; index ++ ) {

				if ( reader.getUint8( index, false ) > 127 ) {

					return true;

				}

			}

			return false;

		};

		var binData = this.ensureBinary( data );

		return isBinary()
			? this.parseBinary( binData )
			: this.parseASCII( this.ensureString( data ) );

	},

	parseBinary: function ( data ) {

		var reader = new DataView( data );
		var faces = reader.getUint32( 80, true );

		var r, g, b, hasColors = false, colors;
		var defaultR, defaultG, defaultB, alpha;

		// process STL header
		// check for default color in header ("COLOR=rgba" sequence).

		for ( var index = 0; index < 80 - 10; index ++ ) {

			if ( ( reader.getUint32( index, false ) == 0x434F4C4F /*COLO*/ ) &&
				( reader.getUint8( index + 4 ) == 0x52 /*'R'*/ ) &&
				( reader.getUint8( index + 5 ) == 0x3D /*'='*/ ) ) {

				hasColors = true;
				colors = new Float32Array( faces * 3 * 3 );

				defaultR = reader.getUint8( index + 6 ) / 255;
				defaultG = reader.getUint8( index + 7 ) / 255;
				defaultB = reader.getUint8( index + 8 ) / 255;
				alpha = reader.getUint8( index + 9 ) / 255;

			}

		}

		var dataOffset = 84;
		var faceLength = 12 * 4 + 2;

		var offset = 0;

		var geometry = new THREE.BufferGeometry();

		var vertices = new Float32Array( faces * 3 * 3 );
		var normals = new Float32Array( faces * 3 * 3 );

		for ( var face = 0; face < faces; face ++ ) {

			var start = dataOffset + face * faceLength;
			var normalX = reader.getFloat32( start, true );
			var normalY = reader.getFloat32( start + 4, true );
			var normalZ = reader.getFloat32( start + 8, true );

			if ( hasColors ) {

				var packedColor = reader.getUint16( start + 48, true );

				if ( ( packedColor & 0x8000 ) === 0 ) {

					// facet has its own unique color

					r = ( packedColor & 0x1F ) / 31;
					g = ( ( packedColor >> 5 ) & 0x1F ) / 31;
					b = ( ( packedColor >> 10 ) & 0x1F ) / 31;

				} else {

					r = defaultR;
					g = defaultG;
					b = defaultB;

				}

			}

			for ( var i = 1; i <= 3; i ++ ) {

				var vertexstart = start + i * 12;

				vertices[ offset ] = reader.getFloat32( vertexstart, true );
				vertices[ offset + 1 ] = reader.getFloat32( vertexstart + 4, true );
				vertices[ offset + 2 ] = reader.getFloat32( vertexstart + 8, true );

				normals[ offset ] = normalX;
				normals[ offset + 1 ] = normalY;
				normals[ offset + 2 ] = normalZ;

				if ( hasColors ) {

					colors[ offset ] = r;
					colors[ offset + 1 ] = g;
					colors[ offset + 2 ] = b;

				}

				offset += 3;

			}

		}

		geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

		if ( hasColors ) {

			geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
			geometry.hasColors = true;
			geometry.alpha = alpha;

		}

		return geometry;

	},

	parseASCII: function ( data ) {

		var geometry, length, normal, patternFace, patternNormal, patternVertex, result, text;
		geometry = new THREE.Geometry();
		patternFace = /facet([\s\S]*?)endfacet/g;

		while ( ( result = patternFace.exec( data ) ) !== null ) {

			text = result[ 0 ];
			patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

			while ( ( result = patternNormal.exec( text ) ) !== null ) {

				normal = new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) );

			}

			patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

			while ( ( result = patternVertex.exec( text ) ) !== null ) {

				geometry.vertices.push( new THREE.Vector3( parseFloat( result[ 1 ] ), parseFloat( result[ 3 ] ), parseFloat( result[ 5 ] ) ) );

			}

			length = geometry.vertices.length;

			geometry.faces.push( new THREE.Face3( length - 3, length - 2, length - 1, normal ) );

		}

		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		return geometry;

	},

	ensureString: function ( buf ) {

		if ( typeof buf !== "string" ) {

			var array_buffer = new Uint8Array( buf );
			var str = '';
			for ( var i = 0; i < buf.byteLength; i ++ ) {

				str += String.fromCharCode( array_buffer[ i ] ); // implicitly assumes little-endian

			}
			return str;

		} else {

			return buf;

		}

	},

	ensureBinary: function ( buf ) {

		if ( typeof buf === "string" ) {

			var array_buffer = new Uint8Array( buf.length );
			for ( var i = 0; i < buf.length; i ++ ) {

				array_buffer[ i ] = buf.charCodeAt( i ) & 0xff; // implicitly assumes little-endian

			}
			return array_buffer.buffer || array_buffer;

		} else {

			return buf;

		}

	}

};

if ( typeof DataView === 'undefined' ) {

	DataView = function( buffer, byteOffset, byteLength ) {

		this.buffer = buffer;
		this.byteOffset = byteOffset || 0;
		this.byteLength = byteLength || buffer.byteLength || buffer.length;
		this._isString = typeof buffer === "string";

	};

	DataView.prototype = {

		_getCharCodes: function( buffer, start, length ) {

			start = start || 0;
			length = length || buffer.length;
			var end = start + length;
			var codes = [];
			for ( var i = start; i < end; i ++ ) {

				codes.push( buffer.charCodeAt( i ) & 0xff );

			}
			return codes;

		},

		_getBytes: function ( length, byteOffset, littleEndian ) {

			var result;

			// Handle the lack of endianness
			if ( littleEndian === undefined ) {

				littleEndian = this._littleEndian;

			}

			// Handle the lack of byteOffset
			if ( byteOffset === undefined ) {

				byteOffset = this.byteOffset;

			} else {

				byteOffset = this.byteOffset + byteOffset;

			}

			if ( length === undefined ) {

				length = this.byteLength - byteOffset;

			}

			// Error Checking
			if ( typeof byteOffset !== 'number' ) {

				throw new TypeError( 'DataView byteOffset is not a number' );

			}

			if ( length < 0 || byteOffset + length > this.byteLength ) {

				throw new Error( 'DataView length or (byteOffset+length) value is out of bounds' );

			}

			if ( this.isString ) {

				result = this._getCharCodes( this.buffer, byteOffset, byteOffset + length );

			} else {

				result = this.buffer.slice( byteOffset, byteOffset + length );

			}

			if ( ! littleEndian && length > 1 ) {

				if ( Array.isArray( result ) === false ) {

					result = Array.prototype.slice.call( result );

				}

				result.reverse();

			}

			return result;

		},

		// Compatibility functions on a String Buffer

		getFloat64: function ( byteOffset, littleEndian ) {

			var b = this._getBytes( 8, byteOffset, littleEndian ),

				sign = 1 - ( 2 * ( b[ 7 ] >> 7 ) ),
				exponent = ( ( ( ( b[ 7 ] << 1 ) & 0xff ) << 3 ) | ( b[ 6 ] >> 4 ) ) - ( ( 1 << 10 ) - 1 ),

			// Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
				mantissa = ( ( b[ 6 ] & 0x0f ) * Math.pow( 2, 48 ) ) + ( b[ 5 ] * Math.pow( 2, 40 ) ) + ( b[ 4 ] * Math.pow( 2, 32 ) ) +
							( b[ 3 ] * Math.pow( 2, 24 ) ) + ( b[ 2 ] * Math.pow( 2, 16 ) ) + ( b[ 1 ] * Math.pow( 2, 8 ) ) + b[ 0 ];

			if ( exponent === 1024 ) {

				if ( mantissa !== 0 ) {

					return NaN;

				} else {

					return sign * Infinity;

				}

			}

			if ( exponent === - 1023 ) {

				// Denormalized
				return sign * mantissa * Math.pow( 2, - 1022 - 52 );

			}

			return sign * ( 1 + mantissa * Math.pow( 2, - 52 ) ) * Math.pow( 2, exponent );

		},

		getFloat32: function ( byteOffset, littleEndian ) {

			var b = this._getBytes( 4, byteOffset, littleEndian ),

				sign = 1 - ( 2 * ( b[ 3 ] >> 7 ) ),
				exponent = ( ( ( b[ 3 ] << 1 ) & 0xff ) | ( b[ 2 ] >> 7 ) ) - 127,
				mantissa = ( ( b[ 2 ] & 0x7f ) << 16 ) | ( b[ 1 ] << 8 ) | b[ 0 ];

			if ( exponent === 128 ) {

				if ( mantissa !== 0 ) {

					return NaN;

				} else {

					return sign * Infinity;

				}

			}

			if ( exponent === - 127 ) {

				// Denormalized
				return sign * mantissa * Math.pow( 2, - 126 - 23 );

			}

			return sign * ( 1 + mantissa * Math.pow( 2, - 23 ) ) * Math.pow( 2, exponent );

		},

		getInt32: function ( byteOffset, littleEndian ) {

			var b = this._getBytes( 4, byteOffset, littleEndian );
			return ( b[ 3 ] << 24 ) | ( b[ 2 ] << 16 ) | ( b[ 1 ] << 8 ) | b[ 0 ];

		},

		getUint32: function ( byteOffset, littleEndian ) {

			return this.getInt32( byteOffset, littleEndian ) >>> 0;

		},

		getInt16: function ( byteOffset, littleEndian ) {

			return ( this.getUint16( byteOffset, littleEndian ) << 16 ) >> 16;

		},

		getUint16: function ( byteOffset, littleEndian ) {

			var b = this._getBytes( 2, byteOffset, littleEndian );
			return ( b[ 1 ] << 8 ) | b[ 0 ];

		},

		getInt8: function ( byteOffset ) {

			return ( this.getUint8( byteOffset ) << 24 ) >> 24;

		},

		getUint8: function ( byteOffset ) {

			return this._getBytes( 1, byteOffset )[ 0 ];

		}

	 };

}

//orbitcontrols
/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {

		return spherical.phi;

	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function() {

		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function () {

			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			// restrict theta to be between desired limits
			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

			// restrict phi to be between desired limits
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

			spherical.makeSafe();


			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

			}

			scale = 1;
			panOffset.set( 0, 0, 0 );

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};

	}();

	this.dispose = function() {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'mousewheel', onMouseWheel, false );
		scope.domElement.removeEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		document.removeEventListener( 'mouseout', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {

		sphericalDelta.theta -= angle;

	}

	function rotateUp( angle ) {

		sphericalDelta.phi -= angle;

	}

	var panLeft = function() {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function() {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 1 ); // get Y column of objectMatrix
			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function() {

		var offset = new THREE.Vector3();

		return function( deltaX, deltaY ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object instanceof THREE.PerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we actually don't use screenWidth, since perspective camera is fixed to screen height
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

			} else if ( scope.object instanceof THREE.OrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();

	function dollyIn( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	function dollyOut( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownDolly( event ) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		//console.log( 'handleMouseDownPan' );

		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveRotate( event ) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleMouseMoveDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseUp( event ) {

		//console.log( 'handleMouseUp' );

	}

	function handleMouseWheel( event ) {

		//console.log( 'handleMouseWheel' );

		var delta = 0;

		if ( event.wheelDelta !== undefined ) {

			// WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail !== undefined ) {

			// Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( delta < 0 ) {

			dollyIn( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function handleTouchStartRotate( event ) {

		//console.log( 'handleTouchStartRotate' );

		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchStartDolly( event ) {

		//console.log( 'handleTouchStartDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyStart.set( 0, distance );

	}

	function handleTouchStartPan( event ) {

		//console.log( 'handleTouchStartPan' );

		panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchMoveRotate( event ) {

		//console.log( 'handleTouchMoveRotate' );

		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleTouchMoveDolly( event ) {

		//console.log( 'handleTouchMoveDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyIn( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleTouchMovePan( event ) {

		//console.log( 'handleTouchMovePan' );

		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleTouchEnd( event ) {

		//console.log( 'handleTouchEnd' );

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( event.button === scope.mouseButtons.ORBIT ) {

			if ( scope.enableRotate === false ) return;

			handleMouseDownRotate( event );

			state = STATE.ROTATE;

		} else if ( event.button === scope.mouseButtons.ZOOM ) {

			if ( scope.enableZoom === false ) return;

			handleMouseDownDolly( event );

			state = STATE.DOLLY;

		} else if ( event.button === scope.mouseButtons.PAN ) {

			if ( scope.enablePan === false ) return;

			handleMouseDownPan( event );

			state = STATE.PAN;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			document.addEventListener( 'mouseout', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			if ( scope.enableRotate === false ) return;

			handleMouseMoveRotate( event );

		} else if ( state === STATE.DOLLY ) {

			if ( scope.enableZoom === false ) return;

			handleMouseMoveDolly( event );

		} else if ( state === STATE.PAN ) {

			if ( scope.enablePan === false ) return;

			handleMouseMovePan( event );

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		document.removeEventListener( 'mouseout', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

		event.preventDefault();
		event.stopPropagation();

		handleMouseWheel( event );

		scope.dispatchEvent( startEvent ); // not sure why these are here...
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;

				handleTouchStartRotate( event );

				state = STATE.TOUCH_ROTATE;

				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;

				handleTouchStartDolly( event );

				state = STATE.TOUCH_DOLLY;

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;

				handleTouchStartPan( event );

				state = STATE.TOUCH_PAN;

				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			scope.dispatchEvent( startEvent );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...

				handleTouchMoveRotate( event );

				break;

			case 2: // two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

				handleTouchMoveDolly( event );

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;
				if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

				handleTouchMovePan( event );

				break;

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		event.preventDefault();

	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	scope.domElement.addEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties( THREE.OrbitControls.prototype, {

	center: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving : {

		get: function () {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.enableDamping = ! value;

		}

	},

	dynamicDampingFactor : {

		get: function () {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.dampingFactor = value;

		}

	}

} );



    // wired3d
    (function($){
        $(function(){
                var container;
                var camera, cameraTarget, scene, renderer;
                init();
                animate();
                
                function init() {
                    container = document.getElementById('wired3d');
                    var widthSize = $(window).width();
                    var heightSize = $(window).height();
                    var fov = 8;
                    var aspect = 1;
                    if( (widthSize / heightSize) < 1){
                        fov = 10;
                        aspect = (window.innerWidth * 1.1 / window.innerHeight );
                    }else{
                        aspect = (window.innerWidth * 0.92 / window.innerHeight );
                    }
                    
                    //document.body.appendChild(container);
                    camera = new THREE.PerspectiveCamera(fov, aspect, 2, 4000);
                    camera.position.set( -300, 200, 300 );//(0,0,700);
                    camera.rotation.x = Math.PI / 2;
                    var controls = new THREE.OrbitControls(camera, container); //, renderer.domElement);
                    controls.target = new THREE.Vector3( 0, -0.1, 0 );
                    //controls.enableDamping = true;
                    //controls.dampingFactor = 0.1;
                    controls.enableZoom = false;
                    controls.userPan = true;     //true:パン操作可能,false:パン操作不可
                    controls.userPanSpeed = 0.02;   //パン速度
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
                    loader.load( 'img/parachain5.obj', function ( geometry ) {
                        //var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
                        var path = "img/textures/";
                        var format = '.jpg';
                        var urls = [
                            path + 'px' + format, path + 'nx' + format,
                            path + 'py' + format, path + 'ny' + format,
                            path + 'pz' + format, path + 'nz' + format
                        ];
                        var reflectionCube = new THREE.CubeTextureLoader().load( urls );
                        reflectionCube.format = THREE.RGBFormat;
        
						var material = new THREE.MeshLambertMaterial( { color: 0x290d7e, wireframe: true, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.1 } );
						var mesh = geometry.children[ 0 ];
						// mesh.geometry.computeTangents();
                        mesh.material = material;
                        mesh.position.set( 0, -15, 15 );
                        mesh.rotation.set( - Math.PI / 2, - Math.PI / 2, - Math.PI / 2);
                        mesh.scale.set( 0.8,0.8, 0.8 );
                        mesh.castShadow = true;
						mesh.receiveShadow = true;
                        scene.add( mesh );
                        
                    } );
                    
                    
                    // Binary files
                    //var material = new THREE.MeshPhongMaterial( { color: 0xAAAAAA, specular: 0x111111, shininess: 200 } );
                    
                    // Lights
                    scene.add( new THREE.HemisphereLight( 0x443333, 0xa7007e ) );
                    addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
                    addShadowedLight( 0.5, 1, -1, 0x5dbfe6, 1 );
                    // renderer
					renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true  } );
					renderer.setPixelRatio(window.devicePixelRatio);
                    //renderer.setClearColor( scene.fog.color );
                    //renderer.setPixelRatio( window.devicePixelRatio );
                    //renderer.setSize( window.innerWidth -500, window.innerHeight -20 );
                    renderer.setSize(container.clientWidth, container.clientHeight);
                    
                    //renderer.gammaInput = true;
                    //renderer.gammaOutput = true;
                    //renderer.shadowMap.enabled = true;
                    //renderer.shadowMap.cullFace = THREE.CullFaceBack;
                    
                    var effect = new THREE.ParallaxBarrierEffect( renderer );
                    effect.setSize( window.innerWidth || 2, window.innerHeight || 2 );
                    // effect.setSize( container.clientWidth, container.clientHeight );
                    
                    container.appendChild( renderer.domElement );
                    
                    window.addEventListener( 'resize', onWindowResize, false );
                    
                    $('canvas').css('width', container.clientWidth); //widthSize * 8.5/10
                    $('canvas').css('height', container.clientHeight);
                    $('canvas').css('max-height', '1200px');
                    //$('#wired3d').css('float', 'right');
                    //$('#wired3d').css('width', '85%');
                    //$('#wired3d').css('min-height', '480px');
                    
                }
                
                function addShadowedLight( x, y, z, color, intensity ) {
					var directionalLight = new THREE.DirectionalLight( color, intensity );
					directionalLight.position.x = x; //( x, y, z );
					directionalLight.position.y = y; //( x, y, z );
					directionalLight.position.z = z; //( x, y, z );

                    // directionalLight.position.z = 3; //( x, y, z );
                    scene.add( directionalLight );
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
                
                function animate() {
                    requestAnimationFrame( animate );
                    
                    render();
                    //stats.update();
                }
                
                function render() {
                    var timer = Date.now() * 0.0005;
                    //camera.position.x = Math.cos( timer );
                    //camera.position.z = Math.sin( timer );
                    for ( var i = 0, l = scene.children.length; i < l; i ++ ) {
                        var object = scene.children[ i ];
                        object.rotation.x = timer * 0.1;
                        object.rotation.y = timer * 0.3;
                    }
                    
                    //camera.lookAt( cameraTarget );
                    //controls.update();
                    //effect.render( scene, camera );
                    renderer.render(scene, camera );
                }
         });
    })(jQuery);
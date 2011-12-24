/**
 * Copyright (C) 2011 Hakim El Hattab, http://hakim.se
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * zoom.js enables an easy API for magnifying the DOM on 
 * any given location. It also supports zooming in on a
 * specific element, much like double tapping does in 
 * Mobile Safari.
 * 
 * Currently just a proof of concept so expect bugs. Lots 
 * of bugs.
 * 
 * @author Hakim El Hattab | http://hakim.se
 */
var zoom = (function(){

	// The current zoom level (scale)
	var level = 1,
		mouseX = 0,
		mouseY = 0,
		panEngageTimeout = -1,
		panUpdateInterval = -1;

	// The easing that will be applied when we zoom in/out
	document.body.style.WebkitTransition = '-webkit-transform 0.8s ease';
	document.body.style.MozTransition = '-moz-transform 0.8s ease';
	document.body.style.msTransition = '-ms-transform 0.8s ease';
	document.body.style.OTransition = '-o-transform 0.8s ease';
	document.body.style.transition = 'transform 0.8s ease';
	
	// Zoom out if the user hits escape
	document.addEventListener( 'keyup', function( event ) {
		if( level !== 1 && event.keyCode === 27 ) {
			zoom.out();
		}
	} );

	// Monitor mouse movement for panning
	document.addEventListener( 'mousemove', function( event ) {
		if( level !== 1 ) {
			mouseX = event.clientX;
			mouseY = event.clientY;
		}
	} );

	function prefix( property, value ) {
		document.body.style[ 'Webkit' + property ] = value;
		document.body.style[ 'Moz' + property ] = value;
		document.body.style[ 'ms' + property ] = value;
		document.body.style[ 'O' + property ] = value;
		document.body.style[ property ] = value;
	}

	function pan() {
		var range = 0.15,
			rangeX = window.innerWidth * range,
			rangeY = window.innerHeight * range;
		
		// Up
		if( mouseY < rangeY ) {
			window.scroll( window.scrollX, window.scrollY - ( 1 - ( mouseY / rangeY ) ) * ( 14 / level ) );
		}
		// Down
		else if( mouseY > window.innerHeight - rangeY ) {
			window.scroll( window.scrollX, window.scrollY + ( 1 - ( window.innerHeight - mouseY ) / rangeY ) * ( 14 / level ) );
		}

		// Left
		if( mouseX < rangeX ) {
			window.scroll( window.scrollX - ( 1 - ( mouseX / rangeX ) ) * ( 14 / level ), window.scrollY );
		}
		// Rirght
		else if( mouseX > window.innerWidth - rangeX ) {
			window.scroll( window.scrollX + ( 1 - ( window.innerWidth - mouseX ) / rangeX ) * ( 14 / level ), window.scrollY );
		}
	}

	function position( element ) {
		var p = { x: 0, y: 0 };
		
		do {
			p.x += element.offsetLeft;
			p.y += element.offsetTop;
		}
		while ( element = element.offsetParent )

		return p;
	}

	return {
		in: function( options ) {
			if( level !== 1 ) {
				zoom.out();
			}
			else {
				options.x = options.x || 0;
				options.y = options.y || 0;

				// If an element is set, that takes precedence
				if( !!options.element ) {
					var padding = 20;

					options.width = options.element.getBoundingClientRect().width + ( padding * 2 );
					options.height = options.element.getBoundingClientRect().height + ( padding * 2 );
					options.x = options.element.getBoundingClientRect().left - padding;
					options.y = options.element.getBoundingClientRect().top - padding;
				}

				// If width/height values are set, calculate scale from those
				if( options.width !== undefined && options.height !== undefined ) {
					options.scale = Math.max( Math.min( window.innerWidth / options.width, window.innerHeight / options.height ), 1 );
				}

				if( options.scale > 1 ) {
					options.x *= options.scale;
					options.y *= options.scale;

					prefix( 'TransformOrigin', window.scrollX + 'px ' + window.scrollY + 'px' );
					prefix( 'Transform', 'translate('+ -options.x +'px, '+ -options.y +'px) scale('+ options.scale +')' );

					level = options.scale;

					panEngageTimeout = setTimeout( function() {
						panUpdateInterval = setInterval( pan, 1000 / 60 );
					}, 800 );
				}
			}
		},

		out: function() {
			clearTimeout( panEngageTimeout );
			clearInterval( panUpdateInterval );

			prefix( 'TransformOrigin', window.scrollX + 'px ' + window.scrollY + 'px' );
			prefix( 'Transform', '' );

			level = 1;
		},

		zoomLevel: function() {
			return level;
		}
	}
	
})();


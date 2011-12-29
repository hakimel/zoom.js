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
 * 
 * #############################################################################
 * 
 * 
 * zoom.js enables an easy API for magnifying the DOM on 
 * any given location. It supports zooming in on either a 
 * rectangle or element in the current document:
 * 
 * zoom.in({ 
 * 	element: document.querySelector( 'img' ) 
 * });
 * 
 * zoom.in({
 *   x: 100,
 *   y: 200,
 *   width: 300,
 *   height: 300
 * });
 * 
 * zoom.out();
 * 
 * 
 * 
 * Note #1: this is currently just a proof of concept, don't 
 * use it for anything important.
 * 
 * Note #2: zoom.js works by adjusting the transform, transition,
 * transform-origin and zoom (IE) CSS properties of the <body> node
 * and may conflict with your own styles. 
 * 
 * @author Hakim El Hattab | http://hakim.se
 * @version 0.1
 */
var zoom = (function(){

	// The current zoom level (scale)
	var level = 1;
	
	// The current mouse position, used for panning
	var mouseX = 0,
		mouseY = 0;
	
	// Timeout before pan is activated
	var panEngageTimeout = -1,
		panUpdateInterval = -1;

	// Check for transform support so that we can fallback otherwise
	var supportsTransforms =  document.body.style.transform !== undefined ||
                    		  document.body.style.OTransform !== undefined ||
                    		  document.body.style.msTransform !== undefined ||
                    		  document.body.style.MozTransform !== undefined ||
                    		  document.body.style.WebkitTransform !== undefined;
    
	if( supportsTransforms ) {
		// The easing that will be applied when we zoom in/out
		document.body.style.transition = 'transform 0.8s ease';
		document.body.style.OTransition = '-o-transform 0.8s ease';
		document.body.style.msTransition = '-ms-transform 0.8s ease';
		document.body.style.MozTransition = '-moz-transform 0.8s ease';
		document.body.style.WebkitTransition = '-webkit-transform 0.8s ease';
	}
	
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

	/**
	 * Applies the CSS required to zoom in, prioritizes use of CSS3 
	 * transforms but falls back on zoom for IE.
	 * 
	 * @param {Number} pageOffsetX 
	 * @param {Number} pageOffsetY 
	 * @param {Number} elementOffsetX 
	 * @param {Number} elementOffsetY 
	 * @param {Number} scale 
	 */
	function magnify( pageOffsetX, pageOffsetY, elementOffsetX, elementOffsetY, scale ) {

		if( supportsTransforms ) {
			var origin = pageOffsetX +'px '+ pageOffsetY +'px',
				transform = 'translate('+ -elementOffsetX +'px,'+ -elementOffsetY +'px) scale('+ scale +')';
			
			document.body.style.transformOrigin = origin;
			document.body.style.OTransformOrigin = origin;
			document.body.style.msTransformOrigin = origin;
			document.body.style.MozTransformOrigin = origin;
			document.body.style.WebkitTransformOrigin = origin;

			document.body.style.transform = transform;
			document.body.style.OTransform = transform;
			document.body.style.msTransform = transform;
			document.body.style.MozTransform = transform;
			document.body.style.WebkitTransform = transform;
		}
		else {
			// Reset all values
			if( scale === 1 ) {
				document.body.style.position = '';
				document.body.style.left = '';
				document.body.style.top = '';
				document.body.style.width = '';
				document.body.style.height = '';
				document.body.style.zoom = '';
			}
			// Apply scale
			else {
				document.body.style.position = 'relative';
				document.body.style.left = ( - ( pageOffsetX + elementOffsetX ) / scale ) + 'px';
				document.body.style.top = ( - ( pageOffsetY + elementOffsetY ) / scale ) + 'px';
				document.body.style.width = ( scale * 100 ) + '%';
				document.body.style.height = ( scale * 100 ) + '%';
				document.body.style.zoom = scale;
			}
		}

		level = scale;
	}

	/**
	 * Pan the document when the mosue cursor approaches the edges 
	 * of the window.
	 */
	function pan() {
		var range = 0.12,
			rangeX = window.innerWidth * range,
			rangeY = window.innerHeight * range,
			scrollOffset = getScrollOffset();
		
		// Up
		if( mouseY < rangeY ) {
			window.scroll( scrollOffset.x, scrollOffset.y - ( 1 - ( mouseY / rangeY ) ) * ( 14 / level ) );
		}
		// Down
		else if( mouseY > window.innerHeight - rangeY ) {
			window.scroll( scrollOffset.x, scrollOffset.y + ( 1 - ( window.innerHeight - mouseY ) / rangeY ) * ( 14 / level ) );
		}

		// Left
		if( mouseX < rangeX ) {
			window.scroll( scrollOffset.x - ( 1 - ( mouseX / rangeX ) ) * ( 14 / level ), scrollOffset.y );
		}
		// Right
		else if( mouseX > window.innerWidth - rangeX ) {
			window.scroll( scrollOffset.x + ( 1 - ( window.innerWidth - mouseX ) / rangeX ) * ( 14 / level ), scrollOffset.y );
		}
	}

	function getScrollOffset() {
		return {
			x: window.scrollX !== undefined ? window.scrollX : window.pageXOffset,
			y: window.scrollY !== undefined ? window.scrollY : window.pageXYffset
		}
	}

	return {
		/**
		 * Zooms in on either a rectangle or HTML element.
		 * 
		 * @param {Object} options
		 *   - element: HTML element to zoom in on
		 *   OR
		 *   - x/y: coordinates in non-transformed space to zoom in on
		 *   - width/height: the portion of the screen to zoom in on
		 *   - scale: can be used instead of width/height to explicitly set scale
		 */
		'in': function( options ) {
			// Due to an implementation limitation we can't zoom in
			// to another element without zooming out first
			if( level !== 1 ) {
				zoom.out();
			}
			else {
				options.x = options.x || 0;
				options.y = options.y || 0;

				// If an element is set, that takes precedence
				if( !!options.element ) {
					// Space around the zoomed in element to leave on screen
					var padding = 20;

					options.width = options.element.getBoundingClientRect().width + ( padding * 2 );
					options.height = options.element.getBoundingClientRect().height + ( padding * 2 );
					options.x = options.element.getBoundingClientRect().left - padding;
					options.y = options.element.getBoundingClientRect().top - padding;
				}

				// If width/height values are set, calculate scale from those values
				if( options.width !== undefined && options.height !== undefined ) {
					options.scale = Math.max( Math.min( window.innerWidth / options.width, window.innerHeight / options.height ), 1 );
				}

				if( options.scale > 1 ) {
					options.x *= options.scale;
					options.y *= options.scale;

					var scrollOffset = getScrollOffset();

					magnify( scrollOffset.x, scrollOffset.y, options.x, options.y, options.scale );

					// Wait with engaging panning as it may conflict with the
					// zoom transition
					panEngageTimeout = setTimeout( function() {
						panUpdateInterval = setInterval( pan, 1000 / 60 );
					}, 800 );
				}
			}
		},

		/**
		 * Resets the document zoom state to its default.
		 */
		'out': function() {
			clearTimeout( panEngageTimeout );
			clearInterval( panUpdateInterval );

			var scrollOffset = getScrollOffset();
			
			magnify( scrollOffset.x, scrollOffset.y, 0, 0, 1 );

			level = 1;
		},

		// Alias for 'in'
		'magnify': function( options ) { this['in']( options ) },
		
		'zoomLevel': function() {
			return level;
		}
	}
	
})();


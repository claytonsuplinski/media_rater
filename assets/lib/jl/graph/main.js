try{ JL = JL; } catch(e){ JL = {}; }

JL.graph = { get_val_fns : {} };

JL.graph.init = function(){
	if( !this.initialized ){
		var self = this;

		this._graphs = [];

		JL.functions.add_css(`
			.jl-graph { 
				background:#ececec;
			}

			.jl-graph path { 
				stroke: #bbb;
				stroke-width: 1;
				fill:transparent;
				pointer-events:none;
			}

			.jl-graph .axis path,
			.jl-graph .axis line {
				fill: none;
				stroke: #444;
				stroke-width: 1;
				shape-rendering: crispEdges;
			}

			.jl-graph text{
				fill:#000;
			}

			.jl-graph rect,
			.jl-graph circle{
				stroke:#888;
				stroke-width:1;
			}

			.jl-graph rect:hover,
			.jl-graph circle:hover{
				-webkit-filter:brightness(1.5);
					filter:brightness(1.5);
			}

			.jl-graph .grid{
				stroke:rgba( 255,255,255, 0.25 );
			}

			.jl-graph-tooltip{
				position: fixed;
				background: #333;
				border:1px solid rgba(255,255,255,0.25);
				color:#fff;
				font-size: 12px;
				width:  auto;
				height: auto;
				margin-top:20px;
				pointer-events: none;
				z-index:99999;
			}

			.jl-graph-tooltip .header,
			.jl-graph-tooltip .value{
				padding:3px 5px;
			}

			.jl-graph-tooltip .header{
				background:#222;
				border-bottom:1px solid rgba(255,255,255,0.25);
			}

			.jl-graph-tooltip .value{
				font-size:12px;
			}

			.jl-graph-cursor-line{
				position:absolute;
				fill:rgba(180, 234, 255, 0.35);
				stroke-width:0;
				pointer-events: none;
				z-index:99999;
			}
		`);

		this.window_width      = Number( $( window ).width() );
		this.window_width_half = this.window_width / 2;
		$( window ).on( 'resize', function(){
			self.window_width      = Number( $( window ).width() );
			self.window_width_half = self.window_width / 2;
		});

		this.initialized = true;
	}
};

JL.graph.clear_graph = function( p ){
	d3.selectAll( p.id + " > *" ).remove(); 
};

JL.graph.redraw_all_graphs = function(){
	this._graphs.forEach(function( p ){
		if( p.responsive ){
			this.clear_graph(          p );
			this[ 'draw_' + p._type ]( p );
		}
	}, this);
};

JL.graph.get_value_color = function( d, p ){
	var color = [0,0,0];

	if( p.colors.value ){
		color = p.colors.value;
	}
	else if( p.colors.scheme ){
		color = p.colors.scheme( d );
	}
	else{
		var bounds = p.colors.gradient_bounds;

		var val;
		if( p._bins ) val = Number( d._total );
		else          val = Number( d.y      );

		var range;
		if(       bounds ){ range = ( bounds.max - bounds.min ); val = val - bounds.min; }
		else if( p._bins )  range = p._max_bin;
		else                range = p._max_y  ;

		var percent = JL.functions.clamp( val / ( range || 1 ), 0, 1 );

		color = JL.functions.gradient_percent( percent, p.colors.gradient || [
			[ 250, 150,  50 ],
			[ 250, 250,  50 ],
			[ 150, 250,  50 ],
		] );
	}

	return 'rgb(' + color.map(function( x ){ return parseInt( x ); }).join(', ') + ')';
};

JL.graph.get_graph_canvas = function( p ){
	if( !p.id ) p.id = '#jl-graph-' + this._graphs.length;
	if(  p.id[ 0 ] !== '#' ) p.id = '#' + p.id;

	this._graphs.push( $.extend( true, {}, p ) );

	$( p.id ).addClass( 'jl-graph' );

	var container_width = p.width || Math.max( $( p.id ).parent().width(), p.min_width || 200 );

	var default_margins = { top : 20, right : 20, bottom : 30, left : 40 };

	if( p._type == 'usa_plot' ) default_margins = { top : 0, right : 0, bottom : 0, left : 0 };
	
	var margin = Object.assign( default_margins, p.margins || {} );

	var height_factor = ( p.height_factor !== undefined ? p.height_factor : ( p._type == 'timeline' ? 0.05 : 1/3 ) );
	
	var width  = p.graph_width  || Math.max( 0.85 *   container_width                   - margin.left - margin.right , p.min_width  || 0 );
	var height = p.graph_height || Math.max( 0.95 * ( container_width * height_factor ) - margin.top  - margin.bottom, p.min_height || 0 );
	
	var svg = d3.select( p.id )
			.attr( "width" , width  + margin.left + margin.right  )
			.attr( "height", height + margin.top  + margin.bottom )
		.append("g")
			.attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );
			
	svg.width  = width;
	svg.height = height;
	
	return svg;
};

JL.graph.init_get_val = function( range, p, cfg ){
	switch( p._type ){
		case 'histogram' : return d3.scaleLinear().range( range );
	};
	switch( cfg.scale ){
		case 'time' : return d3.scaleTime().range(   range );
		default     : return d3.scaleLinear().range( range );
	};
};

JL.graph.init_axis = function( side, get_val, p, cfg ){
	var axis = d3[ 'axis' + side ]( get_val ).scale( get_val );

	switch( cfg.scale ){
		case 'time':
			axis = axis.tickFormat( d3.timeFormat( cfg.tick_format || '%m/%d %H' ) );
			break;
		default:
			if( cfg.tick_format ) axis = axis.tickFormat( cfg.tick_format );
			break;
	};

	var num_ticks = ( cfg.num_ticks !== undefined ? cfg.num_ticks : 5 );
	if( cfg.fixed_ticks ) axis = axis.tickValues( d3.range( cfg._min, cfg._max, ( cfg._max - cfg._min ) / num_ticks ) );
	else                  axis = axis.ticks( num_ticks );

	return axis;
};

JL.graph.init_values = function( key, p, cfg ){
	if( cfg.scale == 'time' ){
		var parse_time = d3.timeParse( cfg.input_time_format || '%Y-%m-%d %H:%M:%S' );

		if( JL.functions.is_array( p.data[ 0 ] ) ){
			for( var r of p.data ){
				for( var d of r ) d[ key ] = parse_time( d[ key ] );
			}
		}
		else{
			for( var d of p.data ) d[ key ] = parse_time( d[ key ] );
		}

		[ 'min', 'max' ].forEach(function( x ){
			var curr_key = x + '_' + key;
			if( p[ curr_key ] !== undefined ) p[ curr_key ] = parse_time( p[ curr_key ] );
		});
	}
	
	return p.data.flat().map( d => d[ key ] ); 
};

JL.graph.add_cursor_line = function( ele, p, cfg ){
	var self = this;

	ele.on( "mousemove", function(){
		var cursor_line_x = d3.mouse( this )[ 0 ];

		var lines;
		if( JL.functions.is_array( p.data[ 0 ] ) ) lines = p.data;
		else                                       lines = [ p.data ];

		if( p._tooltip ){
			var closest_points = [];

			for( var line of lines ){
				var closest_point;
				var closest_dist = Infinity;
				for( var pt of line ){
					var curr_dist = Math.abs( pt.graph_x - cursor_line_x );
					if( curr_dist <= closest_dist ){
						closest_point = pt;
						closest_dist  = curr_dist;
					}
					else{ break; }
				}
				if( lines.length <= 1 || closest_dist < 5 ) closest_points.push( closest_point );
			}

			self.show_tooltip( closest_points, p );
		}

		p._cursor_line
			.attr( 'x', cursor_line_x )
			.style( "opacity", 1 );
	})
	.on( "mouseout", function(d){
		p._cursor_line.style( "opacity", 0 );

		if( p._tooltip ) self.hide_tooltip( p );
	} );
};

JL.graph.add_tooltip = function( ele, p, cfg ){
	var self = this;

	ele
		.on( "mouseover", function( d ){ self.show_tooltip( d, p, cfg ); })
		.on( "mouseout" , function( d ){ self.hide_tooltip( p ); } );
};

JL.graph.show_tooltip = function( d, p, cfg ){
	var cfg = cfg || {};

	var h_align = 'left';

	var mouse_x = d3.event.pageX;
	var mouse_y = d3.event.pageY;

	if( mouse_x > this.window_width_half ){
		mouse_x = this.window_width - mouse_x;
		h_align = 'right';
	}

	var h_align_opposite = ( h_align == 'left' ? 'right' : 'left' );

	var html = '';
	
	var data_points = ( JL.functions.is_array( d ) ? d : [ d ] );
	for( var pt of data_points ){
		var header = ( p.tooltip.header ? 
			p.tooltip.header( pt ) :
			( cfg.header ?
				cfg.header( pt ) :
				pt.name
			)
		);

		var value = ( p.tooltip.value ? 
			p.tooltip.value( pt ) :
			( cfg.value ?
				cfg.value( pt ) :
				'Value : ' + pt.y 
			)
		);

		html += ( header === undefined ? '' : '<div class="header" style="' + ( p.tooltip.header_style ? p.tooltip.header_style( pt ) : '' ) + '">' + header + '</div>' );
		html += ( value  === undefined ? '' : '<div class="value"  style="' + ( p.tooltip.value_style  ? p.tooltip.value_style(  pt ) : '' ) + '">' + value  + '</div>' );
	}

	p._tooltip.html( html )
		.style( 'margin-' + h_align          , "-30px" )
		.style( 'margin-' + h_align_opposite , "auto"  )
		.style( h_align_opposite, "auto" )
		.style( h_align, mouse_x + "px" )
		.style( "top"  , mouse_y + "px" )
		.style( "opacity", 0.9 );
};

JL.graph.hide_tooltip = function( p ){
	p._tooltip.style( "opacity", 0 );
};

JL.graph.add_x_axis = function( p, svg ){
	var cfg = p.x_axis || {};

	var get_val = this.init_get_val( [ 0, svg.width ], p, cfg );

	if( !this.get_val_fns[ p.id ] ) this.get_val_fns[ p.id ] = {};
	this.get_val_fns[ p.id ].x = get_val;

	var values = this.init_values( 'x', p, cfg );

	p._min_x = Math.min( ...values );
	p._max_x = Math.max( ...values );

	cfg._min = ( p.min_x !== undefined ? p.min_x : p._min_x );
	cfg._max = ( p.max_x !== undefined ? p.max_x : p._max_x );

	get_val.domain([ 
		cfg._min,
		cfg._max,
	]);

	var axis = this.init_axis( 'Bottom', get_val, p, cfg );

	if( p._type == 'histogram' ){
		var histogram = d3.histogram().value( d => d.x ).domain( get_val.domain() ).thresholds(
			d3.range( p.min_x, p.max_x, ( p.max_x - p.min_x ) / ( p.num_bins || 20 ) )
		);
			
		p._bins = histogram( p.data );

		p._bins.forEach(function( b ){
			b._total = 0;
			b._x0 = get_val( b.x0 );
			b._x1 = get_val( b.x1 );
			var x_vals = b.map( d => d.x );
			b._min_x = Math.min( ...x_vals );
			b._max_x = Math.max( ...x_vals );
			b.forEach(function( d ){
				b._total += d.y;
			});
		});

		p._max_bin = Math.max( ...p._bins.map( d => d._total ) );
	}

	svg.append( "g" )
		.attr( "class", "x axis" )
		.attr( "transform", "translate(0," + svg.height + ")" )
		.call( axis );

	if( JL.functions.is_array( p.data[ 0 ] ) ){
		for( var r of p.data ){
			for( var d of r ) d.graph_x = get_val( d.x );
		}
	}
	else{
		for( var d of p.data ) d.graph_x = get_val( d.x );
	}

	return get_val;
};

JL.graph.add_y_axis = function( p, svg ){
	var cfg = p.y_axis || {};

	var get_val = this.init_get_val( [ svg.height, 0 ], p, cfg );

	if( !this.get_val_fns[ p.id ] ) this.get_val_fns[ p.id ] = {};
	this.get_val_fns[ p.id ].y = get_val;

	var values = this.init_values( 'y', p, cfg );

	p._min_y = Math.min( ...values );
	p._max_y = Math.max( ...values );

	cfg._min = ( p.min_y !== undefined ? p.min_y : p._min_y );
	cfg._max = ( p.max_y !== undefined ? p.max_y : p._max_y );

	if( p._bins ){
		get_val.domain([ 0, d3.max( p._bins, function(d){ return d._total; } ) ]);

		p._bins.forEach(function( b ){
			b.graph_total = get_val( b._total );
		});
	}
	else{
		get_val.domain([
			cfg._min,
			cfg._max,
		]);
	}

	var axis = this.init_axis( 'Left', get_val, p, cfg );

	svg.append( "g" )
		.attr( "class", "y axis" )
		.call( axis );

	if( JL.functions.is_array( p.data[ 0 ] ) ){
		for( var r of p.data ){
			for( var d of r ) d.graph_y = get_val( d.y );
		}
	}
	else{
		for( var d of p.data ) d.graph_y = get_val( d.y );
	}

	if( p.grid_lines ) this.add_grid_lines( p, svg );

	return get_val;
};

JL.graph.add_lines = function( p, svg ){
	var create_lines = d3.line()
		.x(function(d){ return d.graph_x; })
		.y(function(d){ return d.graph_y; });

	var lines;
	if( JL.functions.is_array( p.data[ 0 ] ) ) lines = p.data;
	else                                       lines = [ p.data ];

	for( var line of lines ){
		svg.append( "path" )
			.attr( "class", "line " + ( p.line_classes || '' ) )
			.attr( "d", create_lines( line ) );
	}

	return lines;
};

JL.graph.add_dots = function( p, svg ){
	var self = this;

	var dots = svg.append('g')
		.selectAll("dot")
		.data( p.data.flat() )
		.enter()
			.append("circle")
				.attr( "class", function( d ){ return [ p.dot_classes, d.classes ].map( x => x || '' ).join(' '); } )
				.attr("r", p.dot_radius || 3 )
				.style( "fill", function(d){ return d.color || "#69b3a2"; });

	if( [ 'usa_plot' ].includes( p._type ) ){
		dots.attr("cx", function (d) { try{ return p.projection([ d.lon, d.lat ])[0]; } catch(e){ return 0; } } )
		dots.attr("cy", function (d) { try{ return p.projection([ d.lon, d.lat ])[1]; } catch(e){ return 0; } } )
	}
	else{
		dots.attr("cx", function (d) { return d.graph_x; } )
		dots.attr("cy", function (d) { return d.graph_y; } )
	}

	if( p.colors ){
		dots.style("fill", function(d){
			return d.color || self.get_value_color( d, p );
		});
	}

	if( p._tooltip ) this.add_tooltip( dots, p, {} );

	return dots;
};

JL.graph.add_boxes = function( p, svg ){
	var self = this;

	var boxes = svg.selectAll("rect")
		.data( p.data )
		.enter()
		.append( "rect" )
			.attr(  "class"    , function(d){ return [ p.box_classes, d.classes ].map( x => x || '' ).join(' '); } )
			.attr(  "width"    , function(d){ return ( d.width  !== undefined ? d.width  : ( p.box_width  !== undefined ? p.box_width  : 1 ) ); })
			.attr(  "height"   , function(d){ return ( d.height !== undefined ? d.height : ( p.box_height !== undefined ? p.box_height : 1 ) ); })
			.attr(  "transform", function(d){ return "translate(" + ( ( d.graph_x || 0 ) - ( $( this ).width() / 2 ) ) + "," + ( ( d.graph_y || 0 ) - ( $( this ).height() / 2 ) ) + ")"; })
			.style( "fill"     , function(d){ return d.color || "#69b3a2"; });

	if( p.colors ){
		boxes.style("fill", function(d){
			return self.get_value_color( d, p );
		});
	}

	if( p._tooltip ) this.add_tooltip( boxes, p, {} );

	return boxes;
};

JL.graph.add_binned_bars = function( p, svg ){
	var self = this;

	var bars = svg.selectAll("rect")
		.data( p._bins )
		.enter()
		.append( "rect" )
			.attr(  "transform", function(d){ return "translate(" + d._x0 + "," + d.graph_total + ")"; })
			.attr(  "width"    , function(d){ return d._x1 - d._x0 - 1 ; })
			.attr(  "height"   , function(d){ return svg.height - d.graph_total; })
			.style( "fill"     , function(d){ return d.color || "#69b3a2"; });

	if( p.colors ){
		bars.style("fill", function(d){
			return self.get_value_color( d, p );
		});
	}

	if( p._tooltip ){
		this.add_tooltip( bars, p, {
			header : function( d ){ return d._min_x + ' - ' + d._max_x; },
			value  : function( d ){ return 'Value : ' + d._total; },
		} );
	}

	return bars;
};

JL.graph.add_grid_lines = function( p, svg ){
	var x_min = ( p.min_x !== undefined ? p.min_x : Math.min( ...p.data.map( d => d.x ) ) );
	var x_max = ( p.max_x !== undefined ? p.max_x : Math.max( ...p.data.map( d => d.x ) ) );
	var y_min = ( p.min_y !== undefined ? p.min_y : Math.min( ...p.data.map( d => d.y ) ) );
	var y_max = ( p.max_y !== undefined ? p.max_y : Math.max( ...p.data.map( d => d.y ) ) );

	var x_spacing = p.x_spacing || 5;
	var y_spacing = p.y_spacing || 5;

	for( var i = x_spacing * ( Math.floor( x_min / x_spacing ) - 1 ); i <= x_max; i += x_spacing ){
		if( i > x_min ){
			this.add_lines({ line_classes : 'grid', data : [
				{ graph_x : this.get_val_fns[ p.id ].x( i ), graph_y : this.get_val_fns[ p.id ].y( y_min ) },
				{ graph_x : this.get_val_fns[ p.id ].x( i ), graph_y : this.get_val_fns[ p.id ].y( y_max ) }
			]}, svg);
		}
	}
	for( var i = y_spacing * ( Math.floor( y_min / y_spacing ) - 1 ); i <= y_max; i += y_spacing ){
		if( i > y_min ){
			this.add_lines({ line_classes : 'grid', data : [
				{ graph_x : this.get_val_fns[ p.id ].x( x_min ), graph_y : this.get_val_fns[ p.id ].y( i ) },
				{ graph_x : this.get_val_fns[ p.id ].x( x_max ), graph_y : this.get_val_fns[ p.id ].y( i ) }
			]}, svg );
		}
	}

};

JL.graph.add_map = function( p, svg ){
	var projection = d3.geoAlbersUsa().scale(1300).translate([ 487.5, 305 ]);
        var path       = d3.geoPath().projection( projection );

	var basemap;

	$.ajax({
		url      : './assets/lib/jl/graph/states-10m.json',
		dataType : 'json',
		async    : false,
		success  : function( basemap_data ){
			basemap = svg.selectAll( "path" )
				.data( topojson.feature( basemap_data, basemap_data.objects.states ).features )
				.enter()
				.append( "path" )
					.attr(  "d"     , path )
					.style( "stroke", function(d){ return "#666"; } )
					.style( "fill"  , function(d){ return "#333"; } );
		},
	});

	if( p.dots ) this.add_dots( Object.assign( { data : p.dots, projection }, p ), svg );

	return basemap;
};

JL.graph.draw_graph = function( p, custom_fn ){
	this.init();

	var p = $.extend( true, {}, p || {} );

	var id = p.id;

	if( p.clear ) this.clear_graph({ id : '#' + p.id });

	var svg = this.get_graph_canvas( p );

	if( p.responsive ){
		if( !this.has_responsive_graph ){
			window.addEventListener( 'resize', function(){
				JL.graph.redraw_all_graphs();
			});

			this.has_responsive_graph = true;
		}
	}

	if( p.tooltip ){
		var tooltip_id = id + "-jl-graph-tooltip";
		$( '#' + tooltip_id ).remove();
		p._tooltip = d3.select( "body" ).append( "div" )
			.attr( "id", tooltip_id )
			.attr( "class", "jl-graph-tooltip" )
			.style( "opacity", 0 );
	}

	var mouse_svg;
	if( p.mouse || p.cursor_line ){
		// Note : this element is needed for clicking anywhere on the graph background.
		// 	Trying to add the click event directly to the svg didn't work (bug with d3 library).
		mouse_svg = svg.append( 'svg:rect' )
			.attr(  'x'      , 0 )
			.attr(  'y'      , 0 )
			.attr(  'width'  , svg.width  )
			.attr(  'height' , svg.height )
			.style( 'opacity', 0 );
	}

	if( p.cursor_line ){
		p._cursor_line = svg.append( "svg:rect" )
			.attr( "class", "jl-graph-cursor-line" )
			.attr(  'x'      , 0 )
			.attr(  'y'      , 0 )
			.attr(  'width'  , 1 )
			.attr(  'height' , svg.height )
			.style( "opacity", 0 );

		this.add_cursor_line( mouse_svg, p, {} );
	}

	custom_fn.call( this, p, svg );

	if( p.mouse ){
		p.mouse.forEach(function( mouse_event ){
			var target = mouse_event.target || '*';

			if( mouse_event.right_click ) svg.selectAll( target ).on( 'contextmenu', function(){ event.preventDefault(); } );

			if( mouse_event.left_click || mouse_event.right_click ){
				var on_click = function(){
					var args = {};
					args.event = event;
					args.val   = { x : 0, y : 0 };

					var target_data = event.target.__data__;
					if( target_data ){
						args.val = target_data;
					}
					else{
						var coords = d3.mouse( this );
						if( JL.graph.get_val_fns[ p.id ].x ) args.val.x = JL.graph.get_val_fns[ p.id ].x.invert( coords[0] );
						if( JL.graph.get_val_fns[ p.id ].y ) args.val.y = JL.graph.get_val_fns[ p.id ].y.invert( coords[1] );
					}

					if( mouse_event.left_click ){
						if( event.button === 0 ) mouse_event.left_click(  args );
					}
					if( mouse_event.right_click ){
						if( event.button === 2 ) mouse_event.right_click( args );
					}

					event.stopPropagation();
				};

				svg.selectAll( target ).on( 'mousedown', on_click );
			}
			if( mouse_event.wheel ){
				var on_wheel = function(){
					var args = {};
					args.event = event;
					args.spin  = {
						x : event.deltaX,
						y : event.deltaY,
					};

					mouse_event.wheel( args );

					event.stopPropagation();
					event.preventDefault();
				};

				svg.selectAll( target ).on( 'wheel', on_wheel );
			}
		}, this);
	}
};

JL.graph.draw_line_graph = function( p ){
	p._type = 'line_graph';
	this.draw_graph( p, function( p, svg ){
		this.add_x_axis(      p, svg );
		this.add_y_axis(      p, svg );
		this.add_lines(       p, svg );
		this.add_dots(        p, svg );
	} );
};

JL.graph.draw_scatter_plot = function( p ){
	p._type = 'scatter_plot';
	this.draw_graph( p, function( p, svg ){
		this.add_x_axis(      p, svg );
		this.add_y_axis(      p, svg );
		this.add_dots(        p, svg );
	} );
};

JL.graph.draw_histogram = function( p ){
	p._type = 'histogram';
	this.draw_graph( p, function( p, svg ){
		this.add_x_axis(      p, svg );
		this.add_y_axis(      p, svg );
		this.add_binned_bars( p, svg );
	} );
};

JL.graph.draw_timeline = function( p ){
	p._type = 'timeline';
	this.draw_graph( p, function( p, svg ){
		this.add_x_axis(      p, svg );
		this.add_y_axis(      p, svg );
		this.add_boxes(       p, svg );
	} );
};

JL.graph.draw_usa_plot = function( p ){
	p._type = 'usa_plot';
	this.draw_graph( p, function( p, svg ){
		this.add_map(         p, svg );
	} );
};


// Example:
// JL.graph.draw_scatter_plot({
// 	id   : 'scatter-plot',
// 	data : this.data.values.map(function( v ){
// 		return {
// 			name : v.timestamp,
// 			x    : v.timestamp,
// 			y    : v.count,
// 		};
// 	}),
// 	tooltip  : {
// 		header : function( d ){
// 			return [ d.x0, d.x1 ].map(function( d, i ){
// 				var dt = new Date( d );
// 				dt.setMinutes( dt.getMinutes() - i );
// 				if( !i ) return JL.functions.strftime( '%Y-%m-%d %H:%M', dt );
// 				else     return JL.functions.strftime(          '%H:%M', dt );
// 			}).join(' - ');
// 		},
// 		value : function( d ){ return 'Errors : ' + d._total; },
// 	},
// 	min_x   : this.range_start,
// 	max_x   : this.range_end,
// 	x_axis : {
// 		scale       : 'time',
// 		tick_format : '%m/%d %Hz',
// 		num_ticks   : 4,
// 		fixed_ticks : true,
// 	},
// 	y_axis : {
// 		num_ticks : 5,
// 	},
// 	margins : { left : 50 },
// 	colors  : {
// 		gradient : [
// 			[ 250, 250,  50 ],
// 			[ 250, 150,  50 ],
// 			[ 250,  50,  50 ],
// 		],
// 		gradient_bounds : { min : 0, max : 10 },
// 	},
//	mouse       : [{
//		left_click  : function( p ){ console.log( p.val.x, p.val.y ); },
//		right_click : function( p ){},
//		wheel       : function( p ){
//			if( p.spin.y ) self.zoom( p.spin.y );
//		},
//	}],
// });

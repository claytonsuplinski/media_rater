MIA.graph = {};

MIA.graph.get_dot_color = function( d, p ){
	var r = 50;
	var g = 50;
	var b = 50;
	
	var mid = ( p.mid_value !== undefined ? p.mid_value : 50 );
	var max = mid * 2;
	
	var val = Number( d.y );				
	if( val < mid ){
		r += 150;
		g += 150 * ( val ) / mid;
	}
	else{
		r += 150 * ( max - val ) / mid;
		g += 150;
	}
	return 'rgb(' + [ r, g, b ].map( x => parseInt( x ) ).join(', ') + ')';
};

MIA.graph.get_graph_canvas = function( p ){
	var id = p.id || '#graph';

	var container_width = Math.max( $( id ).parent().width(), 1200 );
	
	var margin = { top : 40, right : 20, bottom : 40, left : 80 };
	
	var width  = 0.85 *   container_width       - margin.left - margin.right;
	var height = 0.95 * ( container_width / 3 ) - margin.top  - margin.bottom;
	
	var svg = d3.select( id )
			.attr( "width" , width  + margin.left + margin.right  )
			.attr( "height", height + margin.top  + margin.bottom )
		.append("g")
			.attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );
			
	svg.width  = width;
	svg.height = height;
	
	return svg;
};

MIA.graph.draw_line_graph = function( p ){
	var self = this;

	var svg = this.get_graph_canvas( p );

	var x = d3.scaleLinear().range([ 0, svg.width  ]);
	var y = d3.scaleLinear().range([ svg.height, 0 ]);

	var x_axis = d3.axisBottom().scale( x ).ticks( Math.min( p.data.length / 2, 20 ) ).tickFormat(function(x){ return x; });
	var y_axis = d3.axisLeft().scale( y ).ticks( 10 );
	
	var tooltip = d3.select( "#content" ).append( "div" )
		.attr( "class", "graph-tooltip" )
		.style( "opacity", 0 );

	// Define the line
	var lines = d3.line()
		.x(function(d) { return x( d.x ); })
		.y(function(d) { return y( d.y ); });
			
	var x_values = p.data.map( d => d.x ); 
	var y_values = p.data.map( d => d.y );
			
	x.domain([ Math.min( ...x_values ), Math.max( ...x_values ) ]);
	y.domain([ 0, p.max_y_value || Math.max( Math.max( ...y_values ), 100 ) ]);
			
	// Plot the lines.
	svg.append( "path" )
		.attr( "class", "line" )
		.attr( "d", lines( p.data ) );

	// Add the X Axis
	svg.append( "g" )
		.attr( "class", "x axis" )
		.attr( "transform", "translate(0," + svg.height + ")" )
		.call( x_axis );

	// Add the Y Axis
	svg.append( "g" )
		.attr( "class", "y axis" )
		.call( y_axis );
		
	// Add dots
	svg.append('g')
		.selectAll("dot")
		.data( p.data )
		.enter()
			.append("circle")
			.attr("cx", function (d) { return x( d.x ); } )
			.attr("cy", function (d) { return y( d.y ); } )
			.attr("r", 3)
			.style("fill", function(d){
				return self.get_dot_color( d, p );
			})
			.on( "mouseover", function(d){
				tooltip.html(
					'<div class="header">' + 
						d.x + 
						'<span class="sub-header">' + d.y.toFixed(1) + ' <i class="fa fa-star"></i></span>' +
					'</div>' +
					( !d.sub_labels ? '' : '<div class="value">' +
						'<table>' +
							d.sub_labels.map(function( entry ){
								return '<tr>' +
									'<td class="x">' + entry.x + '</td>' +
									'<td class="y">' + entry.y + ' <i class="fa fa-star"></i></td>' +
								'</tr>';
							}).join('') +
						'</table>' +
					'</div>' )
				)
					.style( "left", d3.event.pageX + "px" )
					.style( "top" , d3.event.pageY + "px" )
					.transition()
					.duration( 200 )
					.style( "opacity", 0.9 )

			})
			.on( "mouseout", function(d){
				tooltip.transition()
					.duration( 300 )
					.style( "opacity", 0 );
			} );
};

MIA.graph.draw_scatter_plot = function( p ){
	var self = this;

	var svg = this.get_graph_canvas( p );
	
	var x = d3.scaleLinear().range([ 0, svg.width  ]);
	var y = d3.scaleLinear().range([ svg.height, 0 ]);
	
	var x_values = p.data.map( d => d.x );
	var y_values = p.data.map( d => d.y );
			
	x.domain([ Math.min( ...x_values ), Math.max( ...x_values ) ]);
	y.domain([ 0, p.max_y_value || Math.max( Math.max( ...y_values ), 100 ) ]);
	
	var x_axis = d3.axisBottom().scale( x ).ticks( 20 ).tickFormat(function(x){ return x; });
	var y_axis = d3.axisLeft().scale( y ).ticks( 10 );
	
	var tooltip = d3.select( "#content" ).append( "div" )
		.attr( "class", "graph-tooltip" )
		.style( "opacity", 0 );
	
	// Add the X Axis
	svg.append( "g" )
		.attr( "class", "x axis" )
		.attr( "transform", "translate(0," + svg.height + ")" )
		.call( x_axis );

	// Add the Y Axis
	svg.append( "g" )
		.attr( "class", "y axis" )
		.call( y_axis );
		
	// Add dots
	svg.append('g')
		.selectAll("dot")
		.data( p.data )
		.enter()
			.append("circle")
			.attr("cx", function (d) { return x( d.x ); } )
			.attr("cy", function (d) { return y( d.y ); } )
			.attr("r", 3)
			.style("fill", function(d){
				return self.get_dot_color( d, p );
			})
			.on( "mouseover", function(d){
				tooltip.html(
					'<div class="header">' + 
						d.name + 
						'<span class="sub-header">(' + d.x + ')</span>' +
					'</div>' +
					'<div class="value">Rating : ' + d.y + ' <i class="fa fa-star"></i></div>'
				)
					.style( "left", d3.event.pageX + "px" )
					.style( "top" , d3.event.pageY + "px" )
					.transition()
					.duration( 200 )
					.style( "opacity", 0.9 )

			})
			.on( "mouseout", function(d){
				tooltip.transition()
					.duration( 300 )
					.style( "opacity", 0 );
			} );
};

MIA.graph.draw_histogram = function( p ){
	var svg = this.get_graph_canvas( p );
	
	var x = d3.scaleLinear().range([ 0, svg.width  ]);
	var y = d3.scaleLinear().range([ svg.height, 0 ]);
			
	x.domain([ p.x_min || 0, ( p.x_max !== undefined ? p.x_max : 100 ) ]);
	
	var num_bins = p.bins || 20;
	
	var x_axis = d3.axisBottom().scale( x ).ticks( Math.min( num_bins, 50 ) ).tickFormat(function(x){ return x; });
	var y_axis = d3.axisLeft().scale( y ).ticks( 10 );
	
	// Add the X Axis
	svg.append( "g" )
		.attr( "class", "x axis" )
		.attr( "transform", "translate(0," + svg.height + ")" )
		.call( x_axis );
		
	var histogram = d3.histogram()
		.value(function(d){ return d.val; })
		.domain( x.domain() )
		.thresholds( x.ticks( num_bins ) );
		
	var bins = histogram( p.data );

	// Add the Y Axis
	y.domain([ 0, d3.max( bins, function(d){ return d.length; } ) ]);
	svg.append( "g" )
		.attr( "class", "y axis" )
		.call( y_axis );

	// append the bar rectangles to the svg element
	svg.selectAll("rect")
		.data( bins )
		.enter()
		.append("rect")
			.attr("x", 1)
			.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
			.attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
			.attr("height", function(d) { return svg.height - y(d.length); })
			.style("fill", "#69b3a2");
};
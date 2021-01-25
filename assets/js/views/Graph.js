MIA.content.views.graph = {};

MIA.content.views.graph.get_content = function( self, p ){
	var p = p || {};
	
	var data = self.data.slice();
	
	var get_data_value = function( d ){ return d.total_rating; };
	var max_y_value, mid_value;
	if( this.display_individual_category ){
		get_data_value = function( d ){ return d.ratings[ MIA.content.views.graph.display_individual_category ]; };
		max_y_value    = p.max_stars_per_category;
		mid_value      = max_y_value / 2;
	}
	
	if( self.name == 'years' ){
		var sorted_data = data.sort( (a,b) => ( a.name > b.name ? 1 : -1 ) );
		self.graphs.line_graph = {
			data : sorted_data.map(function( d ){ return { x : d.name, y : Number( get_data_value( d ) ) }; } ), max_y_value, mid_value
		};
	}
	else{
		self.graphs.scatter_plot = {
			data : data.map(function( d ){ return { x : d.year, y : Number( get_data_value( d ) ), name : d.name }; } ), max_y_value, mid_value
		};
	}
	
	return '<svg id="graph"></svg>' + MIA.content.get_display_individual_category_html( this, self );
};
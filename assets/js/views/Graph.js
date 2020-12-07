MIA.content.views.graph = {};

MIA.content.views.graph.get_content = function( self, p ){
	var p = p || {};
	
	var data = self.data.slice();
	
	if( self.name == 'years' ){
		var sorted_data = data.sort( (a,b) => ( a.name > b.name ? 1 : -1 ) );
		self.line_graph = {
			data : sorted_data.map(function( d ){ return { x : d.name, y : Number( d.total_rating ) }; } ),
		};
	}
	else{
		self.scatter_plot = {
			data : data.map(function( d ){ return { x : d.year, y : Number( d.total_rating ), name : d.name }; } ),
		};
	}
	
	return '<svg id="graph"></svg>';
};
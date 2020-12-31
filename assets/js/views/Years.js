MIA.content.views.years = {};

MIA.content.views.years.get_content = function( self, p ){
	var p = p || {};
	
	var num_rating_categories = Object.keys( self.data[ 0 ].ratings ).length;
	
	var rating_midpoint = num_rating_categories * p.max_stars_per_category / 2;
	
	var years_obj = {};
	self.data.forEach(function( entry ){
		if( !years_obj[ entry.year ] ) years_obj[ entry.year ] = { total : 0, sub_labels : [] };
		var entry_score = Math.max( Number( entry.total_rating ) - rating_midpoint, 0 );
		years_obj[ entry.year ].total += entry_score;
		if( entry_score ) years_obj[ entry.year ].sub_labels.push({ x : entry.name, y : '+' + entry_score.toFixed(1) });
	}, this);
	
	var year_names = Object.keys( years_obj ).sort( (a,b) => ( a > b ? 1 : -1 ) );
	
	var min_year = Math.min( ...year_names );
	var max_year = Math.max( ...year_names );
	
	var years = [];
	for( var i = min_year; i <= max_year; i++ ){
		var year = years_obj[i] || {};
		years.push({ x : i, y : year.total || 0, sub_labels : year.sub_labels });
	}
	
	self.graphs.line_graph = { data : years };
	
	return '<svg id="graph"></svg>';
};
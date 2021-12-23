MIA.content.views.years = {};

MIA.content.views.years.update_content = function( self, p ){
	$( '#view-content' ).html( this.get_content( self || MIA.content, p || this.params ) );
	MIA.content.post_draw_graphs();
};

MIA.content.views.years.get_content = function( self, p ){
	var p = p || {};
	this.params = $.extend( {}, p );

	var data = MIA.content.search_filter( self.data.slice() );
	
	var num_rating_categories = Object.keys( data[ 0 ].ratings ).length;
	
	var years_obj = {};
	
	var format_years_obj_entry = function( entry, value ){
		if( !years_obj[ entry.year ] ) years_obj[ entry.year ] = { total : 0, sub_labels : [] };
		var entry_score = Math.max( Number( value ) - rating_midpoint, 0 );
		years_obj[ entry.year ].total += entry_score;
		if( entry_score ) years_obj[ entry.year ].sub_labels.push({ x : entry.name, y : '+' + entry_score.toFixed(1) });
	};
	
	if( !this.display_individual_category ){
		var rating_midpoint = num_rating_categories * p.max_stars_per_category / 2;
		
		data.forEach(function( entry ){ format_years_obj_entry( entry, entry.total_rating ); }, this);
	}
	else{
		var rating_midpoint = p.max_stars_per_category / 2;
		
		data.sort( (a,b) => ( b.ratings[ this.display_individual_category ] - a.ratings[ this.display_individual_category ] ) ).forEach(function( entry ){
			format_years_obj_entry( entry, entry.ratings[ this.display_individual_category ] );
		}, this);
	}
	
	var year_names = Object.keys( years_obj ).sort( (a,b) => ( a > b ? 1 : -1 ) );
	
	var min_year = Math.min( ...year_names );
	var max_year = Math.max( ...year_names );
	
	var years = [];
	for( var i = min_year; i <= max_year; i++ ){
		var year = years_obj[i] || {};
		years.push({ x : i, y : year.total || 0, sub_labels : year.sub_labels });
	}
	
	var max_y_value = Math.max( ...years.map( x => x.y ) );
	var mid_value   = undefined;
	
	if( this.display_individual_category ) mid_value = max_y_value / 2;
	
	self.graphs.line_graph = { data : years, max_y_value, mid_value };
	
	var totals     = { year : 'Totals', score : 0, delta : 0, percent : 1 };
	var table_data = years.map(function( year, idx ){
		var delta = year.y - ( idx > 0 ? years[ idx - 1 ].y : 0 );

		totals.score += year.y;
		totals.delta += delta;
		
		return {
			year  : year.x,
			score : year.y,
			delta,
		};
	});

	table_data.forEach(function( year ){
		year.percent = year.score / totals.score;
	});
	
	return '<svg id="graph"></svg>' + 
		MIA.content.get_display_individual_category_html( this, self ) +
		'<div class="years-table-container">' +
			MIA.content.views.table.get_table_content(
				self, [ 'Year', 'Score', 'Delta', 'Percent' ], table_data,
				{ totals, score_max : ( this.display_individual_category ? max_y_value : undefined ) }
			) +
		'</div>';
};
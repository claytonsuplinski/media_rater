MIA.content.views.score_distribution = {
	bin_size  : 1,
	bin_sizes : [ 0.5, 1, 2, 5, 10, 20, 50 ],
};

MIA.content.views.score_distribution.set_bin_size = function( val ){
	this.bin_size = val;
	this.self.draw();
};

MIA.content.views.score_distribution.get_content = function( self, p ){
	this.self = self;
	
	var p = p || {};
	
	var get_data_value = function( d ){ return d.total_rating; };
	var x_max = 100;
	if( this.display_individual_category ){
		get_data_value = function( d ){ return d.ratings[ MIA.content.views.score_distribution.display_individual_category ]; };
		x_max = p.max_stars_per_category;
	}
	
	self.graphs.histogram = {
		bins : x_max / this.bin_size,
		data : self.data.map(function( d ){ return { name : d.name, val : Number( get_data_value( d ) ) }; } ),
		x_max
	};
	
	return '<svg id="graph"></svg>' +
	'<div class="detailed-select">' +
		'Bin Size : <select onchange="MIA.content.views.score_distribution.set_bin_size( this.value );">' +
			this.bin_sizes.map(function( val ){
				return '<option ' + ( val == this.bin_size ? 'selected' : '' ) + '>' + val + '</option>';
			}, this).join('') +
		'</select>' +
	'</div>' +
	MIA.content.get_display_individual_category_html( this, self );
};
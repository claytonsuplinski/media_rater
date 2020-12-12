MIA.content.views.score_distribution = {
	bin_size  : 1,
	bin_sizes : [ 0.5, 1, 2, 5, 10, 20, 50 ],
};

MIA.content.views.score_distribution.set_bin_size = function( val ){
	this.bin_size = val;
	this.self.draw();
};

MIA.content.views.score_distribution.get_content = function( self, p ){
	var _this = this;
	this.self = self;
	
	var p = p || {};
	
	self.graphs.histogram = {
		bins : 100 / this.bin_size,
		data : self.data.map(function( d ){ return { name : d.name, val : Number( d.total_rating ) }; } ),
	};
	
	return '<svg id="graph"></svg>' +
	'<div class="histogram-select">' +
		'Bin Size : ' +
		'<select onchange="MIA.content.views.score_distribution.set_bin_size( this.value );">' +
			this.bin_sizes.map(function( val ){
				return '<option ' + ( val == _this.bin_size ? 'selected' : '' ) + '>' + val + '</option>';
			}).join('') +
		'</select>' +
	'</div>';
};
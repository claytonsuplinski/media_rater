MIA.content.views.versus = {};

MIA.content.views.versus.get_content = function( self, p ){
	var p = p || {};
	
	var data = self.data.slice();
	
	var item_1 = data[ self.versus_indices.left  ];
	var item_2 = data[ self.versus_indices.right ];
	
	var get_select_html = function( side ){
		return '<div class="versus-select">' +
			'<select onchange="MIA.content.set_versus_item( this.value, \'' + side + '\' );">' +
				data.sort( (a,b) => ( a.name > b.name ? 1 : -1 ) ).map(function( item ){
					return '<option value="' + item.index + '" ' + ( item.index == self.versus_indices[ side ] ? 'selected' : '' ) + '>' +
						item.name +
					'</option>';
				}).join('') +
			'</select>' +
		'</div>';
	};
	
	var get_item_html = function( item, params ){
		var params = params || {};
		return '<div class="item no-highlight" style="background-image:url(' + MIA.functions.get_image(MIA.content.name, item.name) + ');">'+
			'<div class="rating">#' + item.rank + '</div>'+
			'<div class="stars">' + item.total_rating + ' <i class="fa fa-star '+ MIA.functions.get_rank_class( item.rank ) + '"></i></div>'+
			'<div class="name">' + item.name + (item.year ? ' (' + item.year + ')' : '') + '</div>'+
			get_select_html( params.side || 'left' ) +
		'</div>';
	};
	
	var get_versus_rating = function( item, params ){
		var params = params || {};
		return '<div class="item versus-rating ' + ( params.side || 'left' ) + '">' +
			'<div class="full-rating-static" style="display:block;">'+
				'<table>'+
					Object.keys(item.ratings).map(function(rating_name){
						var rating = item.ratings[rating_name];
						return '<tr>'+
							'<td class="rating-value">' + 
								rating + ' / ' + p.max_stars_per_category + 
								' <i class="fa fa-star" style="color:'+MIA.functions.get_rating_color(rating)+';"></i>'+
							'</td>' +
						'</tr>';
					}).join('')+
				'</table>'+
			'</div>' +
		'</div>';
	};

	return '<div class="versus-container">' +
		get_item_html(     item_1 ) +
		get_versus_rating( item_1 ) +
		'<div class="item versus-comparison">' +
			'<div class="full-rating-static" style="display:block;">'+
				'<table>'+
					Object.keys( item_1.ratings ).map(function( rating_name ){
						var rating = item_1.ratings[ rating_name ];
						var diff   = item_1.ratings[ rating_name ] - item_2.ratings[ rating_name ];
						var color  = '';
						return '<tr>'+
							'<td class="rating-name">' + 
								MIA.functions.get_rating_name( rating_name ) + 
								( diff == 0 ? '' : 
									'<div class="versus-diff ' + ( diff > 0 ? 'left' : 'right' ) + '" style="background:' + MIA.functions.get_diff_color( diff ) + ';">' + 
										Math.abs( diff ).toFixed(1) +
									'</div>'
								) +
							'</td>' + 
						'</tr>';
					}).join('')+
				'</table>'+
			'</div>' +
		'</div>' +
		get_versus_rating( item_2, { side : 'right' } ) +
		get_item_html(     item_2, { side : 'right' } ) +
	'</div>';
};
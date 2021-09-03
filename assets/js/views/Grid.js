MIA.content.views.grid = {};

MIA.content.views.grid.update_content = function( self, p ){
	$( '#view-content' ).html( this.get_content( self || MIA.content, p || this.params ) );
	this.post_draw( self || MIA.content, p || this.params );
};

MIA.content.views.grid.get_content = function( self, p ){
	var p = p || {};
	this.params = $.extend( {}, p );
	
	var data = MIA.content.search_filter( self.data.slice() );

	MIA.pages.num_pages = MIA.pages.calculate_num_pages( data );
	if( MIA.pages.curr_page > MIA.pages.num_pages ) MIA.pages.curr_page = 1;
	
	if( !self.is_showing_all ) data = MIA.pages.get_curr_entries( data );
	
	return data.map(function(item, idx){
		var rank_class = MIA.functions.get_rank_class( item.rank );
		
		var onclick = 'onclick="$(\'.full-rating\').hide();$(\'#full-rating-'+idx+'\').show();"';
		var style = 'style="background-image:url('+MIA.functions.get_image(MIA.content.name, item.name)+');"';
		
		return '<div class="item no-highlight" '+onclick+' '+style+'>'+
			'<div class="rating">#' + item.rank + '</div>'+
			'<div class="stars">' + item.total_rating + ' <i class="fa fa-star '+rank_class+'"></i></div>'+
			'<div class="name">' + item.name + (item.year ? ' (' + item.year + ')' : '') + '</div>'+
			'<div id="full-rating-'+idx+'" class="full-rating" onclick="$(\'.full-rating\').hide();event.stopPropagation();">'+
				'<table>'+
					Object.keys(item.ratings).map(function(rating_name){
						var rating = item.ratings[rating_name];
						return '<tr>'+
							'<td class="rating-name">' + MIA.functions.get_rating_name(rating_name) + '</td>' + 
							'<td class="rating-value">' + 
								rating + ' / ' + p.max_stars_per_category + 
								' <i class="fa fa-star" style="color:'+MIA.functions.get_rating_color(rating)+';"></i>'+
							'</td>' +
						'</tr>';
					}).join('')+
				'</table>'+
			'</div>'+
		'</div>';
	}).join('') +
	'<div id="pages"></div>';
};

MIA.content.views.grid.post_draw = function( self, p ){	
	MIA.pages.draw();
};
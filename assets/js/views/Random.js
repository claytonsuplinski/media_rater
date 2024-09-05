MIA.content.views.random = {};

MIA.content.views.random.get_content = function( self ){
	if( !this.filter_value ){
		var now = new Date();
		switch( now.getMonth() ){
			case  9 : this.filter_value = 'total > 45 && halloween';                break;
			case 11 : this.filter_value = 'total > 45 && christmas';                break;
			default : this.filter_value = 'total > 50 && !christmas && !halloween'; break;
		}
	}
	
	var data = MIA.content.search_filter( self.data.slice(), this.filter_value );
	
	var item = JL.functions.random_element( data );

	return '<input id="random-filter" onchange="MIA.content.views.random.filter_value = this.value;" onfocus="MIA.keyboard.disable([ \'/\', \'ESCAPE\' ]);" onblur="MIA.keyboard.enable();"></input>' +
		'<div id="random-refresh" onclick="MIA.content.draw();"><i class="fa fa-refresh"></i></div>' +
		'<br>' +
		'<div class="item no-highlight" style="background-image:url(' + MIA.functions.get_image( MIA.content.name, item.name ) + ');">'+
			'<div class="rating">#' + item.rank + '</div>'+
			'<div class="stars">' + item.total_rating + ' <i class="fa fa-star '+ MIA.functions.get_rank_class( item.rank ) + '"></i></div>'+
			'<div class="name">' + item.name + (item.year ? ' (' + item.year + ')' : '') + '</div>'+
		'</div>';
};

MIA.content.views.random.post_draw = function( self ){
	$( '#random-filter' ).val( this.filter_value );
};
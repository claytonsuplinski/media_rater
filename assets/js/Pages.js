MIA.pages = { curr_page : 1, num_pages : 1 };

MIA.pages.next_page = function( offset ){
	this.set_page( this.curr_page + offset );
};

MIA.pages.set_page = function( val ){
	this.curr_page = val;
	this.curr_page = Math.max( 1, Math.min( this.curr_page, this.num_pages ) );

	if( this.on_change ) this.on_change();
};

MIA.pages.get_button_html = function( val ){
	if( val == 'ellipsis' ) return '<div class="page-button ellipsis"><i class="fa fa-ellipsis-h"></i></div>';
	
	return '<div class="page-button number ' + ( this.curr_page == val ? 'active' : '' ) + '" onclick="MIA.pages.set_page(' + val + ');">' + val + '</div>';
};

MIA.pages.draw = function(){
	var content = '';
	
	if( this.num_pages > 1 ){	
		content += '<div onclick="MIA.pages.next_page( -1 );" class="page-button arrow"><i class="fa fa-angle-left"></i></div>';
		
		if( this.num_pages <= 7 ){
			for( var i = 1; i <= this.num_pages; i++ ) content += this.get_button_html( i );
		}
		else if( this.curr_page <= 4 ){
			for( var i = 1; i <= 5; i++ ) content += this.get_button_html( i );
			content += this.get_button_html( 'ellipsis' );
			content += this.get_button_html( this.num_pages );
		}
		else if( this.curr_page >= this.num_pages - 3 ){
			content += this.get_button_html( 1 );
			content += this.get_button_html( 'ellipsis' );
			for( var i = this.num_pages - 4; i <= this.num_pages; i++ ) content += this.get_button_html( i );
		}
		else{
			content += this.get_button_html( 1 );
			content += this.get_button_html( 'ellipsis' );
			content += this.get_button_html( this.curr_page - 1 );
			content += this.get_button_html( this.curr_page     );
			content += this.get_button_html( this.curr_page + 1 );
			content += this.get_button_html( 'ellipsis' );
			content += this.get_button_html( this.num_pages );
		}
		
		content += '<div onclick="MIA.pages.next_page(  1 );" class="page-button arrow"><i class="fa fa-angle-right"></i></div>';
	}

	$( ".pages-interface" ).html( content );
};
try{ JL = JL; } catch(e){ JL = {}; }

JL.pages = function( p ){
	this.curr_page        = p.curr_page        || 1;
	this.num_pages        = p.num_pages        || 1;
	this.entries_per_page = p.entries_per_page || 1;

	this.container = p.container;
	this.on_change = p.on_change;
};

JL.pages.prototype.calculate_num_pages = function( entries ){
	return Math.ceil( entries.length / this.entries_per_page );
};

JL.pages.prototype.get_curr_entries = function( entries ){
	return entries.slice( ( this.curr_page - 1 ) * this.entries_per_page, this.curr_page * this.entries_per_page );
};

JL.pages.prototype.next_page = function( offset ){
	this.set_page( this.curr_page + offset );
};

JL.pages.prototype.set_page = function( val ){
	this.curr_page = val;
	this.curr_page = Math.max( 1, Math.min( this.curr_page, this.num_pages ) );

	if( this.on_change ) this.on_change();
};

JL.pages.prototype.get_button_html = function( val ){
	var self = this;

	if( val == 'ellipsis' ) return '<div class="pages-page-button ellipsis"><i class="fa fa-ellipsis-h"></i></div>';
	
	var id = 'pages-page-number-' + val;
	this.onclick_events.push({ id, action : function(){ self.set_page( val ); } });
	return '<div id="' + id + '" class="pages-page-button number ' + ( this.curr_page == val ? 'active' : '' ) + '">' + val + '</div>';
};

JL.pages.prototype.draw = function(){
	var self = this;

	var content = '';

	this.onclick_events = [];
	
	if( this.num_pages > 1 ){	
		content += '<div id="pages-left-arrow" class="pages-page-button arrow"><i class="fa fa-angle-left"></i></div>';
		this.onclick_events.push({ id : 'pages-left-arrow', action : function(){ self.next_page( -1 ); } });
		
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
		
		content += '<div id="pages-right-arrow" class="pages-page-button arrow"><i class="fa fa-angle-right"></i></div>';
		this.onclick_events.push({ id : 'pages-right-arrow', action : function(){ self.next_page( 1 ); } });
	}

	$( this.container ).html( '<div class="pages-container">' + content + '</div>' );

	this.onclick_events.forEach(function( onclick ){
		$( '#' + onclick.id ).click( onclick.action );
	}, this);
};

MIA.content = { views : {} };

MIA.content.load = function(){
	this.select_view( 'Grid' );
	
	this.versus_indices = { left : 0, right : 1 };

	MIA.pages = new JL.pages({
		container        : '#pages',
		entries_per_page : 60,
		on_change        : function(){ MIA.content.draw(); }
	});

	$.ajax({
		url: './assets/data/'+MIA.content.name+'.json',
		dataType: 'json',
		success: function(data){
			MIA.content.data = data;
			MIA.content.data.forEach(function(item){
				item.total_rating = Number(Object.values(item.ratings).reduce(function(a, b){ return a + b; }).toFixed(2));
				if(item.total_rating != parseInt(item.total_rating)) item.total_rating = item.total_rating.toFixed(1);
				else{                                                item.total_rating = item.total_rating.toFixed(0); }
			});
			if( MIA.content.data[ 0 ].critic ){
				if( MIA.content.name == 'movies' ) MIA.content.data.forEach(function( item ){ item.critic *= 10; });
			
				var min_total_rating  = Math.min( ... MIA.content.data.map( x => x.total_rating ) );
				var max_total_rating  = Math.max( ... MIA.content.data.map( x => x.total_rating ) );
				var min_critic_rating = Math.min( ... MIA.content.data.map( x => x.critic ) );
				var max_critic_rating = Math.max( ... MIA.content.data.map( x => x.critic ) );
				
				var diff_total  = max_total_rating  - min_total_rating;
				var diff_critic = max_critic_rating - min_critic_rating;
				MIA.content.data.forEach(function( item ){
					item.critic_adjusted = ( 100 * ( ( item.critic       - min_critic_rating ) / diff_critic ) ).toFixed(1);
					item.total_adjusted  = ( 100 * ( ( item.total_rating - min_total_rating  ) / diff_total  ) ).toFixed(1);
					item.critic_diff     = ( item.total_adjusted - item.critic_adjusted ).toFixed(1);
				});
			}
			MIA.content.data.sort(function(a,b){ return ( Number(a.total_rating) < Number(b.total_rating) ? 1 : -1 ); });
			
			var rank = 1;
			MIA.content.data.forEach(function( item, idx ){
				if( idx ){
					var prev_item = MIA.content.data[ idx - 1 ];
					if( prev_item.total_rating != item.total_rating ) rank = idx + 1;
				}
				item.rank  = rank;
				item.index = idx;
			});
			
			// MIA.pages.num_pages = MIA.pages.calculate_num_pages( MIA.content.data );
			
			MIA.menu.set_num_entries( MIA.content.name, MIA.content.data.length );
			
			MIA.content.draw();
		}
	});
};

MIA.content.get_search_val = function(){
	return $( '#search-bar' ).val();
};

MIA.content.search_filter = function( data ){
	var search_val = this.get_search_val();
	if( search_val ){
		search_val = search_val.toLowerCase();
		data = data.filter(function( x ){
			if( x.tags ){
				if( x.tags.find( t => t.toLowerCase().includes( search_val ) ) ) return true;
			}
			return x.name.toLowerCase().includes( search_val ) || x.year == search_val;
		});
	}
	return data;
};

MIA.content.show_all = function(){
	this.is_showing_all = true;
	this.draw({ preserve_scroll : true });
};

MIA.content.select_view = function( view ){
	this.view = view;
	this.view_key = MIA.functions.get_view_key( view );
	this.curr_view = this.views[ this.view_key ];
};

MIA.content.set_view = function( view ){
	this.select_view( view );
	this.table_sort = 'Total';
	this.table_sort_reversed = false;
	this.draw();
};

MIA.content.set_table_sort = function( column ){
	this.table_sort_reversed = ( this.table_sort == column ? !this.table_sort_reversed : false );
	this.table_sort = column;
	this.draw();
};

MIA.content.set_display_individual_category = function( category ){
	if( category ) this.curr_view.display_individual_category = category;
	else    delete this.curr_view.display_individual_category;
	this.draw();
};

MIA.content.get_display_individual_category_html = function( _this, self ){
	return '<div class="detailed-select">' +
		'Category : <select onchange="MIA.content.set_display_individual_category( this.value );">' +
			'<option value="" ' + ( !_this.display_individual_category ? 'selected' : '' ) + '>Total</option>' +
			Object.keys( self.data[ 0 ].ratings ).sort( (a,b) => ( a > b ? 1 : -1 ) ).map(function( category ){
				return '<option value="' + category + '" ' + ( _this.display_individual_category == category ? 'selected' : '' ) + '>' +
					MIA.functions.capitalize( category ) +
				'</option>';
			}).join('') +
		'</select>' +
	'</div>';
};

MIA.content.set_versus_item = function( idx, side ){
	this.versus_indices[ side ] = idx;
	this.draw();
};

MIA.content.set_histogram_bin_size = function( bin_size ){
	this.draw();
};

MIA.content.post_draw_graphs = function(){
	Object.keys( this.graphs ).forEach(function( graph ){
		MIA.graph[ 'draw_' + graph ]( this.graphs[ graph ] );
	}, this);
};

MIA.content.draw = function( p ){
	var self = this;

	var p = p || {};

	p.max_stars_per_category = 10;
	if( MIA.menu.selected == 'Months' ) p.max_stars_per_category = 12
	
	var data = this.data.slice();
	
	var views = [ 'Grid', 'Table' ];
	if( this.data.length > 1                          ) views.push( 'Versus'     );
	if( this.data[ 0 ].critic                         ) views.push( 'Underrated' );
	if( this.data[ 0 ].year   || this.name == 'years' ) views.push( 'Graph'      );
	if( this.data[ 0 ].year                           ) views.push( 'Years'      );
	views.push( 'Score Distribution' );
	
	this.graphs = {};

	$("#content").html(
		'<div id="mobile-header" class="hidden-md hidden-lg">'+
			'<div id="menu-toggle"><i class="fa fa-bars" onclick="MIA.menu.show();"></i></div>'+
			'<div id="mobile-header-label">' + MIA.menu.selected + '</div>'+
		'</div>' + 
		'<div id="view-selector">' + 
			'<select onchange="MIA.content.set_view( this.value );">' + 
				views.map(function( view ){
					return '<option value="' + view + '" ' + ( view == this.view ? 'selected' : '' ) + '>' + view + ' View</option>';
				}, this).join('') +
			'</select>' +
		'</div>' +
		( !this.curr_view.on_search ? '' : 
			'<input id="search-bar" onkeyup="MIA.content.curr_view.on_search();" placeholder="&#xf002;  Search" ' + 
				'value="' + ( $( '#search-bar' ).val() || '' ) + '"></input>'
		) +
		'<div id="view-content">' +
			this.curr_view.get_content( this, p ) +
		'</div>'
	);
	setTimeout(function(){ $("#content").focus(); }, 1);  // Need the timeout here, otherwise it won't run synchronously.
	if( !p.preserve_scroll ) $("#content").scrollTop(0);
	
	this.post_draw_graphs();
	
	if( this.curr_view.post_draw ) this.curr_view.post_draw( this, p );
	
	$( ".full-rating,#view-selector,select" ).click(function(e) {
	   $(".full-rating").hide();
	   e.stopPropagation();
	});
};
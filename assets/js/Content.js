MIA.content = { views : {} };

MIA.content.select = function( option ){
	this.selected = option;
	this.name = option.toLowerCase().split(' ').join('_');
	this.load();
};

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
				item.properties = {};
			});
			
			// MIA.pages.num_pages = MIA.pages.calculate_num_pages( MIA.content.data );
			
			MIA.content.load_properties(function(){ MIA.content.draw(); });
		}
	});
};

MIA.content.load_properties = function( callback ){
	if( this.has_properties() ){
		var self = this;
		$.ajax({
			url: './assets/data/properties/' + MIA.content.name + '.json',
			dataType: 'json',
			success: function(data){
				MIA.content.data.forEach(function( item ){
					Object.keys( data ).forEach(function( property_name ){
						var property = data[ property_name ];
						property.forEach(function( group ){
							var add_property = (
								( group.includes && group.includes.find( entry => item.name.includes( entry ) ) ) ||
								( group.exact    && group.exact.find(    entry => item.name == entry          ) ) 
							);
							if( add_property ){
								if( !item.properties[ property_name ] ) item.properties[ property_name ] = [];
								item.properties[ property_name ].push( group.value.toLowerCase() );
							}
						});
					});
				});

				if( callback ) callback();
			}
		});
	}
	else if( callback ) callback();
};

MIA.content.get_search_val = function(){
	return $( '#search-bar' ).val();
};

MIA.content.has_properties = function(){
	return MIA.config.pages_with_properties.find( x => x.toLowerCase() == MIA.content.name );
};

MIA.content.search_filter = function( data ){
	var search_val = this.get_search_val();
	if( search_val ){
		search_val = search_val.toLowerCase();
		data = data.filter(function( x ){
			if( x.properties ){
				if( Object.keys( x.properties ).find( prop => x.properties[ prop ].find( v => v.includes( search_val ) ) ) ) return true;
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

	p.max_stars_per_category = MIA.config.max_stars[ this.selected ] || 10;
	
	var data = this.data.slice();
	
	this.view_names = [ 'Grid', 'Table' ];
	if( this.data.length > 1                          ) this.view_names.push( 'Versus'     );
	if( this.data[ 0 ].critic                         ) this.view_names.push( 'Underrated' );
	if( this.data[ 0 ].year   || this.name == 'years' ) this.view_names.push( 'Graph'      );
	if( this.data[ 0 ].year                           ) this.view_names.push( 'Years'      );
	this.view_names.push( 'Score Distribution' );
	
	this.graphs = {};

	$("#content").html(
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

	MIA.navbar = new JL.navbar({
		title          : '<div class="logo"><img src="./assets/img/logo.png"/></div> Media Rater',
		dropdown       : 'click',
		not_responsive : true,
		options        : [
			{
				options    : MIA.config.menu_options.map(function( option ){
					return {
						name     : option,
						selected : ( option == self.selected )
					};
				}),
				attributes : {
					id       : 'pages-dropdown',
					onchange : 'MIA.hashlink.update( this.value );',
				}
			},
			{
				options    : MIA.content.view_names.map(function( option ){
					return {
						name     : option + ' View',
						value    : option,
						selected : ( option == self.view )
					};
				}),
				attributes : {
					id       : 'views-dropdown',
					onchange : 'MIA.content.set_view( this.value );',
				}
			},
			{
				search     : true,
				attributes : {
					id          : 'search-bar',
					onkeyup     : 'MIA.content.curr_view.on_search();',
					placeholder : '&#xf002;  Search',
					value       : $( '#search-bar' ).val() || '',
				}
			},
		]
	});
	$( "#navbar" ).append( '<span class="count">' + MIA.content.data.length + '</span>' );
};
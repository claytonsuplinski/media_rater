MIA.content = { num_default : 60 };

MIA.content.load = function(){
	MIA.content.view = 'Grid';

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
			MIA.content.data.sort(function(a,b){ return ( Number(a.total_rating) < Number(b.total_rating) ? 1 : -1 ); });
			MIA.content.draw();
		}
	});
};

MIA.content.show_all = function(){
	this.is_showing_all = true;
	this.draw({ preserve_scroll : true });
};

MIA.content.set_view = function( view ){
	this.view = view;
	this.table_sort = 'Total';
	this.table_sort_reversed = false;
	this.draw();
};

MIA.content.set_table_sort = function( column ){
	if( [ 'Rank' ].indexOf( column ) == -1 ){
		this.table_sort_reversed = ( this.table_sort == column ? !this.table_sort_reversed : false );
		this.table_sort = column;
		this.draw();
	}
};

MIA.content.draw = function( p ){
	var p = p || {};

	var max_stars_per_category = 10;
	if( MIA.menu.selected == 'Months' ) max_stars_per_category = 12;
	
	var data = this.data.slice();
	
	var views = [ 'Grid', 'Table' ];
	if( data[ 0 ].year ) views.push( 'Graph' );
	
	var content = '';
	switch( this.view ){
		case 'Grid':
			if( !this.is_showing_all ) data = data.slice( 0, this.num_default );
			
			content = data.map(function(item, idx){
				var rank = idx+1;
				
				var rank_class = MIA.functions.get_rank_class(rank);
				
				var onclick = 'onclick="$(\'.full-rating\').hide();$(\'#full-rating-'+idx+'\').show();"';
				var style = 'style="background-image:url('+MIA.functions.get_image(MIA.content.name, item.name)+');"';
				
				return '<div class="item no-highlight" '+onclick+' '+style+'>'+
					'<div class="rating">#' + rank + '</div>'+
					'<div class="stars">' + item.total_rating + ' <i class="fa fa-star '+rank_class+'"></i></div>'+
					'<div class="name">' + item.name + (item.year ? ' (' + item.year + ')' : '') + '</div>'+
					'<div id="full-rating-'+idx+'" class="full-rating">'+
						'<table>'+
							Object.keys(item.ratings).map(function(rating_name){
								var rating = item.ratings[rating_name];
								return '<tr>'+
									'<td class="rating-name">' + MIA.functions.get_rating_name(rating_name) + '</td>' + 
									'<td class="rating-value">' + 
										rating + ' / ' + max_stars_per_category + 
										' <i class="fa fa-star" style="color:'+MIA.functions.get_rating_color(rating)+';"></i>'+
									'</td>' +
								'</tr>';
							}).join('')+
						'</table>'+
					'</div>'+
				'</div>';
			}).join('') +
			( this.data.length > this.num_default && !this.is_showing_all ? '<div class="show-all-button" onclick="MIA.content.show_all();">SHOW ALL ENTRIES</div>' : '' );
			break;
		case 'Table':
			var headers = [ 'Rank', 'Name' ]
			if( data[ 0 ].year ) headers.push( 'Year' );
			headers = headers.concat( Object.keys( data[ 0 ].ratings ), [ 'Total' ] );
			
			var sorted_idx = headers.indexOf( this.table_sort );
			var sorted_dir = ( this.table_sort_reversed ? -1 : 1 );
			switch( this.table_sort ){
				case 'Total':
					data = data.sort( (a,b) => sorted_dir * ( Number( a.total_rating ) > Number( b.total_rating ) ? -1 : 1 ) );
					break;
				case 'Name':
					data = data.sort( (a,b) => sorted_dir * ( a.name > b.name ? -1 : 1 ) );
					break;
				case 'Year':
					data = data.sort( (a,b) => sorted_dir * ( a.year > b.year ? -1 : 1 ) );
					break;
				default:
					data = data.sort( (a,b) => sorted_dir * ( a.ratings[ this.table_sort ] > b.ratings[ this.table_sort ] ? -1 : 1 ) );
					break;
			}
			
			content = '<table class="ranking-table">' + 
				'<tr>' + 
					headers.map(function( h, i ){
						return '<th class="' + ( sorted_idx == i ? 'sorted' : '' ) + ' no-highlight" onclick="MIA.content.set_table_sort(\'' + h + '\');">' + 
							MIA.functions.capitalize( h ) + 
						'</th>';
					}).join('') + 
				'</tr>' +
				data.map(function( item, idx ){
					return '<tr>' +
						headers.map(function( header, header_idx ){
							var td_classes = [];
							if( header_idx == sorted_idx ) td_classes.push( 'sorted' );
							td_classes = td_classes.join(' ');
						
							if( header == 'Rank'  ) return '<td class="' + td_classes + ' rank" >' + ( idx + 1 )                              + '</td>';
							if( header == 'Name'  ) return '<td class="' + td_classes + ' name" >' + item.name                                + '</td>';
							if( header == 'Year'  ) return '<td class="' + td_classes + ' year" >' + item.year                                + '</td>';
							if( header == 'Total' ) return '<td class="' + td_classes + ' total">' + Number( item.total_rating ).toFixed( 1 ) + '</td>';
							return '<td class="' + td_classes + ' ranking">' + Number( item.ratings[ header ] ).toFixed( 1 ) + '</td>';
						}).join('') +
					'</tr>';
				}).join('') +
			'</table>';
			break;
		case 'Graph':
			content = 'Graph';
			break;
	}

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
		content
	);
	$("#content").focus();
	if( !p.preserve_scroll ) $("#content").scrollTop(0);
	
	$( ".full-rating,#view-selector" ).click(function(e) {
	   $(".full-rating").hide();
	   e.stopPropagation();
	});
};
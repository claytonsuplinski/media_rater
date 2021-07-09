MIA.content.views.underrated = {};

MIA.content.views.underrated.on_search = function(){ this.update_content(); };

MIA.content.views.underrated.update_content = function( self, p ){
	$( '#view-content' ).html( this.get_content( self || MIA.content, p || this.params ) );
};

MIA.content.views.underrated.get_content = function( self, p ){
	var p = p || {};
	this.params = $.extend( {}, p );
	
	var data = MIA.content.search_filter( self.data.slice() );
	
	var headers = [ 'Rank', 'Name', 'Year', 'My Score', 'Critic Score', 'My Adjusted', 'Critic Adjusted', 'Underrated Score' ]
	
	if( headers.indexOf( self.table_sort ) == -1 ) self.table_sort = headers[ headers.length - 1 ];
	
	var sorted_idx = headers.indexOf( self.table_sort );
	var sorted_dir = ( self.table_sort_reversed ? -1 : 1 );
	
	switch( self.table_sort ){
		case 'Rank':
			data = data.sort( (a,b) => sorted_dir * ( a.rank > b.rank ? -1 : 1 ) );
			break;
		case 'Name':
			data = data.sort( (a,b) => sorted_dir * ( a.name > b.name ? -1 : 1 ) );
			break;
		case 'Year':
			data = data.sort( (a,b) => sorted_dir * ( a.year > b.year ? -1 : 1 ) );
			break;
		case 'My Score'        : data = data.sort( (a,b) => sorted_dir * ( Number( a.total_rating    ) > Number( b.total_rating    ) ? -1 : 1 ) ); break;
		case 'Critic Score'    : data = data.sort( (a,b) => sorted_dir * ( Number( a.critic          ) > Number( b.critic          ) ? -1 : 1 ) ); break;
		case 'My Adjusted'     : data = data.sort( (a,b) => sorted_dir * ( Number( a.total_adjusted  ) > Number( b.total_adjusted  ) ? -1 : 1 ) ); break;
		case 'Critic Adjusted' : data = data.sort( (a,b) => sorted_dir * ( Number( a.critic_adjusted ) > Number( b.critic_adjusted ) ? -1 : 1 ) ); break;
		default                : data = data.sort( (a,b) => sorted_dir * ( Number( a.critic_diff     ) > Number( b.critic_diff     ) ? -1 : 1 ) ); break;
	}
	
	return '<table class="ranking-table">' + 
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
				
					if( header == 'Rank'             ) return '<td class="' + td_classes + ' rank"   >' + item.rank            + '</td>';
					if( header == 'Name'             ) return '<td class="' + td_classes + ' name"   >' + item.name            + '</td>';
					if( header == 'Year'             ) return '<td class="' + td_classes + ' year"   >' + item.year            + '</td>';
					if( header == 'My Score'         ) return '<td class="' + td_classes + ' ranking">' + item.total_rating    + '</td>';
					if( header == 'Critic Score'     ) return '<td class="' + td_classes + ' ranking">' + item.critic          + '</td>';
					if( header == 'My Adjusted'      ) return '<td class="' + td_classes + ' ranking">' + item.total_adjusted  + '</td>';
					if( header == 'Critic Adjusted'  ) return '<td class="' + td_classes + ' ranking">' + item.critic_adjusted + '</td>';
					if( header == 'Underrated Score' ){
						var color_mag = Math.abs( 3 * item.critic_diff );
						var color = 'rgb(' + 
							( item.critic_diff > 0 ? 
								[ 30, 30 + color_mag, 30 ] : 
								[ 30 + color_mag, 30, 30 ]
							).join(',') + ')';
						return '<td class="ranking" style="background:' + color + ';">' + item.critic_diff + '</td>';
					}
					return '<td></td>';
				}).join('') +
			'</tr>';
		}).join('') +
	'</table>';
};
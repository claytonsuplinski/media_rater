MIA.content.views.table = {};

MIA.content.views.table.get_content = function( self, p ){
	var p = p || {};
	
	var data = self.data.slice();
	
	var headers = [ 'Rank', 'Name' ];
	if( data[ 0 ].year ) headers.push( 'Year' );
	headers = headers.concat( Object.keys( data[ 0 ].ratings ), [ 'Total' ] );
	
	var sorted_idx = headers.indexOf( self.table_sort );
	var sorted_dir = ( self.table_sort_reversed ? -1 : 1 );
	switch( self.table_sort ){
		case 'Rank':
			data = data.sort( (a,b) => sorted_dir * ( a.rank > b.rank ? -1 : 1 ) );
			break;
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
			data = data.sort( (a,b) => sorted_dir * ( a.ratings[ self.table_sort ] > b.ratings[ self.table_sort ] ? -1 : 1 ) );
			break;
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
				
					if( header == 'Rank'  ) return '<td class="' + td_classes + ' rank" >' + item.rank                                + '</td>';
					if( header == 'Name'  ) return '<td class="' + td_classes + ' name" >' + item.name                                + '</td>';
					if( header == 'Year'  ) return '<td class="' + td_classes + ' year" >' + item.year                                + '</td>';
					if( header == 'Total' ){
						var color_mag = 3.5 * Math.abs( item.total_rating - 50 );
						var color = 'rgb(' + 
							( item.total_rating > 50 ? 
								[ 30, 30 + color_mag, 30 ] : 
								[ 30 + color_mag, 30, 30 ]
							).join(',') + ')';
						return '<td class="total" style="background:' + color + ';">' + Number( item.total_rating ).toFixed( 1 ) + '</td>';
					}
					return '<td class="' + td_classes + ' ranking">' + Number( item.ratings[ header ] ).toFixed( 1 ) + '</td>';
				}).join('') +
			'</tr>';
		}).join('') +
	'</table>';
};
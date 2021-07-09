MIA.content.views.table = {};

MIA.content.views.table.get_table_cell_color = function( value, p ){
	var p = p || {};
	
	var min = ( p.min !== undefined ? p.min :   0 );
	var max = ( p.max !== undefined ? p.max : 100 );
	var mid = ( max + min ) / 2;

	var color_mag = 350 * Math.abs( Math.min( value, max ) - mid ) / (max-min);
	return 'rgb(' + 
		( value > mid ? 
			[ 30, 30 + color_mag, 30 ] : 
			[ 30 + color_mag, 30, 30 ]
		).join(',') +
	')';
};

MIA.content.views.table.get_table_content = function( self, headers, data, p ){
	var p = p || {};

	var sorted_idx = headers.indexOf( self.table_sort );
	var sorted_dir = ( self.table_sort_reversed ? -1 : 1 );
	switch( self.table_sort ){
		case 'Delta':
			data = data.sort( (a,b) => sorted_dir * ( a.delta > b.delta ? -1 : 1 ) );
			break;
		case 'Name':
			data = data.sort( (a,b) => sorted_dir * ( a.name > b.name ? -1 : 1 ) );
			break;
		case 'Rank':
			data = data.sort( (a,b) => sorted_dir * ( a.rank > b.rank ? -1 : 1 ) );
			break;
		case 'Score':
			data = data.sort( (a,b) => sorted_dir * ( Number( a.score ) > Number( b.score ) ? -1 : 1 ) );
			break;
		case 'Total':
			data = data.sort( (a,b) => sorted_dir * ( Number( a.total_rating ) > Number( b.total_rating ) ? -1 : 1 ) );
			break;
		case 'Year':
			data = data.sort( (a,b) => sorted_dir * ( a.year > b.year ? -1 : 1 ) );
			break;
		default:
			data = data.sort( (a,b) => sorted_dir * ( a.ratings[ self.table_sort ] > b.ratings[ self.table_sort ] ? -1 : 1 ) );
			break;
	}
	
	return '<table class="ranking-table fixed-table">' + 
		'<tr>' + 
			headers.map(function( h, i ){
				var label = MIA.functions.capitalize( h );
				return '<th class="' + ( sorted_idx == i ? 'sorted' : '' ) + ' no-highlight ' + MIA.functions.get_view_key( h ) + '" ' + 
						'onclick="MIA.content.set_table_sort(\'' + h + '\');" title="' + label + '">' + 
					label + 
				'</th>';
			}).join('') + 
		'</tr>' +
		data.map(function( item, idx ){
			return '<tr>' +
				headers.map(function( header, header_idx ){
					var td_classes = [];
					if( header_idx == sorted_idx ) td_classes.push( 'sorted' );
					td_classes = td_classes.join(' ');
				
					if( header == 'Rank'  ) return '<td class="' + td_classes + ' rank" >' + item.rank + '</td>';
					if( header == 'Name'  ) return '<td class="' + td_classes + ' name" >' + item.name + '</td>';
					if( header == 'Year'  ) return '<td class="' + td_classes + ' year" >' + item.year + '</td>';
					if( header == 'Delta' ){
						var color = MIA.content.views.table.get_table_cell_color( item.delta, { min : -50, max : 50 } );
						return '<td style="background:' + color + ';">' + ( item.delta > 0 ? '+' : '' ) + 
							item.delta.toFixed( 1 ) + 
						'</td>';
					}
					if( header == 'Total' ){
						var color = MIA.content.views.table.get_table_cell_color( item.total_rating );
						return '<td class="total" style="background:' + color + ';">' + Number( item.total_rating ).toFixed( item.total_rating >= 100 ? 0 : 1 ) + '</td>';
					}
					if( header == 'Score' ){
						var color = MIA.content.views.table.get_table_cell_color( item.score, { min : p.score_min, max : p.score_max } );
						return '<td class="total" style="background:' + color + ';">' + Number( item.score ).toFixed( 1 ) + '</td>';
					}
					return '<td class="' + td_classes + ' ranking">' + Number( item.ratings[ header ] ).toFixed( 1 ) + '</td>';
				}).join('') +
			'</tr>';
		}).join('') +
	'</table>';
};

MIA.content.views.table.get_content = function( self, p ){
	var p = p || {};
	
	var data = self.data.slice();
	
	var headers = [ 'Rank', 'Name' ];
	if( data[ 0 ].year ) headers.push( 'Year' );
	headers = headers.concat( Object.keys( data[ 0 ].ratings ), [ 'Total' ] );
	
	return this.get_table_content( self, headers, data );
};
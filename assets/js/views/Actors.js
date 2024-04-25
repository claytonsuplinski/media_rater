MIA.content.views.actors = {};

MIA.content.views.actors.init_content = function(){
	if( !this.actors ){
		this.actors = MIA.content.properties.actor.slice();

		this.actors.forEach(function( actor ){
			actor.entries = [];
			var name = actor.value.toLowerCase();
			MIA.content.data.forEach(function( entry ){
				try{
					if( entry.properties.actor.includes( name ) ) actor.entries.push( entry );
				} catch(e){}
			});

			actor.points  = 0;
			actor.average = 0;
			actor.entries.forEach(function( entry ){
				if( entry.total_rating > 50 ) actor.points += entry.total_rating - 50;
				actor.average += entry.total_rating / actor.entries.length;
			});
		});

		this.actors = this.actors.sort( (a,b) => ( a.points > b.points ? -1 : 1 ) );
		var curr_rank = 0;
		var curr_score = -1;
		this.actors.forEach(function( actor, idx ){
			if( actor.points != curr_score ){
				curr_rank = ( idx + 1 );
				curr_score = actor.points;
			}
			actor.rank = curr_rank;
			actor.entries = actor.entries.sort( (a,b) => ( a.total_rating > b.total_rating ? 1 : -1 ) );
			actor.best  = actor.entries[ actor.entries.length - 1 ];
			actor.worst = actor.entries[ 0 ];
		});
	}
};

MIA.content.views.actors.update_content = function( self, p ){
	$( '#view-content' ).html( this.get_content( self || MIA.content, p || this.params ) );
};

MIA.content.views.actors.get_table_cell_color = function( value, p ){
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

MIA.content.views.actors.get_table_content = function( self, headers, data, p ){
	var p = p || {};

	var sorted_idx = headers.indexOf( self.table_sort );
	var sorted_dir = ( self.table_sort_reversed ? -1 : 1 );
	switch( self.table_sort ){
		case 'Name':
			data = data.sort( (a,b) => sorted_dir * ( a.value > b.value ? -1 : 1 ) );
			break;
		case 'Movies':
			data = data.sort( (a,b) => sorted_dir * ( a.entries.length > b.entries.length ? -1 : 1 ) );
			break;
		case 'Rank':
			data = data.sort( (a,b) => sorted_dir * ( a.rank > b.rank ? -1 : 1 ) );
			break;
		case 'Best':
			data = data.sort( (a,b) => sorted_dir * ( a.best.total_rating > b.best.total_rating ? -1 : 1 ) );
			break;
		case 'Worst':
			data = data.sort( (a,b) => sorted_dir * ( a.worst.total_rating > b.worst.total_rating ? -1 : 1 ) );
			break;
		default:
			data = data.sort( (a,b) => sorted_dir * ( a[ self.table_sort.toLowerCase() ] > b[ self.table_sort.toLowerCase() ] ? -1 : 1 ) );
			break;
	}

	if( p.totals ) data.push( p.totals );
	
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
				
					if( header == 'Rank'    ) return '<td class="' + td_classes + ' rank"  >' + item.rank               + '</td>';
					if( header == 'Name'    ) return '<td class="' + td_classes + ' name"  >' + item.value              + '</td>';
					if( header == 'Movies'  ) return '<td class="' + td_classes + ' total" >' + item.entries.length     + '</td>';
					if( header == 'Average' ) return '<td class="' + td_classes + ' total" >' + item.average.toFixed(1) + '</td>';
					if( header == 'Points'  ) return '<td class="' + td_classes + ' total" >' + item.points.toFixed(1)  + '</td>';
					if( header == 'Best'    ) return '<td class="' + td_classes + '      " >' + item.best.name          + '</td>';
					if( header == 'Worst'   ) return '<td class="' + td_classes + '      " >' + item.worst.name         + '</td>';
					return '<td class="' + td_classes + ' ranking">' + Number( item[ header ] ).toFixed( 1 ) + '</td>';
				}).join('') +
			'</tr>';
		}).join('') +
	'</table>';
};

MIA.content.views.actors.get_content = function( self, p ){
	var p = p || {};
	this.params = $.extend( {}, p );

	if( self.table_sort == 'Total' ) self.table_sort = 'Points';

	this.init_content();
	
	var headers = [ 'Rank', 'Name', 'Best', 'Worst', 'Movies', 'Average', 'Points' ];
	
	return this.get_table_content( self, headers, this.actors );
};
MIA.keyboard = new JL.keyboard(
	[
		{ name :  'LEFT ARROW', down : function(){ MIA.pages.next_page( -1 ); } },
		{ name : 'RIGHT ARROW', down : function(){ MIA.pages.next_page(  1 ); } },
		{ name :      'ESCAPE', down : function(){ $( 'input' ).blur(); $( "#content"    ).focus(); } },
		{ name :           'R', down : function(){ if( [ 'Random' ].includes( MIA.hashlink.params.view.value ) ){ MIA.content.draw(); } } },
		{ name :           '/',
			down : function(){
				if( [ 'Random' ].includes( MIA.hashlink.params.view.value ) ){ $( "#random-filter" ).focus(); }
				else{ $( "#search-bar" ).focus(); }
			},
			up : function(){
				if( [ 'Random' ].includes( MIA.hashlink.params.view.value ) ){ $( "#random-filter" ).val( MIA.content.views.random.filter_value ); }
				else{ $( "#search-bar" ).val( '' ); }
			}
		},
	]
);
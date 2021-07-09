MIA.keyboard = new JL.keyboard(
	[
		{ name :  'LEFT ARROW', down : function(){ MIA.pages.next_page( -1 ); } },
		{ name : 'RIGHT ARROW', down : function(){ MIA.pages.next_page(  1 ); } },
		{ name :           '/', down : function(){ $( "#search-bar" ).focus(); }, up : function(){ $( "#search-bar" ).val( '' ); } },
		{ name :      'ESCAPE', down : function(){ $( "#content"    ).focus(); } },
	]
);
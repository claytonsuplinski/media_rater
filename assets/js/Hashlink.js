MIA.hashlink = new JL.hashlinks({
	page : {},
	view : {},
});

MIA.hashlink.on_start = function(){
	var page = this.params.page.value;

	document.title = MIA.config.document_title + ( page ? ' - ' + page : '' );

	var menu_index = MIA.config.menu_options.indexOf( page );
	if( menu_index == -1 ) menu_index = 0;

	MIA.content.select( MIA.config.menu_options[ menu_index ] );
};

window.onhashchange = function(){ MIA.hashlink.start(); };
window.onload       = function(){ MIA.hashlink.start(); };
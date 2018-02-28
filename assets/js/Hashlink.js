MIA.hashlink = { value : '' };

MIA.hashlink.check_url = function(){
	this.value = decodeURI( location.hash.substring(1) );
};

MIA.hashlink.write = function(){
	var output = encodeURI( this.value );

	if(output == ""){
		history.pushState("", document.title, window.location.pathname);
	}
	else{
		location.hash = output;
	}
};

MIA.hashlink.update = function(value){
	this.check_url();
	this.value = value;
	this.write();
};

MIA.hashlink.clear = function(){
	this.check_url();
	this.value = '';
	this.write();
};

MIA.hashlink.start = function(){
	MIA.hashlink.check_url();

	document.title = MIA.config.document_title + (MIA.hashlink.value ? ' - ' + MIA.hashlink.value : '');

	var menu_index = MIA.config.menu_options.indexOf(MIA.hashlink.value);
	if(menu_index == -1) menu_index = 0;
	
	MIA.menu.select( MIA.config.menu_options[menu_index] );
};

window.onhashchange = MIA.hashlink.start;
window.onload       = MIA.hashlink.start;

MIA.menu = {};

MIA.menu.hide = function(){
	$("#menu").addClass('collapsed');
	$("#content").addClass('expanded');
};

MIA.menu.show = function(){
	$("#menu").removeClass('collapsed');
	$("#content").removeClass('expanded');
};

MIA.menu.select = function(option){
	MIA.menu.selected = option;
	MIA.content.name = option.toLowerCase().split(' ').join('_');
	MIA.menu.draw();
	MIA.content.load();
};

MIA.menu.draw = function(){
	$("#menu").html(
		'<div class="logo"><img src="./assets/img/logo.png"/></div>'+
		'<div class="title">Media Rater<hr></div>'+
		'<div class="options">'+
			MIA.config.menu_options.map(function(option){
				var onclick = 'onclick="MIA.menu.select(\''+option+'\');"';
				return '<div '+onclick+' class="option '+(option == MIA.menu.selected ? 'active' : '')+'">'+
					option+
				'</div>';
			}).join('')+
		'</div>'
	);
};
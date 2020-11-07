MIA.functions = {};

MIA.functions.get_image = function(dir, name){
	return './assets/img/'+dir+'/'+name.toLowerCase().replace(/[.,\/#!$%?\^&\*;:{}=\-\[\]_`~()\']/g, "").replace(/ /g, '')+'.jpg';
};

MIA.functions.get_rating_name = function(name){
	return name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

MIA.functions.get_rank_class = function(rank){
	switch(rank){
		case 1: return 'gold';
		case 2: return 'silver';
		case 3: return 'bronze';
	};
	return '';
};

MIA.functions.get_rating_color = function(rating){
	var r = 0, g = 0, b = 50;
	if(rating < 5){
		var a = 1 - (5 - rating) / 5;
		r = 255;
		g = a * 255;
	}
	else{
		var a = 1 - (rating - 5) / 5;
		r = a * 255;
		g = 255;
	}
	return 'rgb(' + [r,g,b].join(', ') + ')';
};

MIA.functions.get_diff_color = function( diff ){
	var r = 30, g = 30, b = 30;
	if( diff < 0 ){
		r += 50;
		r += -10 * diff;
	}
	else{
		g += 50;
		g +=  10 * diff;
	}
	return 'rgb(' + [r,g,b].join(', ') + ')';
};

MIA.functions.capitalize = function(str){
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
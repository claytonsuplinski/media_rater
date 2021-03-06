MIA.content = {};

MIA.content.load = function(){
	$.ajax({
		url: './assets/data/'+MIA.content.name+'.json',
		dataType: 'json',
		success: function(data){
			MIA.content.data = data;
			MIA.content.data.forEach(function(item){
				item.total_rating = Object.values(item.ratings).reduce(function(a, b){ return a + b; });
				if(item.total_rating != parseInt(item.total_rating, 10 )) item.total_rating = Number(item.total_rating).toFixed(1);
			});
			MIA.content.data.sort(function(a,b){ return a.total_rating < b.total_rating; });
			MIA.content.draw();
		}
	});
};

MIA.content.draw = function(){
	$("#content").css('background', '#111');
	$("#content").html(
		MIA.content.data.map(function(item, idx){
			var rank = idx+1;
			
			var rank_class = MIA.functions.get_rank_class(rank);
			
			var onclick = 'onclick="$(\'.full-rating\').hide();$(\'#full-rating-'+idx+'\').show();"';
			var style = 'style="background-image:url('+MIA.functions.get_image(MIA.content.name, item.name)+');"';
			
			return '<div class="item no-highlight" '+onclick+' '+style+'>'+
				'<div class="rating">#' + rank + '</div>'+
				'<div class="stars">' + item.total_rating + ' <i class="fa fa-star '+rank_class+'"></i></div>'+
				'<div class="name">' + item.name + ' (' + item.year + ')</div>'+
				'<div id="full-rating-'+idx+'" class="full-rating">'+
					'<table>'+
						Object.keys(item.ratings).map(function(rating_name){
							var rating = item.ratings[rating_name];
							return '<tr>'+
								'<td class="rating-name">' + MIA.functions.get_rating_name(rating_name) + '</td>' + 
								'<td class="rating-value">' + 
									rating + ' / 10 <i class="fa fa-star" style="color:'+MIA.functions.get_rating_color(rating)+';"></i>'+
								'</td>' +
							'</tr>';
						}).join('')+
					'</table>'+
				'</div>'+
			'</div>';
		}).join('')
	);
	$("#content").focus();
	
	$(".full-rating").click(function(e) {
	   $(".full-rating").hide();
	   e.stopPropagation();
	});
};
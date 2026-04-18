MIA = {};

MIA.config = {};

MIA.config.is_dev = !( window.location.href.includes( '.io/' ) );

                        MIA.config.menu_options = [ "Movies", "Video Games", "TV Episodes", ];
if( MIA.config.is_dev ) MIA.config.menu_options = [ "Movies", "Video Games", "TV Episodes", "Television", "Stadiums", "Sporting Events", "Characters", "Music Artists", "Songs", "Pokemon", "Athletes", "Restaurants", "Months", "Years" ];

MIA.config.pages_with_properties = [ "Movies", "Characters" ];

MIA.config.max_stars = {
	Months : 12,
};

MIA.config.document_title = 'Media Rater';
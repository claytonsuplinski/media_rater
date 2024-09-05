try{ JL = JL; } catch(e){ JL = {}; }

JL.hashlinks = function( params ){
	this.params = params || {};
};

JL.hashlinks.prototype.load_params = function(){
	Object.keys( this.params ).forEach(function( param_name ){
		delete this.params[ param_name ].value;
	}, this);

	location.hash.substring( 1 ).split( ';' ).map( x => x.split(':') ).forEach(function( param ){
		if( param.length > 1 ){
			var name  = param.shift();
			var value = param.join(':');
			if( this.params[ name ] ){
				this.params[ name ].value = ( [ "true", "false" ].indexOf( value ) != -1 ?
					( value == "true" ) :
					( isNaN( value ) ? decodeURI( value ) : Number( value ) )
				);
				if( this.params[ name ].hash_encode ) this.params[ name ].value = atob( value );
				if( this.params[ name ].json ) this.params[ name ].value = JSON.parse( this.params[ name ].value );
			}
		}
	}, this);
};

JL.hashlinks.prototype.get_url = function( p ){
	var p = p || {};

	var params = {};

	var param_groups = [];
	if( !p.clear ){
		var group = {};
		Object.keys( this.params ).forEach(function( param_name ){
			var value = this.params[ param_name ].value;
			if( value !== undefined ) group[ param_name ] = value;
		}, this);
		param_groups.push( group );
	}
	if( p.include ) param_groups.push( p.include );

	param_groups.forEach(function( param_group ){
		Object.keys( param_group ).forEach(function( param_name ){
			var param_value = param_group[ param_name ];
			if( param_value != undefined ) params[ param_name ] = param_value;
		});
	});

	if( p.exclude ) p.exclude.forEach(function( param_name ){ delete params[ param_name ]; });

        var output = "";

	Object.keys( params ).forEach(function( param_name ){
		var param_value = params[ param_name ];
		if( this.params[ param_name ].json        ) param_value = JSON.stringify( param_value );
		if( this.params[ param_name ].hash_encode ) param_value = btoa( param_value );
		output += param_name + ':' + encodeURI( param_value ) + ';';
	}, this);

	if( output ) output = '#' + output;

	return output;
};

JL.hashlinks.prototype.get_val = function( name ){
	if( this.params[ name ].value === undefined ) return this.params[ name ].default;
	return this.params[ name ].value;
};

JL.hashlinks.prototype.write_url = function(){
	// history[ ( this.keep_history ? 'push' : 'replace' ) + 'State' ]( "", document.title, this.get_url() ); // This line was the original implementation for handling hashlinks in CSPP GeoSphere.
	if( this.ignore_history ) history.replaceState( "", document.title, this.get_url() );
	window.location.hash = this.get_url();
};

JL.hashlinks.prototype.add = function( params ){
	this.load_params();

	Object.keys( params ).forEach(function( name ){
		if( this.params[ name ] ) this.params[ name ].value = params[ name ];
	}, this);

	this.write_url();
};

JL.hashlinks.prototype.remove = function( names ){
	this.load_params();

	if( names instanceof Array ){
		names.forEach(function( name ){
			if( this.params[ name ] ) delete this.params[ name ].value;
		}, this);
	}
	else{
		if( this.params[ names ] ) delete this.params[ names ].value;
	}

	this.write_url();
};

JL.hashlinks.prototype.start = function(){
	this.load_params();

	if( this.on_start ) this.on_start();

	Object.keys( this.params ).forEach(function( param_name ){
		var param = this.params[ param_name ];
		if( param.select && param.value != undefined ) param.select( param.value );
	}, this);
};

try{ JL = JL; } catch(e){ JL = {}; }

JL.functions = {
	constants : {
		to_degrees : 180/Math.PI,
		to_radians : Math.PI/180,
		rand_vals  : [ 12.9898,78.233,144.7272,222.222 ],
	},
};

// --------------
// | Arithmetic |
// --------------

JL.functions.average = function( arr ){
	return arr.reduce(function( sum, a, i, ar ){
		sum += a;
		return ( i == ar.length - 1 ? ( ar.length == 0 ? 0 : sum / ar.length ) : sum );
	}, 0);
};

JL.functions.clamp = function( val, min, max ){
	return Math.min( Math.max( min, val ), max );
};

JL.functions.distance = function( obj_1, obj_2 ){
	var sum = 0;
	[ 'x', 'y', 'z' ].forEach(function( x ){
		if( obj_1[ x ] !== undefined ){
			var val = obj_1[ x ] - obj_2[ x ];
			sum += val * val;
		}
	});
	return Math.sqrt( sum );
};

JL.functions.distance_arrays = function( arr_1, arr_2 ){
	var sum = 0;
	for( var i = 0; i < arr_1.length; i++ ){
		var val = arr_1[ i ] - arr_2[ i ];
		sum += val * val;
	}
	return Math.sqrt( sum );
};

JL.functions.fract = function( x ){
	return x - Math.floor( x );
};

JL.functions.get_factors = function( num ){
        var factors = [];
        for( var i = 1; i <= num; i += ( num % 2 ? 2 : 1 ) ){
                if( !( num % i ) ) factors.push( [ i, num / i ] );
        }
        return factors;
};

JL.functions.greatest_common_divisor = function( num, den ){
	if( den < 0.0000001 ) return num;
	return this.greatest_common_divisor( den, Math.floor( num % den ) );
};

JL.functions.scalar_multiply = function( scalar, vector ){
        return vector.map( x => scalar * x );
};

JL.functions.dot_product = function( a, b ){
	var sum = 0;
	for( var i = 0; i < a.length; i++ ) sum += a[i] * b[i];
	return sum;
};

JL.functions.interpolate = function( v1, v2, percent ){
	return (1 - percent) * v1 + percent * v2;
};

JL.functions.interpolate_array = function( arr_1, arr_2, percent ){
	var alpha = ( 1 - percent );
	return arr_1.map(function( x, i ){
		return alpha * x + percent * arr_2[ i ];
	});
};

JL.functions.interpolate_vectors = function( v1, v2, percent, keys ){
	var keys = keys || [ 'x', 'y', 'z' ];

	var result = {};
	keys.forEach(function( k ){
		result[ k ] = this.interpolate( v1[ k ], v2[ k ], percent );
	}, this);
	return result;
};

JL.functions.calculate_triangle_normal = function( v1, v2, v3 ){
	var edge_1_x = v1[0] - v2[0];
	var edge_1_y = v1[1] - v2[1];
	var edge_1_z = v1[2] - v2[2];

	var edge_2_x = v3[0] - v2[0];
	var edge_2_y = v3[1] - v2[1];
	var edge_2_z = v3[2] - v2[2];

	return this.normalize([
		edge_1_y * edge_2_z - edge_1_z * edge_2_y,
		edge_1_z * edge_2_x - edge_1_x * edge_2_z,
		edge_1_x * edge_2_y - edge_1_y * edge_2_x,
	]);
};

JL.functions.cartesian_to_spherical = function( x, y, z ){
        var spherical = {};
        spherical.rad = Math.sqrt( x*x + y*y + z*z );
        spherical.lat = 90 - Math.acos( y / spherical.rad ) * this.constants.to_degrees;
        spherical.lon =      Math.atan2( x, z )             * this.constants.to_degrees;
        return spherical;
};

JL.functions.spherical_to_cartesian = function( lat, lon, rad ){
        var tmp_rot_x = lat * this.constants.to_radians;
        var tmp_rot_y = lon * this.constants.to_radians;
        var tmp_cos_x = Math.cos( tmp_rot_x );

        var cartesian = {};
        cartesian.x = rad * Math.sin( tmp_rot_y ) * tmp_cos_x;
        cartesian.y = rad * Math.sin( tmp_rot_x );
        cartesian.z = rad * Math.cos( tmp_rot_y ) * tmp_cos_x;

        return cartesian;
};

JL.functions.get_magnitude = function( v ){
	var sum = 0;
	v.forEach(function( x ){ sum += x * x; });
        return Math.sqrt( sum );
};

JL.functions.normalize = function( v ){
        var mag = this.get_magnitude( v );
	return v.map(function( x ){ return ( x / mag ); });
};

JL.functions.rand = function( seeds ){
	return this.fract( Math.sin( this.dot_product( seeds, this.constants.rand_vals ) ) * 43758.5453 );
};

JL.functions.seeded_random_number = function( low, high, seeds ){
	return ( high - low ) * this.rand( seeds ) + low;
};

JL.functions.random_number = function( low, high ){
	return ( high - low ) * Math.random() + low;
};

JL.functions.random_integer = function( low, high ){
	return Math.floor( this.random_number( low, high + 1 ) );
};

JL.functions.random_element = function( arr ){
	try{ return arr[ Math.floor( Math.random() * arr.length ) ]; } catch(e){}
	return false;
};

JL.functions.random_hex_digit = function(){
	return this.random_element( [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'] );
};

JL.functions.round = function( val, multiple, p ){
	var multiple = multiple || 1;
	var offset   = 0;
	var fn       = 'round';

	if( p ){
		offset = p.offset || 0;

		switch( p.dir ){
			case 'up'   : fn = 'ceil' ; break;
			case 'down' : fn = 'floor'; break;
		}
	}

	var output = ( Math[ fn ]( ( val - offset ) / multiple ) * multiple ) + offset;

	return output;
};

JL.functions.step = function( edge, x ){
	return ( x < edge ? 0 : 1 );
};

JL.functions.get_angle_between_2d = function( p ){
	var angle_1 = Math.atan2( ( p.v1[ 1 ] - p.center[ 1 ] ), ( p.v1[ 0 ] - p.center[ 0 ] ) );
	var angle_2 = Math.atan2( ( p.v2[ 1 ] - p.center[ 1 ] ), ( p.v2[ 0 ] - p.center[ 0 ] ) );
	return ( angle_2 - angle_1 ) * this.constants.to_degrees;
};

JL.functions.get_circle_points = function( p ){
	var p = p || {};

	var num_points = p.num_points || 8;
	var radius     = p.radius     || 1;
	var offset     = p.offset || { x : 0, z : 0 };

	var pi_2 = 2 * Math.PI;

	var points = [];

	for( var ang = 0; ang < pi_2; ang += pi_2 / num_points ){
		points.push({
			x : radius * Math.cos( ang ) + offset.x,
			z : radius * Math.sin( ang ) + offset.z,
		});
	}

	points.push( points[ 0 ] );

	return points;
};

JL.functions.get_curl_points = function( p ){
	var x     = p.start.x || 0;
	var z     = p.start.z || 0;
	var rad   = p.rad     || 0.5;
	var loops = p.loops   || 1;
	var steps = p.steps   || 6;

	var angle_start = ( p.angle_start || 0 );
	var angle_end   = ( p.angle_end   || 0 );

	var pts = [];
	var delta_y     = JL.functions.distance( p.start, p.end ) / steps;
	var delta_angle = ( ( 360 * loops + angle_end - angle_start ) / steps ) * this.constants.to_radians;

	var curr_y      = p.start.y;
	var curr_angle  = angle_start * this.constants.to_radians;

	for( var i = 0; i < steps; i++ ){
		pts.push({
			x : x + rad * Math.cos( curr_angle ),
			z : z + rad * Math.sin( curr_angle ),
			y : curr_y,
		});

		curr_y     += delta_y;
		curr_angle += delta_angle;
	}

	var rots = JL.functions.cartesian_to_spherical(
		p.end.x - p.start.x,
		p.end.y - p.start.y,
		p.end.z - p.start.z,
	);
	rots.lat -= 90;

	if( rots.lat ){
		var rad_lat = JL.functions.constants.to_radians * rots.lat;
		var cos_lat = Math.cos( rad_lat );
		var sin_lat = Math.sin( rad_lat );

		pts = pts.map(function( pt ){
			var val_y = pt.y - p.start.y;
			var val_z = pt.z - p.start.z;
			pt.y = ( cos_lat * val_y - sin_lat * val_z ) + p.start.y;
			pt.z = ( sin_lat * val_y + cos_lat * val_z ) + p.start.z;
			return pt;
		});
	}
	if( rots.lon ){
		var rad_lon = JL.functions.constants.to_radians * ( rots.lon + 180 );
		var cos_lon = Math.cos( rad_lon );
		var sin_lon = Math.sin( rad_lon );

		pts = pts.map(function( pt ){
			var val_x = pt.x - p.start.x;
			var val_z = pt.z - p.start.z;
			pt.x = ( cos_lon * val_x + sin_lon * val_z ) + p.start.x;
			pt.z = ( cos_lon * val_z - sin_lon * val_x ) + p.start.z;
			return pt;
		});
	}

	return pts;
};

JL.functions.get_triangle_points = function( point, middle_of_opposite_edge ){
	var vector_to_point = {
		x: point.x - middle_of_opposite_edge.x,
		z: point.z - middle_of_opposite_edge.z,
	};

	var distance_to_point = Math.sqrt( vector_to_point.x ** 2 + vector_to_point.z ** 2 );

	var normalized_vector = {
		x: vector_to_point.x / distance_to_point,
		z: vector_to_point.z / distance_to_point,
	};

	var distance_to_other_points = Math.sqrt(3) * JL.functions.distance( point, middle_of_opposite_edge ) / 2;

	var vector_to_other_points_clockwise = {
		x: middle_of_opposite_edge.x + distance_to_other_points * normalized_vector.z,
		z: middle_of_opposite_edge.z - distance_to_other_points * normalized_vector.x,
	};

	var vector_to_other_points_counterclockwise = {
		x: middle_of_opposite_edge.x - distance_to_other_points * normalized_vector.z,
		z: middle_of_opposite_edge.z + distance_to_other_points * normalized_vector.x,
	};

	return [ vector_to_other_points_clockwise, vector_to_other_points_counterclockwise ];
};

JL.functions.get_value_from_interpolated_array = function( alpha, arr ){
	// Note: this function expects a sorted array (sorted by ele.alpha, ascending order).

	var lesser_match, greater_match;
	var idx = 0;
	for( var ele of arr ){
		if( ele.alpha <= alpha ) lesser_match = ele;

		if( ele.alpha >= alpha ){
			greater_match = ele;
			break;
		}
	}

	var type = 'float';
	if( this.is_array( arr[0].val ) ) type = 'arr';

	if( lesser_match ){
		if( greater_match ){
			if( lesser_match == greater_match ) return lesser_match.val;

			var a = ( alpha - lesser_match.alpha ) / ( greater_match.alpha - lesser_match.alpha );

			switch( type ){
				case 'arr' : return this.interpolate_array( lesser_match.val, greater_match.val, a );
				default    : return this.interpolate(       lesser_match.val, greater_match.val, a );
			}
		}
		else{ return lesser_match.val; }
	}
	else if( greater_match ) return greater_match.val;

	return undefined;
};

// ---------------------
// | Number Formatting |
// ---------------------

JL.functions.number_to_words = function(num){
	if( num == 0 ) return 'zero';

	var th = [ '','thousand','million', 'billion','trillion' ];
	var dg = [ 'zero','one','two','three','four','five','six','seven','eight','nine' ];
	var tn = [ 'ten','eleven','twelve','thirteen', 'fourteen','fifteen','sixteen','seventeen','eighteen','nineteen' ];
	var tw = [ 'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety' ];

	var s = num.toString();
	s = s.replace( /[\, ]/g, '' );
	if( s != parseFloat(s) ) return 'not a number';
	var x = s.indexOf('.');
	if( x == -1 ) x = s.length;
	if( x >  15 ) return 'too big';
	var n = s.split('');
	var str = '';
	var sk = 0;
	var str_parts = [];
	for( var i=0; i < x; i++ ){
		if( (x-i) % 3 == 2 ){
			if( n[i] == '1' ){ str_parts.push( tn[Number(n[i+1])] ); i++; sk=1; }
			else if( n[i]!=0 ){ str_parts.push( tw[n[i]-2] ); sk=1; }
		}
		else if( n[i] != 0 ){
			str_parts.push( dg[n[i]] );
			if( (x-i) % 3 == 0 ) str_parts.push( 'hundred' );
			sk=1;
		}

		if( (x-i) % 3 == 1 ){
			if( sk ) str += str_parts.push( th[(x-i-1)/3] );
			sk=0;
		}
	}
	return str_parts.filter( s => s ).join(' ');
};

JL.functions.number_with_commas = function( n ){
	var parts = n.toString().split( '.' );
	parts[ 0 ] = parts[ 0 ].replace( /\B(?=(\d{3})+(?!\d))/g, ',' );
	return parts.join( '.' );
};

JL.functions.get_ordinal_number = function( num ){
        var num_string = String( num );
        var last       = +num_string.slice(-2);
        if( last > 3 && last < 21 ) return num + 'th';
        switch( last % 10 ){
                case 1 : return num + 'st';
                case 2 : return num + 'nd';
                case 3 : return num + 'rd';
                default: return num + 'th';
        }
};

JL.functions.decimal_to_fraction = function( val ){
	var len = val.toString().split('.')[1].length;

	var denom = Math.pow( 10, len );
	var numer = val * denom;

	var divisor = this.greatest_common_divisor( numer, denom );

	numer /= divisor;
	denom /= divisor;

	return { numer, denom };
};

JL.functions.pad = function( num, decimal_place, delimiter ){
	var delimiter = delimiter || '0';
	var num = num + '';
	if( num.length >= decimal_place ) return num;
	return new Array( decimal_place - num.length + 1 ).join( delimiter ) + num;
};

JL.functions.pad_right = function( num, decimal_place, delimiter ){
	return this.reverse_str( this.pad( this.reverse_str( String( num ) ), decimal_place, delimiter ) );
};

// -------------------------
// | Datetime Manipulation |
// -------------------------

JL.functions.strftime = function( format, dt, p ){
	var self = this;

	var vals = {};

	if( p ){
		if( p.utc ) dt = new Date( dt.getTime() + ( dt.getTimezoneOffset() * 60000 ) );
	}

	var getThursday = function(){
		var target = new Date( dt );
		target.setDate( get_val('date') - ( (get_val('day') + 6) % 7 ) + 3 );
		return target;
	};

	var get_val = function( key ){
		var val = vals[ key ];

		if( val !== undefined ) return val;

		switch( key ){
			case 'day'   : vals[ key ] = dt.getDay()     ; break;
			case 'date'  : vals[ key ] = dt.getDate()    ; break;
			case 'month' : vals[ key ] = dt.getMonth()   ; break;
			case 'year'  : vals[ key ] = dt.getFullYear(); break;
			case 'hour'  : vals[ key ] = dt.getHours()   ; break;
		};

		return vals[ key ];
	};

	var derive_var = function( key ){
		switch( key ){
			case '%a' : return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][get_val('day')];
			case '%A' : return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][get_val('day')];
			case '%b' : return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][get_val('month')];
			case '%B' : return ['January','February','March','April','May','June','July','August','September','October','November','December'][get_val('month')];
			case '%c' : return dt.toUTCString().replace(',', '');
			case '%C' : return Math.floor(get_val('year') / 100);
			case '%d' : return self.pad(get_val('date'), 2);
			case '%-d':
			case '%e' : return get_val('date');
			case '%F' : return (new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000))).toISOString().slice(0, 10);
			case '%G' : return getThursday().getFullYear();
			case '%g' : return (getThursday().getFullYear() + '').slice(2);
			case '%H' : return self.pad(get_val('hour'), 2);
			case '%-H': return get_val('hour');
			case '%I' : return self.pad((get_val('hour') + 11) % 12 + 1, 2);
			case '%j' : return self.pad([0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][get_val('month')] + get_val('date') + ((get_val('month') > 1 && ( (get_val('year') % 4 === 0 && get_val('year') % 100 !== 0) || get_val('year') % 400 === 0 )) ? 1 : 0), 3);
			case '%k' : return get_val('hour');
			case '%l' : return (get_val('hour') + 11) % 12 + 1;
			case '%m' : return self.pad(get_val('month') + 1, 2);
			case '%-m':
			case '%n' : return get_val('month') + 1;
			case '%M' : return self.pad(dt.getMinutes(), 2);
			case '%-M': return dt.getMinutes();
			case '%p' : return (get_val('hour') < 12) ? 'AM' : 'PM';
			case '%P' : return (get_val('hour') < 12) ? 'am' : 'pm';
			case '%s' : return Math.round(dt.getTime() / 1000);
			case '%S' : return self.pad(dt.getSeconds(), 2);
			case '%u' : return get_val('day') || 7;
			case '%V' : return (() => {
				var target = getThursday();
				var n1stThu = target.valueOf();
				target.setMonth(0, 1);
				var nJan1 = target.getDay();

				if( nJan1 !== 4 ) target.setMonth(0, 1 + ((4 - nJan1) + 7) % 7);

				return self.pad( 1 + Math.ceil( (n1stThu - target) / 604800000 ), 2 );
			})();
			case '%w' : return get_val('day');
			case '%x' : return dt.toLocaleDateString();
			case '%X' : return dt.toLocaleTimeString();
			case '%y' : return (get_val('year') + '').slice(2);
			case '%Y' : return get_val('year');
			case '%z' : return dt.toTimeString().replace(/.+GMT([+-]\d+).+/, '$1');
			case '%Z' : return dt.toTimeString().replace(/.+\((.+?)\)$/, '$1');
			case '%Zs': return new Intl.DateTimeFormat('default', {
				timeZoneName: 'short',
			}).formatToParts(dt).find((oPart) => oPart.type === 'timeZoneName').value;
		};

		return '';
	};

	return format
		.replace( /%[a-z\-][a-z\-]/gi, function( m ){ return ( derive_var(m) || m ); })
		.replace( /%[a-z\-]/gi       , function( m ){ return ( derive_var(m) || m ); });
};

// ----------------------
// | Color Manipulation |
// ----------------------

JL.functions.random_color = function( p ){
	var p = p || {};

	var rgb = [ 'r', 'g', 'b' ];

	var color = {};
	rgb.forEach(function( x ){ color[ x ] = this.random_integer( 0, 255 ) / 255; }, this );

	if( p.type ){
		switch( p.type ){
			case 'hex': return this.rgb_to_hex( color );
		};
	}

	if( p.obj ) return color;

	if( p.factor !== undefined ) rgb.forEach(function( x ){ color[ x ] *= p.factor; });

	return 'rgb(' + rgb.map( x => color[ x ] ).join(',') + ')';
};

JL.functions.hex_to_rgb = function( hex, is_obj, p ){
	var p = p || {};

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );

	if( !result ) return null;

	var r = parseInt( result[ 1 ], 16 ) / 255;
	var g = parseInt( result[ 2 ], 16 ) / 255;
	var b = parseInt( result[ 3 ], 16 ) / 255;

	if( p.factor ){
		r *= p.factor;
		g *= p.factor;
		b *= p.factor;
	}

	return ( is_obj ? { r, g, b } : [ r, g, b ] );
};

JL.functions.rgb_to_hex = function( color ){
	var to_hex = function( val ){
		var hex = val.toString( 16 );
		return ( hex.length == 1 ? "0" + hex : hex );
	}
	return "#" + to_hex( Math.round( 255 * color.r ) ) + to_hex( Math.round( 255 * color.g ) ) + to_hex( Math.round( 255 * color.b ) );
};

JL.functions.hsl_to_rgb = function( color ){
	// Note : hue range from [0,360]
	// Note : saturation value of 100 == 100%
	// Note : lightness value of 100 == 100%
	var h = color[ 0 ];
	var s = color[ 1 ];
	var l = color[ 2 ];

	s /= 100;
	l /= 100;
	var k = n => (n + h / 30) % 12;
	var a = s * Math.min(l, 1 - l);
	var f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return [ f(0), f(8), f(4) ];
};

JL.functions.rgb_to_hsl = function( color ){
	// Note : rgb color range is from [0,1].
	var r = color[ 0 ];
	var g = color[ 1 ];
	var b = color[ 2 ];

	var l = Math.max(r, g, b);
	var s = l - Math.min(r, g, b);
	var h = s
		? l === r
			? (g - b) / s
			: l === g
			? 2 + (b - r) / s
			: 4 + (r - g) / s
		: 0;
	return [
		60 * h < 0 ? 60 * h + 360 : 60 * h,
		100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
		(100 * (2 * l - s)) / 2,
	];
};

JL.functions.gradient_percent = function( raw_percent, colors ){
	var colors = colors || [
		[ 1.0, 0.0, 0.0 ],
		[ 1.0, 0.5, 0.0 ],
		[ 1.0, 1.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ],
	];

	var percent = raw_percent;
	if( percent != 1.0 ) percent %= 1.0;

	var percent_interval = 1.0 / ( colors.length - 1 );

	var curr_interval_min = 0.0;
	var curr_interval_max = percent_interval;

	var index_min = 0;
	var index_max = 1;

	while( !( curr_interval_min <= percent && percent <= curr_interval_max ) ){
		curr_interval_min += percent_interval;
		curr_interval_max += percent_interval;

		index_min++;
		index_max++;
	}

	var color_min = colors[ index_min ];
	var color_max = colors[ index_max ];

	var alpha = ( percent - curr_interval_min ) / ( curr_interval_max - curr_interval_min );

	return color_min.map(function( c, i ){ return JL.functions.interpolate( c, color_max[ i ], alpha ); });
};

JL.functions.rainbow_percent = function( raw_percent, colors ){
	var colors = colors || [
		[ 1.0, 0.0, 0.0 ],
		[ 1.0, 0.5, 0.0 ],
		[ 1.0, 1.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ],
	];

	var color_percentage = 1.0 / colors.length;
	var curr_percent     = raw_percent % 1.0;
	var curr_index       = 0;

	while( curr_percent > color_percentage ){
		curr_percent -= color_percentage;
		curr_index++;
	}

	curr_percent /= color_percentage;

	var curr_color = colors[ curr_index ];
	var next_color = colors[ ( curr_index + 1 ) % colors.length ];

	return curr_color.map(function( c, i ){ return JL.functions.interpolate( c, next_color[ i ], curr_percent ); });
};

JL.functions.saturate_color = function( rgb, sat ){
	// Note : sat is maxed out at 1.
	var hsl = this.rgb_to_hsl( rgb );

	hsl[ 1 ] *= sat;

	return this.hsl_to_rgb( hsl );
};

// -----------------------
// | Object Manipulation |
// -----------------------

JL.functions.arrays_equal = function( a1, a2 ){
	if( a1.length != a2.length ) return false;
	return a1.every(function( a1_i, i ){ return a1_i == a2[i]; });
};

JL.functions.concat_functions = function( functions ){
	return function(){
		var output;
		for( var fn of functions ){
			var fn_output = fn.apply( this, arguments );
			if( fn_output !== undefined ) output = fn_output;
		}
		return output;
	};
};

JL.functions.get_filled_array = function( val, length ){
	var arr = [];
	for( var i = 0; i < length; i++ ){ arr.push( val ); }
	return arr;
};

JL.functions.get_value_frequencies = function( arr ){
	var ref = [];

	for( var val of arr ){
		var  match = ref.find( x => x.val === val );
		if( !match ) ref.push( match = { val, count : 0 } );
		match.count++;
	}

	return ref;
};

JL.functions.get_least_frequent_val = function( arr ){
	var ref = this.get_value_frequencies( arr );

	var curr_min_val;
	var curr_min_count = Infinity;

	for( var match of ref ){
		if( match.count < curr_min_count ){
			curr_min_val   = match.val;
			curr_min_count = match.count;
		}
	}

	return curr_min_val;
};

JL.functions.get_most_frequent_count = function( arr ){
	var ref = [];

	var curr_max_count = 0;

	for( var val of arr ){
		var  match = ref.find( x => x.val === val );
		if( !match ) ref.push( match = { val, count : 0 } );
		match.count++;
		if( match.count > curr_max_count ) curr_max_count = match.count;
	}

	return curr_max_count;
};

JL.functions.get_most_frequent_val = function( arr ){
	var ref = [];

	var curr_max_val;
	var curr_max_count = 0;

	for( var val of arr ){
		var  match = ref.find( x => x.val === val );
		if( !match ) ref.push( match = { val, count : 0 } );
		match.count++;
		if( match.count > curr_max_count ){
			curr_max_val   = val;
			curr_max_count = match.count;
		}
	}

	return curr_max_val;
};

JL.functions.get_nested_object = function( nested_obj, path ){
	try{
		var output = nested_obj;
		path.forEach(function( key ){
			output = output[ key ];
		});
		return output;
	}
	catch(e){ return undefined; }
};

JL.functions.get_object_with_max_val = function( objects, key ){
	var output = {};
	objects.forEach(function( obj ){
		if( output[ key ] === undefined || obj[ key ] > output[ key ] ){
			output = obj;
		}
	});
	return output;
};

JL.functions.get_object_with_min_val = function( objects, key ){
	var output = {};
	objects.forEach(function( obj ){
		if( output[ key ] === undefined || obj[ key ] < output[ key ] ){
			output = obj;
		}
	});
	return output;
};

JL.functions.get_range_array = function( min, max ){
	var arr = [];
	for( var i = min; i <= max; i++ ){ arr.push( i ); }
	return arr;
};

JL.functions.inherit_class = function( target_class, source_class, p ){
	target_class.prototype = new source_class();
	if( p ){
		if( p._inputs ){
			target_class.prototype._inputs = $.extend( true, [], source_class.prototype._inputs ).filter(function( input ){
				return !p._inputs.find( x => x.key === input.key );
			}).concat( p._inputs );

			if( p._inputs_exclude ){
				target_class.prototype._inputs = target_class.prototype._inputs.filter(function( input ){
					return !p._inputs_exclude.find(function( x ){
						return Object.keys( x ).every(function( k ){
							return ( x[ k ] == input[ k ] );
						});
					});
				});
			}

			if( p._inputs_assign ){
				for( var cfg of p._inputs_assign ){
					JL.json_edit.prototype.assign_to_structure(
						Object.assign( { root_structure : target_class.prototype._inputs }, cfg )
					);
				}
			}

			if( p._inputs_hidden ){
				target_class.prototype._inputs.forEach(function( input ){
					if( p._inputs_hidden.find(function( x ){
						return Object.keys( x ).every(function( k ){
							return ( x[ k ] == input[ k ] );
						});
					}) ){
						input.hidden = true;
					}
				});
			}
		}
	}
	return target_class;
};

JL.functions.num_matches_in_array = function( arr, val ){
	return arr.filter(function( x ){ return ( x == val ); }).length;
};

JL.functions.recursive_assign = function( target, source ){
	var get_merged = function( t, s ){
		if( t !== undefined && typeof t === 'object' ){
			Object.keys( s ).forEach(function( s_key ){
				var s_val = s[ s_key ];
				t[ s_key ] = get_merged( t[ s_key ], s_val );
			});
			return t;
		}
		t = s;
		return t;
	};

	return get_merged( target, source );
};

JL.functions.recursive_findAll = function( obj, conditional ){
	var results = [];
	Object.keys( obj ).forEach(function( key ){
		var curr = obj[ key ];
		if( typeof curr === 'object' && curr ){
			if( conditional( curr ) ) results.push( curr );
			else                      results = results.concat( this.recursive_findAll( curr, conditional ) );
		}
	}, this);
	return results;
};

JL.functions.remove_nested_object = function( nested_obj, path ){
	var output = nested_obj;
	path.forEach(function( key, i ){
		if( i < path.length - 1 ) output = output[ key ];
		else                      delete output[   key ];
	});
};

JL.functions.set_nested_object = function( nested_obj, path, val ){
	var output = nested_obj;
	path.forEach(function( key, i ){
		if( i < path.length - 1 ){
			if( output[ key ] === undefined ) output[ key ] = ( isNaN( key ) ? {} : [] );
			output = output[ key ];
		}
		else{ output[ key ] = val; }
	});
};

JL.functions.shuffle_array = function( arr ){
	var curr_idx = arr.length;
	var rand_idx;

	while( curr_idx > 0 ){
		rand_idx = Math.floor( Math.random() * curr_idx );
		curr_idx--;

		[
			arr[ curr_idx ],
			arr[ rand_idx ]
		] = [
			arr[ rand_idx ],
			arr[ curr_idx ]
		];
	}

	return arr;
};

JL.functions.modify_object_values = function( obj, fn, keys ){
	( keys || Object.keys( obj ) ).forEach(function( k ){
		obj[ k ] = fn( obj[ k ] );
	});
};

JL.functions.filter_duplicates = function( arr ){
	return arr.filter(function( x, i ){ return ( arr.indexOf( x ) == i ); });
};

// ---------------------
// | Loading Functions |
// ---------------------

JL.functions.load_scripts = function( p ){
	var urls = [];
	if( p.urls ) urls = p.urls.slice();
	if( p.url  ) urls.push( p.url );

	var load = function(){
		if( !urls.length ){
			if( p.callback ) p.callback();
			return;
		}

		p._load( urls.shift(), load );
	};
	load();
};

JL.functions.add_css = function( css ){
	$( 'head' ).append( '<style>' + css + '</style>' );
};

JL.functions.load_css = function( p ){
	var self = this;

	this.load_scripts(
		Object.assign({
			_load : function( url, next_step ){
				$.ajax({
					url,
					dataType : 'text',
					success  : function( data ){
						self.add_css( data );
						next_step();
					},
					error    : function( e ){
						console.log( 'Could not load CSS script: ' + url );
						console.log( e );
						if( p.callback ) p.callback();
					},
				});
			}
		}, p )
	);
};

JL.functions.load_font = function( p ){
	this.load_css({
		url      : p.url,
		callback : function(){
			document.fonts.load( '12px "' + p.name + '"' ).then(function(){
				if( p.callback ) p.callback();
			});
		}
	});
};

JL.functions.load_js = function( p ){
	this.load_scripts(
		Object.assign({
			_load : function( url, next_step ){
				$.ajax({
					url,
					dataType : 'script',
					async    : true,
					success  : next_step,
					error    : function( xhr, stat, err ){
 						console.log( 'Could not load JavaScript script (probably a syntax error): ' + p.url );
 						console.log( 'Error message from ' + p.url + ' : ' );
 						console.log( ' >> ', err );
 						if( p.callback ) p.callback();
					},
				});
			}
		}, p )
	);
};

JL.functions.load_json = function( p ){
	$.ajax(
		Object.assign({
			url      : p.url,
			dataType : 'text',
			success  : function( data ){
				eval( 'var loaded_json = ' + data + ';' );
				p.callback( loaded_json );
			},
			error    : function( xhr, stat, err ){
				console.log( 'Could not load JSON file: ' + p.url );
				console.log( ' >> ', err );
				p.callback();
			},
		}, p.args || {} )
	);
};

JL.functions.get_last_modified_time = function( p ){
	$.ajax({
		url      : p.url,
		success  : function( x, y, request ){
			if( p.callback ) p.callback( new Date( request.getResponseHeader( "Last-Modified" ) ) );
		},
		error    : function( xhr, stat, err ){
			console.log( 'Could not get last modified time from file: ' + p.url );
			if( p.callback ) p.callback();
		},
	});
};

// -----------------------
// | String Manipulation |
// -----------------------

JL.functions.format_json = function( json_obj ){
	var self = this;

	var should_pad_key = function( x, key ){
		if( key.length >= 30 ) return false;
		return true;
		if( self.is_object( x ) ){
			if( Object.keys( x ).length < 6 ){
				if( !Object.values( x ).find(function( y ){
					return ( self.is_object( y ) || self.is_array( y ) );
				}) ){
					return true;
				}
			}
			return false;
		}
		if( self.is_array( x ) ){
			if( x.find(function( y ){
				return ( self.is_object( y ) || self.is_array( y ) );
			}) ){
				return false;
			}
		}
		return true;
	};

	var should_expand = function( x ){
		if( self.is_object( x ) ){
			return true;
		}
		if( self.is_array( x ) ){
			if( x.find(function( y ){
				return ( self.is_object( y ) || self.is_array( y ) );
			}) ){
				return true;
			}
		}
		return false;
	};

	var recursive_helper = function( p ){
		var level = '';

		var tabs = '\t'.repeat( p.indent );
		if( self.is_array( p.obj ) ){
			if( !should_expand( p.obj ) ){
				level += ( self.is_object( p.parent ) ? '' : tabs ) + '[ ';
				level += p.obj.map(function( c, i ){
					var val_pad;
					if( p.arr_val_pads ) val_pad = p.arr_val_pads[ i ];
					return recursive_helper({ obj : c, indent : p.indent + 1, parent : p.obj, val_pad });
				}).join(', ');
				level += ' ]';
			}
			else{
				var arr_val_pads;
				if( p.obj.every( x => self.is_array( x ) ) ){
					if( p.obj.every( x => x.length == p.obj[ 0 ].length ) ){
						if( p.obj.every(function( c ){
							return c.every(function( x ){ return !( self.is_array( x ) || self.is_object( x ) ); });
						}) ){
							arr_val_pads = new Array( p.obj[ 0 ].length );
							for( var i = 0; i < p.obj[ 0 ].length; i++ ){
								arr_val_pads[ i ] = Math.max( ...p.obj.map( x => JSON.stringify( x[ i ] ).length ) );
							}
						}
					}
				}

				level += ( self.is_object( p.parent ) ? '' : tabs ) + '[\n';
				var entries = p.obj.map(function( c ){
					return recursive_helper({ obj : c, indent : p.indent + 1, parent : p.obj, arr_val_pads });
				}).join(',\n');
				if( entries ) level += entries + '\n';
				level += tabs + ']';
			}
		}
		else if( self.is_object( p.obj ) ){
			var is_expanded = (
				Object.values( p.obj ).find(function( x ){ return should_expand( x ); }) || 
				Object.values( p.obj ).filter(function( x ){ return self.is_array( x ); }).length > 1
			);

			level += ( self.is_object( p.parent ) ? '' : tabs ) + '{' + ( is_expanded ? '\n' : ' ' );

			var parent_is_arr = self.is_array( p.parent );

			var val_pad = {};
			if( !is_expanded ){
				if( parent_is_arr ){
					for( var k of Object.keys( p.obj ) ){
						if( p.parent.every( x => x[ k ] !== undefined ) ){
							val_pad[ k ] = Math.max( ...p.parent.map( x => JSON.stringify( x[ k ] ).length ) );
						}
					}
				}
			}

			var key_cfg = {};
			for( var k of Object.keys( p.obj ) ){
				key_cfg[ k ] = {
					is_padding  : should_pad_key( p.obj[ k ], k ),
					is_expanded : should_expand(  p.obj[ k ]    ),
					length      : 0,
					type_order  : 0,
				};
				if( self.is_array( p.obj[ k ] ) || self.is_object( p.obj[ k ] ) ){
					key_cfg[ k ].length = JSON.stringify( p.obj[ k ] ).length;
				}
			}

			var key_length = Math.max( ...Object.keys( p.obj ).filter( k => key_cfg[ k ].is_padding ).map( k => k.length ) );

			var entries = Object.keys( p.obj ).sort(function( a, b ){
				if( val_pad[ a ]             && !val_pad[ b ]             ) return  1;
				if( val_pad[ b ]             && !val_pad[ a ]             ) return -1;
				if( key_cfg[ a ].is_expanded && !key_cfg[ b ].is_expanded ) return  1;
				if( key_cfg[ b ].is_expanded && !key_cfg[ a ].is_expanded ) return -1;
				if( key_cfg[ a ].length      !=  key_cfg[ b ].length      ) return ( key_cfg[ a ].length     - key_cfg[ b ].length     );
				if( key_cfg[ a ].is_padding  && !key_cfg[ b ].is_padding  ) return -1;
				if( key_cfg[ b ].is_padding  && !key_cfg[ a ].is_padding  ) return  1;
				if( a[ 0 ] == '_' && b[ 0 ] != '_' ) return -1;
				if( b[ 0 ] == '_' && a[ 0 ] != '_' ) return  1;
				if( a.length != b.length ) return ( a.length - b.length );
				return ( a > b ? 1 : -1 );
			}).map(function( k ){
				var key_pad    = '';
				var key_indent = tabs + '\t';
				if( !is_expanded ){
					key_indent = '';
				}
				if( is_expanded ){
					if( key_cfg[ k ].is_padding ){
						key_pad = ' '.repeat( key_length - k.length );
					}
				}
				return key_indent + '\"' + String( k ) + '\"' + key_pad + ' : ' + recursive_helper({
					obj     : p.obj[ k ],
					indent  : p.indent + 1,
					parent  : p.obj,
					val_pad : val_pad[ k ],
				});
			}).join( is_expanded ? ',\n' : ', ' );
			if( entries ) level += entries + ( is_expanded ? '\n' : '' );
			level += ( !is_expanded ? ' ' : tabs ) + '}';
		}
		else{
			var val = JSON.stringify( p.obj );
			if( p.val_pad ) val = self.pad( val, p.val_pad, ' ' );
			level += val;
		}

		return level;
	};

	return recursive_helper({ obj : json_obj, indent : 0, });
};

JL.functions.format_string = function( str, p ){
	var output = str.slice();
	Object.keys( p ).forEach(function( key ){
		output = output.replace( new RegExp( '{' + key + '}', 'g' ), p[ key ] );
	});
	return output;
};

JL.functions.get_basename = function( filename ){
	return filename.split( '/' ).pop();
};

JL.functions.get_best_match_string = function( str, options ){
	var self = this;

	var str           =                   ( str ).toLowerCase();
	var options_lower = options.map( x => ( x   ).toLowerCase() );

	var str_parts = str.split(' ').filter( x => x !== '' );
	var str_dense = self.remove_punctuation( self.remove_whitespace( str ) );

	var best_match;

	for( var idx = 0; idx < options.length; idx++ ){
		var val = options_lower[ idx ];

		if( val == str ) return { idx, val : options[ idx ], score : Infinity };

		var score = 0;

		var val_parts = val.split(' ').filter( x => x !== '' );
		var val_dense = self.remove_punctuation( self.remove_whitespace( val ) );

		var prev_matching = false;
		val_parts.forEach(function( val_word ){
			var match = false;
			str_parts.forEach(function( str_word ){
				if( str_word == val_word ){
					score += 10 * str_word.length;
					if( prev_matching ) score += 30;
					prev_matching = true;
					match = true;
				}
				else if( str_word.includes( val_word ) || val_word.includes( str_word ) ){
					score += 20 * Math.min( val_word.length, str_word.length );
				}
			});

			if( !match ) prev_matching = false;
		});

		for( var i = 0; i < val_dense.length - 2; i++ ){
			var sub_str = val_dense.substr( i, 3 );
			if( str_dense.includes( sub_str ) ){
				score += 30;
			}
		}

		if( !best_match || best_match.score < score ) best_match = { val : options[ idx ], idx, score };
	}

	return best_match;
};

JL.functions.num_diff_chars = function( str_1, str_2 ){
	var num_diff = Math.abs( str_1.length - str_2.length );

	for( var i = 0; i < Math.min( str_1.length, str_2.length ); i++ ){
		if( str_1[ i ] != str_2[ i ] ) num_diff++;
	}

	return num_diff;
};

JL.functions.parse_csv_text = function( str, p ){
	var p = p || {};

	var lines = str.trim().split('\n');

	var num_headers = lines[ 0 ].split(',').length;

	var output = { entries : [] };

	if( !p.no_headers ) output.headers = lines.shift().split(',');

	for( var line of lines ){
		var entry         = [];
		var col_values    = [];
		var col_value     = '';
		var within_quotes = false;

		for( var char of line ){
			if( char === '"' ){
				within_quotes = !within_quotes;
			}
			else if( char === ',' && !within_quotes ){
				col_values.push( col_value.trim() );
				col_value = '';
			}
			else{
				col_value += char;
			}
		}

		col_values.push( col_value.trim() );

		for( var i = 0; i < num_headers; i++ ){
			if( !isNaN( col_values[i] ) ) col_values[i] = Number( col_values[i] );
			entry.push( col_values[i] );
		}

		output.entries.push( entry );
	}

	return output;
};

JL.functions.get_plain_text_table = function( p ){
	var self = this;

	var output = '';

	var padding = p.padding || 0;

	var columns = p.entries[ 0 ].map(function( c, i ){
		var width = ( p.headers ? p.headers[ i ].width : undefined );

		if( width === undefined ) width = Math.max( ...p.entries.map(function( entry ){ return Math.max( ...String( entry[ i ] ).split('\n').map( s => s.length ) ); }) );
		if( p.headers ){
			width = Math.max( width, String( p.headers[ i ].name ).length );
			if( p.headers[ i ].max_width ) width = Math.min( p.headers[ i ].max_width, width );
		}

		return { width };
	});

	var single_break = '+' + columns.map(function( c ){ return '-'.repeat( c.width + 2 * padding ); }).join('+') + '+';
	var double_break = '+' + columns.map(function( c ){ return '='.repeat( c.width + 2 * padding ); }).join('+') + '+\n';

	var entries = [];

	p.entries.forEach(function( entry, entry_idx ){
		var sub_entries = [];
		entry.forEach(function( original_val, col_idx ){
			var col = columns[ col_idx ];

			var val = String( original_val );

			var sub_entries_idx = 0;
			while( val.length ){
				if( !sub_entries[ sub_entries_idx ] ) sub_entries.push( Array( columns.length ).fill('') );

				var this_chunk = val.slice( 0, col.width );

				if( this_chunk.includes('\n') ){
					var newline_idx = this_chunk.indexOf('\n');
					sub_entries[ sub_entries_idx ][ col_idx ] = this_chunk.slice( 0, newline_idx );
					val = val.slice( newline_idx + 1 );
				}
				else{
					sub_entries[ sub_entries_idx ][ col_idx ] = this_chunk;
					val = val.slice( col.width );
				}

				sub_entries_idx++;
			}
		});

		entries = entries.concat( sub_entries );

		if( !p.no_line_breaks || entry_idx == p.entries.length - 1 ) entries.push( single_break );
	});

	var pad_val = function( val, col, header ){
		if( header.align == 'left' ) val = val.split('').reverse().join('');

		val = self.pad( val, col.width, ' ' );

		if( header.align == 'left' ) val = val.split('').reverse().join('');

		return val;
	};

	if( p.headers ){
		var header_line = '|' +
			p.headers.map(function( header, col_idx ){
				if( p.align && !header.align ) header.align = p.align;

				var col = columns[ col_idx ];

				return ' '.repeat( padding ) + pad_val( header.name, col, header ) + ' '.repeat( padding );
			}).join('|') +
		'|';

		output += double_break + header_line + '\n';
	}

	output += double_break + entries.map(function( entry ){
		if( typeof entry === 'string' || entry instanceof String ) return entry;
		return '|' + 
			entry.map(function( val, col_idx ){
				var col = columns[ col_idx ];

				return ' '.repeat( padding ) + pad_val( val, col, ( p.headers ? p.headers[ col_idx ] : { align : p.align } ) ) + ' '.repeat( padding );
			}).join('|') +
		'|';
	}).join('\n');

	return output;
};

JL.functions.remove_punctuation = function( str ){
	return String( str ).replace( /[.,\/#!$%\^&\*;:{}=\-_`~()\']/g, "" );
};

JL.functions.remove_whitespace = function( str ){
	return String( str ).replace( /\s+/g, "" );
};

JL.functions.reverse_str = function( str ){
	return str.split('').reverse().join('');
};

JL.functions.lstrip = function( str, substr ){
	if( substr === undefined ) return str.trimStart();
	
	while( str.startsWith( substr ) ) str = str.slice( substr.length );

	return str;
};

JL.functions.rstrip = function( str, substr ){
	if( substr === undefined ) return str.trimEnd();
	
	while( str.endsWith( substr ) ) str = str.slice( 0, str.length - substr.length );

	return str;
};

JL.functions.str_to_html = function( str ){
	return str.replace( /\n/g, '<br>' );
};

JL.functions.str_to_id = function( str ){
	return this.remove_whitespace( this.remove_punctuation( str ).split(' ').join('_') ).toLowerCase();
};

JL.functions.strip = function( str, substr ){
	if( substr === undefined ) return str.trim();
	
	while( str.startsWith( substr ) ) str = str.slice( substr.length );
	while( str.endsWith(   substr ) ) str = str.slice( 0, str.length - substr.length );

	return str;
};

JL.functions.title_case = function( str ){
        return String( str ).toLowerCase().split(' ').map( x => x[0].toUpperCase() + x.slice(1) ).join(' ');
};

// ----------------------
// | Image Manipulation |
// ----------------------

JL.functions.font_to_canvas = function( p ){
	// For testing:
	// var c = JL.functions.font_to_canvas({ font_family : 'Open Sans', font_size : 36, color: '#fff', outline_color : '#000', outline_width : 5 }); $( c ).css({ position: 'fixed', top : 0, left : 0, "z-index" : 12345, background : "#300" }); $( 'html' ).append( c );

	var canvas = document.createElement( 'canvas' );
	var ctx    = canvas.getContext( '2d' );

	canvas.width  = 1024;
	canvas.height =  512;

        ctx.fillStyle = 'transparent';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect( 0, 0, canvas.width, canvas.height);

        ctx.font         = '400 ' + ( p.font_size || 36 ) + 'px "' + p.font_family + '"';
        ctx.textBaseline = 'middle';

        ctx.textAlign   = 'center';
        ctx.fillStyle   = p.color         || 'white';
        ctx.strokeStyle = p.outline_color || 'transparent';
        ctx.lineWidth   = p.outline_width || 0;

        // Note : these 'miter' settings are to prevent text outline artifacts for letters with sharp corners (like A, V, and W)
        ctx.lineJoin   = 'miter';
        ctx.miterLimit = 2;

	if( !this.constants.font_chars ){
		this.constants.font_chars = [" ","!","\"","#","$","%","&","'","(",")","*","+",",","-",".","/","0","1","2","3","4","5","6","7","8","9",":",";","<","=",">","?","@","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","[","\\","]","^","_","`","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","{","|","}","~"];
	}

	var chars          = this.constants.font_chars.slice();
	var char_size      = canvas.width / 16;
	var char_size_half = char_size / 2;
	var x              = char_size_half;
	var y              = char_size_half;
	while( chars.length ){
		var curr_char = chars.shift();

		if( ctx.strokeStyle != 'transparent' ) ctx.strokeText( curr_char, x, y );
		ctx.fillText( curr_char, x, y );
		
		x += char_size;
		if( x >= canvas.width ){
			x  = char_size_half;
			y += char_size;
		}
	}

	return canvas;
};

JL.functions.get_canvas_pixels = function( p ){
	return ( p.ctx || p.canvas.getContext( '2d' ) ).getImageData( 0, 0, p.canvas.width, p.canvas.height ).data;
};

JL.functions.get_image_pixels = function( img, p ){
	var p = p || {};

	var canvas = document.createElement( 'canvas' );

	canvas.width  = img.width;
	canvas.height = img.height;

	var ctx = canvas.getContext( '2d' );

	ctx.drawImage( img, 0, 0 );

	var output = this.get_canvas_pixels({ canvas, ctx });

	canvas.remove();

	if( p.format ){
		switch( p.format ){
			case 'arr':
				var tmp_output = [];
				var pixel_size = p.pixel_size || 4;
				var height = pixel_size * img.height;
				var width  = pixel_size * img.width ;
				for        ( var j = 0; j < height; j += pixel_size ){
					var row = [];
					for( var i = 0; i < width ; i += pixel_size ){
						var entry = [];
						for( var o_i = 0; o_i < pixel_size; o_i++ ){
							entry.push( output[ j * img.width + i + o_i ] );
						}
						row.push( entry );
					}
					tmp_output.push( row );
				}
				output = tmp_output;
				break;
		}
	}

	return output;
};

JL.functions.set_canvas_pixels = function( p ){
	var ctx = ( p.ctx || p.canvas.getContext('2d') );

	var d = ctx.getImageData( 0, 0, p.canvas.width, p.canvas.height );
	d.data.set( p.pixels ); // Needs to be a Uint8ClampedArray

	return ctx.putImageData( d, 0, 0 );
};

// -----------------------------
// | Random / Noise Generators |
// -----------------------------

JL.functions.random_xyz_clumpy = function( p ){
	var num_clumps = p.num_clumps || 5;
	var num_points = p.num_points || 1;
	var clump_rad  = p.clump_rad  || 0.1;
	var bound_wrap = p.bound_wrap;

	var min = p.min;
	var max = p.max;
	var range = max - min;

	var clumps = [];
	for( var i = 0; i < num_clumps; i++ ){
		clumps.push([
			this.random_number( min, max ),
			this.random_number( min, max ),
			this.random_number( min, max ),
		]);
	}

	var output = [];
	for( var i = 0; i < num_points; i++ ){
		var clump = this.random_element( clumps );

		var x = this.random_number( clump[ 0 ] - clump_rad, clump[ 0 ] + clump_rad );
		var y = this.random_number( clump[ 1 ] - clump_rad, clump[ 1 ] + clump_rad );
		var z = this.random_number( clump[ 2 ] - clump_rad, clump[ 2 ] + clump_rad );

		if( bound_wrap ){
			while( x < min ) x += range;
			while( y < min ) y += range;
			while( z < min ) z += range;

			while( x > max ) x -= range;
			while( y > max ) y -= range;
			while( z > max ) z -= range;
		}

		output.push([ x, y, z ]);
	}

	if( num_points == 1 ) return output[ 0 ];
	return output;
};

// Range : [-1,1]
JL.functions.simplex_noise_2d = function( x, y ){
	var self = this;

	if(    !this._simplex_noise_random_2d ){
		this._simplex_noise_random_2d = function( c ){
			var j = 4096.0 * Math.sin( this.dot_product( c, [ 17.0, 59.4, 15.0 ] ) );
			var r = [0,0,0];
			r[2] = this.fract(512.0*j) - 0.5;
			j *= 0.125;
			r[0] = this.fract(512.0*j) - 0.5;
			j *= 0.125;
			r[1] = this.fract(512.0*j) - 0.5;
			return r;
		};

		this._simplex_noise_calc_2d = function(p){
			var G3 = 0.1666667;

			var d = this.dot_product( p, [0.3333333,0.3333333,0.3333333,] );
			var s = p.map(function(_){ return Math.floor( _ + d ); });

			var d = this.dot_product( s, [G3,G3,G3,] );
			var x = p.map(function(_,i){ return _ - s[i] + d; });

			var e = [
				this.step( 0.0, x[0] - x[1] ),
				this.step( 0.0, x[1] - x[2] ),
				this.step( 0.0, x[2] - x[0] ),
			];
			var i1 = [
				e[0] * ( 1 - e[2] ),
				e[1] * ( 1 - e[0] ),
				e[2] * ( 1 - e[1] ),
			];
			var i2 = [
				1 - e[2] * ( 1 - e[0] ),
				1 - e[0] * ( 1 - e[1] ),
				1 - e[1] * ( 1 - e[2] ),
			];

			var x1 = x.map(function(_,i){ return x[i] - i1[i] + G3; });
			var x2 = x.map(function(_,i){ return x[i] - i2[i] + 2.0 * G3; });
			var x3 = x.map(function(_,i){ return x[i] - 1.0 + 3.0 * G3; });

			var w = [0,0,0,0];
			var d = [0,0,0,0];

			w[0] = this.dot_product( x , x  );
			w[1] = this.dot_product( x1, x1 );
			w[2] = this.dot_product( x2, x2 );
			w[3] = this.dot_product( x3, x3 );

			w = w.map(function(_,i){ return Math.max( 0.6 - _, 0.0 ); });

			d[0] = this.dot_product( this._simplex_noise_random_2d( s                                            ), x  );
			d[1] = this.dot_product( this._simplex_noise_random_2d( s.map(function(_,i){ return s[i] + i1[i]; }) ), x1 );
			d[2] = this.dot_product( this._simplex_noise_random_2d( s.map(function(_,i){ return s[i] + i2[i]; }) ), x2 );
			d[3] = this.dot_product( this._simplex_noise_random_2d( s.map(function(_,i){ return s[i] + 1.0  ; }) ), x3 );

			w = w.map(function(_,i){ return _ * _; });
			w = w.map(function(_,i){ return _ * _; });
			d = d.map(function(_,i){ return _ * w[i]; });

			return this.dot_product( d, [52.0,52.0,52.0,52.0,] );
		}
	}

	var pos = [ x, y ];

	var v1 = [
		this.dot_product( pos, [-0.37,-0.14] ),
		this.dot_product( pos, [ 0.36,-0.93] ),
		this.dot_product( pos, [ 0.85, 0.34] ),
	];
	var v2 = [
		this.dot_product( pos, [-0.55, 0.33] ),
		this.dot_product( pos, [-0.39,-0.91] ),
		this.dot_product( pos, [ 0.74,-0.24] ),
	];
	var v3 = [
		this.dot_product( pos, [-0.71,-0.08] ),
		this.dot_product( pos, [ 0.52,-0.72] ),
		this.dot_product( pos, [-0.47,-0.68] ),
	];

	return 0.5333 * this._simplex_noise_calc_2d(  v1                                                 ) +
	       0.2666 * this._simplex_noise_calc_2d(  v2.map(function(_){ return 2.0 * _; })             ) +
	       0.1333 * this._simplex_noise_calc_2d(  v3.map(function(_){ return 4.0 * _; })             ) +
	       0.0666 * this._simplex_noise_calc_2d( pos.map(function(_){ return 8.0 * _; }).concat([0]) );
};

// Range : [-1,1]
JL.functions.simplex_noise_3d = function( x, y, z ){
	var self = this;

	if(    !this._simplex_noise_random_3d ){
		this._simplex_noise_random_3d = function( c ){
			var j = 4096.0 * Math.sin( this.dot_product( c, [ 17.0, 59.4, 15.0 ] ) );
			var r = [0,0,0];
			r[2] = this.fract(512.0*j) - 0.5;
			j *= 0.125;
			r[0] = this.fract(512.0*j) - 0.5;
			j *= 0.125;
			r[1] = this.fract(512.0*j) - 0.5;
			return r;
		};

		this._simplex_noise_calc_3d = function(p){
			var G3 = 0.1666667;

			var d = this.dot_product( p, [0.3333333,0.3333333,0.3333333,] );
			var s = p.map(function(_){ return Math.floor( _ + d ); });

			var d = this.dot_product( s, [G3,G3,G3,] );
			var x = p.map(function(_,i){ return _ - s[i] + d; });

			var e = [
				this.step( 0.0, x[0] - x[1] ),
				this.step( 0.0, x[1] - x[2] ),
				this.step( 0.0, x[2] - x[0] ),
			];
			var i1 = [
				e[0] * ( 1 - e[2] ),
				e[1] * ( 1 - e[0] ),
				e[2] * ( 1 - e[1] ),
			];
			var i2 = [
				1 - e[2] * ( 1 - e[0] ),
				1 - e[0] * ( 1 - e[1] ),
				1 - e[1] * ( 1 - e[2] ),
			];

			var x1 = x.map(function(_,i){ return x[i] - i1[i] + G3; });
			var x2 = x.map(function(_,i){ return x[i] - i2[i] + 2.0 * G3; });
			var x3 = x.map(function(_,i){ return x[i] - 1.0 + 3.0 * G3; });

			var w = [0,0,0,0];
			var d = [0,0,0,0];

			w[0] = this.dot_product( x , x  );
			w[1] = this.dot_product( x1, x1 );
			w[2] = this.dot_product( x2, x2 );
			w[3] = this.dot_product( x3, x3 );

			w = w.map(function(_,i){ return Math.max( 0.6 - _, 0.0 ); });

			d[0] = this.dot_product( this._simplex_noise_random_3d( s                                            ), x  );
			d[1] = this.dot_product( this._simplex_noise_random_3d( s.map(function(_,i){ return s[i] + i1[i]; }) ), x1 );
			d[2] = this.dot_product( this._simplex_noise_random_3d( s.map(function(_,i){ return s[i] + i2[i]; }) ), x2 );
			d[3] = this.dot_product( this._simplex_noise_random_3d( s.map(function(_,i){ return s[i] + 1.0  ; }) ), x3 );

			w = w.map(function(_,i){ return _ * _; });
			w = w.map(function(_,i){ return _ * _; });
			d = d.map(function(_,i){ return _ * w[i]; });

			return this.dot_product( d, [52.0,52.0,52.0,52.0,] );
		}
	}

	var pos = [ x, y, z ];

	var v1 = [
		this.dot_product( pos, [-0.37,-0.14,0.92] ),
		this.dot_product( pos, [ 0.36,-0.93,0.01] ),
		this.dot_product( pos, [ 0.85, 0.34,0.4 ] ),
	];
	var v2 = [
		this.dot_product( pos, [-0.55, 0.33,0.77] ),
		this.dot_product( pos, [-0.39,-0.91,0.12] ),
		this.dot_product( pos, [ 0.74,-0.24,0.63] ),
	];
	var v3 = [
		this.dot_product( pos, [-0.71,-0.08,-0.7 ] ),
		this.dot_product( pos, [ 0.52,-0.72,-0.45] ),
		this.dot_product( pos, [-0.47,-0.68, 0.56] ),
	];

	return 0.5333 * this._simplex_noise_calc_3d(  v1                                     ) +
	       0.2666 * this._simplex_noise_calc_3d(  v2.map(function(_){ return 2.0 * _; }) ) +
	       0.1333 * this._simplex_noise_calc_3d(  v3.map(function(_){ return 4.0 * _; }) ) +
	       0.0666 * this._simplex_noise_calc_3d( pos.map(function(_){ return 8.0 * _; }) );
};

JL.functions.land_elevation_noise = function( p ){
	// Good example : https://www.redblobgames.com/maps/terrain-from-noise/
	var output  = 0;
	var mag     = 0;

	var octaves = p.octaves || 3;
	var octave  = 1;

	for( var i = 0; i < octaves; i++ ){
		output += ( this.simplex_noise_2d( ( p.x + i ) / octave, ( p.z + i ) / octave ) + 1 ) / 2;
		mag += octave;
		octave /= 2;
	}
	output /= mag;

	if( p.exponent !== undefined ) output = Math.pow( output, p.exponent );

	return output;
};

// --------------------
// | Units Formatting |
// --------------------

JL.functions.hr_order_of_mag = function( b, params ){
	var bytes  = b;
	var units  = '';
	var orders = [ 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y' ];
	while( bytes >= 1000 && orders.length ){
		bytes /= ( params.size || 1000 );
		units = orders.shift();
	}

	if( params ){
		if( params.decimal_places ) bytes = bytes.toFixed( params.decimal_places );
		if( params.sig_figs       ) bytes = bytes.toPrecision( params.sig_figs );
		if( params.integer        ) bytes = parseInt( bytes );
	}

	return bytes + units;
};

JL.functions.hr_bytes = function( b, params ){
	return this.hr_order_of_mag( b, params ) + 'B';
};

JL.functions.time_abbr = function( b, params ){
	var units = 's';
	var sign  = ( b < 0 ? '-' : '' );
	var b     = Math.abs( b );

	var curr_val    = b;
	var curr_factor = 1;
	if( curr_val >= 60 ){
		curr_val /= 60, curr_factor /= 60, units = 'm';
		if( curr_val >= 60 ){
			curr_val /= 60, curr_factor /= 60, units = 'h';
			if( curr_val >= 24 ){
				curr_val /= 24, curr_factor /= 24, units = 'd';
				if( curr_val >= 365.25 ){
					curr_val /= 365, curr_factor /= 365, units = 'y';
				}
			}
		}
	}

	var result_val = parseInt( curr_val );

	var remainder_val = b - result_val / curr_factor;

	return sign + result_val + units + ( remainder_val > 0 ? ' ' + this.time_abbr( remainder_val, params ): '' );
};

// ------------------
// | User Interface |
// ------------------

JL.functions.copy_to_clipboard = function( text ){
	var tmp_ele = document.createElement( 'textarea' );
	tmp_ele.value = text;
	document.body.appendChild( tmp_ele );
	tmp_ele.select();
	document.execCommand( 'copy' );
	document.body.removeChild( tmp_ele );
};

JL.functions.download_file = function( path, filename ){
	var a      = document.createElement( 'a' );
	a.href     = path;
	a.download = filename;
	document.body.appendChild( a );
	a.click();
	document.body.removeChild( a );
	delete a;
};

JL.functions.get_html_element_position = function( ele ){
	var element = $( ele );
	var rect = element[ 0 ].getBoundingClientRect();
	return {
		top  : rect.top  + window.scrollY,
		left : rect.left + window.scrollX,
	};
};

JL.functions.get_html_element_width = function( ele ){
	return $( ele ).width();
};

JL.functions.get_html_element_height = function( ele ){
	return $( ele ).height();
};

JL.functions.init_fullscreen = function(){
	if( !this._fullscreen ){
		this._fullscreen = {};
		this._fullscreen.window   = window.document;
		this._fullscreen.document = this._fullscreen.window.documentElement;
		this._fullscreen.request  = this._fullscreen.document.requestFullscreen || this._fullscreen.document.mozRequestFullScreen || this._fullscreen.document.webkitRequestFullScreen || this._fullscreen.document.msRequestFullscreen;
		this._fullscreen.exit     = this._fullscreen.window.exitFullscreen || this._fullscreen.window.mozCancelFullScreen || this._fullscreen.window.webkitExitFullscreen || this._fullscreen.window.msExitFullscreen;
	}
};

JL.functions.enter_fullscreen = function( p ){
	this.init_fullscreen();
        this._fullscreen.request.call( this._fullscreen.document, p );
};

JL.functions.exit_fullscreen = function( p ){
	this.init_fullscreen();
        this._fullscreen.exit.call( this._fullscreen.window, p );
};

JL.functions.toggle_fullscreen = function(){
	this.init_fullscreen();
        ( !this._fullscreen.window.fullscreenElement && !this._fullscreen.window.mozFullScreenElement && !this._fullscreen.window.webkitFullscreenElement && !this._fullscreen.window.msFullscreenElement ?
                this.enter_fullscreen() :
                this.exit_fullscreen()
        );
};

JL.functions.redirect_url = function( url ){
	window.location.replace( url );
	window.location.reload( true );
};

// ---------------------------
// | Scientific Calculations |
// ---------------------------

JL.functions.convert_temperature = function( unit_s, unit_e, val, decimal_places ){
	var output;
	switch( unit_s.toUpperCase() ){
		case 'F':
			switch( unit_e.toUpperCase() ){
				case 'C' : output =          ( ( val - 32 ) * 5 / 9 ); break;
				case 'K' : output = 273.15 + ( ( val - 32 ) * 5 / 9 ); break;
			}
			break;
		case 'C':
			switch( unit_e.toUpperCase() ){
				case 'F' : output = ( 32 + ( val * 9 / 5 ) ); break;
				case 'K' : output = ( val + 273.15 ); break;
			}
			break;
		case 'K':
			switch( unit_e.toUpperCase() ){
				case 'F' : output = ( 32 + ( val - 273.15 ) * 9 / 5 ); break;
				case 'C' : output =        ( val - 273.15 ); break;
			}
			break;
	}
	if( decimal_places !== undefined ) output = output.toFixed( decimal_places );
        return output;
};

JL.functions.deg_to_cardinal_dir = function( deg ){
	var d = deg;
	while( d < 0 ) d += 360;
	d %= 360;
	if( d <   11.25 ) return 'N';
	if( d <   33.75 ) return 'NNE';
	if( d <   56.25 ) return 'NE';
	if( d <   78.75 ) return 'ENE';
	if( d <  101.25 ) return 'E';
	if( d <  123.75 ) return 'ESE';
	if( d <  146.25 ) return 'SE';
	if( d <  168.75 ) return 'SSE';
	if( d <  191.25 ) return 'S';
	if( d <  213.75 ) return 'SSW';
	if( d <  236.25 ) return 'SW';
	if( d <  258.75 ) return 'WSW';
	if( d <  281.25 ) return 'W';
	if( d <  303.75 ) return 'WNW';
	if( d <  326.25 ) return 'NW';
	if( d <  348.75 ) return 'NNW';
	if( d <= 360    ) return 'N';
	return '???';
};

// ---------------------------
// | Variable Identification |
// ---------------------------

JL.functions.is_canvas = function( v ){
	return ( v instanceof HTMLCanvasElement );
};

JL.functions.is_int = function( v ){
	if( isNaN( v ) ) return false;

	var x = parseFloat( v );
	return ( (x|0) === x );
};

JL.functions.is_str = function( v ){
	return ( typeof v === 'string' || v instanceof String );
};

JL.functions.is_array = function( v ){
	return ( v instanceof Array );
};

JL.functions.is_object = function( v ){
	return (
		typeof v === 'object' &&
		!this.is_array( v )   &&
		v !== null
	);
};


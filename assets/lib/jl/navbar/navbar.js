try{ JL = JL; } catch(e){ JL = {}; }

JL.navbar = function( p ){
	this.title          = p.title || 'Title';
	this.title_url      = p.title_url;
	this.options        = p.options || [];
	this.dropdown       = p.dropdown || 'hover';
	this.not_responsive = p.not_responsive;

	[ 'child_html', 'option_html', 'title_html' ].forEach(function( x ){
		if( p[ x ] ) this[ x ] = p[ x ];
	}, this);

	this.draw();
};

JL.navbar.prototype.title_html = function(){
	var html = '<div id="navbar-title">' + ( this.title || '' ) + '</div>';

	if( this.title_url !== undefined ) html = '<a href="' + this.title_url + '">' + html + '</a>';

	return html;
};

JL.navbar.prototype.option_html = function( option ){
	var onclick = '';
	if     ( option.onclick           ) onclick = 'onclick="' + option.onclick + '"';
	else if( this.dropdown == 'click' ) onclick = 'onclick="var ele = $( this ).find(\'.navbar-children\'); if( !ele.is(\':visible\') ){ ' + this.hide_all_option_children_html() + ' } ele.toggle(); $( \'#navbar-backdrop\' ).toggleClass( \'visible\' );"';

	var classes = 'navbar-option';
	if( this.not_responsive      ) classes += ' not-responsive';
	if( this.dropdown == 'hover' ) classes += ' dropdown-hover';
	if( option.active            ) classes += ' active';
	if( option.classes           ) classes += ' ' + option.classes.join(' ');

	var tag = 'div';
	if( option.options ){
		tag     = 'select';
		onclick = false;
	}
	else if( option.search ){
		tag     = 'input';
		onclick = false;
	}
	else if( option.info ){
		classes += ' info';
		onclick = false;
	}

	var html_attrs = '';
	if( option.attributes ) html_attrs = Object.keys( option.attributes ).map(function( x ){ return x + '="' + option.attributes[ x ] + '"'; }).join(' ');

	var html = '<' + tag + ' ' + html_attrs + ' class="' + classes + '" ' + onclick + '>' + 
		( option.name || '' ) +
		( !option.children ? '' :
			'<div class="navbar-children">' + 
				option.children.map(function( c ){ return this.child_html( c ); }, this).join('') +
			'</div>'
		) +
		( !option.options ? '' :
			option.options.map(function( o ){
				return '<option ' + ( o.value !== undefined ? 'value="' + o.value + '"' : '' ) + ' ' + ( o.selected ? 'selected' : '' ) + '>' +
					o.name +
				'</option>';
			}).join('')
		) +
		( !option.info ? '' :
			option.info.label + '<div class="info-value">' + option.info.value + '</div>'
		) +
	'</' + tag + '>';

	if( option.url ) html = '<a href="' + option.url + '">' + html + '</a>';

	return html;
};

JL.navbar.prototype.child_html = function( child ){
	var classes = '';
	if( child.active  ) classes += ' active';
	if( child.classes ) classes += ' ' + child.classes.join(' ');

	var html = '<div class="navbar-child ' + classes  + '">' +
		child.name +
	'</div>';

	if( child.url ) html = '<a href="' + child.url + '">' + html + '</a>';

	return html;
};

JL.navbar.prototype.mobile_select_html = function(){
	var html = '<select class="navbar-mobile-select" onchange="( new Function(this.value) )();">';

	var option_html = function( option, params ){
		var params = params || {};
		return '<option value="' + ( option.url ? 'window.location.href = \'' + option.url + '\';' : option.onclick || '' ) + '" ' + ( option.active ? 'selected' : '' ) + '>' + 
			( params.child ? ' &nbsp;  &nbsp;&bull; ' : '' ) +
			option.name + 
		'</option>';
	};

	this.options.forEach(function( option ){
		html += option_html( option );
		if( option.children ){
			option.children.forEach(function( child ){
				html += option_html( child, { child : true } );
			}, this);
		}
	}, this);

	html += '</select>';
	return html;
};

JL.navbar.prototype.update_html = function(){
	$( "#navbar" ).html(
		this.title_html() +
		this.options.map(function( option ){ return this.option_html( option ); }, this).join('') +
		( !this.not_responsive ? this.mobile_select_html() : '' )	
	);
};

JL.navbar.prototype.show_option_children = function( option_idx ){
	this.hide_all_option_children();
	$( $( "#navbar .navbar-option" )[ option_idx ] ).find( ".navbar-children" ).show();
	$( "#navbar-backdrop" ).show();
};

JL.navbar.prototype.hide_all_option_children = function(){
	$( "#navbar .navbar-option .navbar-children" ).hide();
	$( "#navbar-backdrop" ).hide();
};

JL.navbar.prototype.hide_all_option_children_html = function(){
	return '$( \'#navbar .navbar-children\' ).hide(); $( \'#navbar-backdrop\' ).removeClass( \'visible\' )';
};

JL.navbar.prototype.draw = function(){
	$( "#navbar" ).remove();
	$( "body" ).append( '<div id="navbar"></div><div id="navbar-backdrop" onclick="' + this.hide_all_option_children_html() + '"></div>' );
	this.update_html();
};

/*
-----------------
| Example Usage |
-----------------

new JL.navbar({
	title    : 'Page Title',
	dropdown : 'click',
	options  : [
		{
			name : 'Option 1',
			url  : 'https://www.ssec.wisc.edu'
		},
		{
			name    : 'Option 2',
			onclick : 'console.log(123);'
		},
		{
			name     : 'Option 3',
			children : [
				{ name : 'Child 1', url : 'https://www.ssec.wisc.edu' },
				{ name : 'Child 2', onclick : 'console.log(456);' },
				{ name : 'Child 3' },
			]
		},
		{
			name     : 'Option 4',
			children : [
				{ name : 'Child 4', url : 'https://www.ssec.wisc.edu' },
				{ name : 'Child 5', onclick : 'console.log(456);' },
				{ name : 'Child 6' },
				{ name : 'Child 7', url : 'https://www.ssec.wisc.edu' },
				{ name : 'Child 8', onclick : 'console.log(456);' },
				{ name : 'Child 9' },
			]
		},
		{
			name     : 'Option 5',
			children : []
		},
		{
			options    : [
				{ name : 'Option 1' },
				{ name : 'Option 2', selected : true },
				{ name : 'Option 3' }
			],
			attributes : {
				id       : 'select-dropdown',
				onchange : 'do_something( this.value );',
			}
		},
		{
			info : {
				label : 'Name',
				value : 123
			}
		},
		{
			search     : true,
			attributes : {
				id          : 'search-bar',
				onkeyup     : 'on_search();',
				placeholder : '&#xf002;  Search',
			}
		}
	]
});
*/

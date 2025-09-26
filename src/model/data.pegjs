{
	input = input.split(/\r?\n/)
    	.filter(l => {
        	const trimmed = l.toString().trim();
            return trimmed.length > 0 && !trimmed.startsWith('#');
        })
        .join('\n') + '\n';
}

start = items:(variant / ship / outfit / @other_line eol)* !.
{
    return items.reduce(
        ({ ships, outfits, variants }, it) => {
            if(it) {
                const map = { 'ship': ships, 'variant': variants, 'outfit': outfits };
                const { type, attributes, ...item } = it;
                map[type][item.name] = { ...item, ...attributes };
            }
            return { ships, outfits, variants };
        },
        { ships: {}, outfits: {}, variants: {} });
}

ship = vars:(decl { return { guns: 0, turrets: 0, bays: 0, attributes: [] }; })
    'ship' _ name:string eol (tab attr:ship_line eol {
        if(attr) {
            if(attr == 'gun') ++vars.guns;
            else if(attr == 'turret') ++vars.turrets;
            else if(attr == 'bay') ++vars.bays;
            else vars.attributes.push(...(Array.isArray(attr)? attr : [attr]));
        }
    })*
{
    vars.attributes = Object.fromEntries(vars.attributes.filter(a => a))
    return {
        type: 'ship',
        name,
        ...vars,
    };
}

variant = vars:(decl { return { guns: null, turrets: null, bays: null, attributes: [] }; })
    'ship' _ base:string _ name:string eol attributes:(tab attr:variant_line eol{
        if(attr) {
            if(attr == 'gun' || attr == 'turret') {
                vars.guns ??= 0;
                vars.turrets ??= 0;
            } else if(attr == 'bay') {
                vars.bays ??= 0;
            }
            if(attr == 'gun') ++vars.guns;
            else if(attr == 'turret') ++vars.turrets;
            else if(attr == 'bay') ++vars.bays;
            else if(attr == 'remove bays') vars.bays = 0;
            else vars.attributes.push(...(Array.isArray(attr)? attr : [attr]));
        }
    })*
{
    vars.attributes = Object.fromEntries(vars.attributes.filter(a => a))
    return {
        type: 'variant',
        base,
        name,
        ...vars,
    };
}

outfit = attributes:(decl { return []; })
    'outfit' _ name:string eol (tab attr:outfit_line eol {
        if(attr) {
            attributes.push(...(Array.isArray(attr)? attr : [attr]));
        }
    })*
{
    attributes = Object.fromEntries(attributes.filter(a => a))
    return {
        type: 'outfit',
        name,
        attributes,
    };
}

ship_line = gun / turret / bay / sprite|1| / thumbnail|1| / ship_attributes / other_line

variant_line = gun / turret / bay / sprite|1| / thumbnail|1|  / remove_bays / variant_attributes / other_line

gun = @'gun' _ num _ num other_line?
turret = @'turret' _ num _ num other_line?
bay = @'bay' _ id _ num _ num other_line?
remove_bays = $'remove bays'
sprite = @'sprite' _ @string;
thumbnail = @'thumbnail' _ @string;

outfit_line = line:(weapon / thumbnail|1| / attribute|1| / other_line |1|)
{
    return line;
}

ship_attributes = 'attributes' @(eol tab tab @attribute_line)*

variant_attributes = 'add attributes' @(eol tab tab @attribute_line)*

attribute_line = attribute / other_line

attribute = @id _ @value (_ @value)?

weapon  = 'weapon' @(eol tab tab @weapon_attribute)*
weapon_attribute = attribute / other_line

other_line = @&. (!eol .)+

value = string / num
id = $[a-zA-Z0-9_]+ / string
num = n:$('-'? ([0-9]+ ('.' [0-9]*)? / [0-9]* '.' [0-9]+)) { return Number(n); }
string = '"' @$[^"]+ '"' / '`' @$[^`]+ '`'

tab = @&. '\t'
_ = @&. ' '+
eol = @&. _? '\n'

decl = &{ return true; }

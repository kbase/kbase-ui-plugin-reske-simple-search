## functional html

HTML is encoded as function calls utilizing the kb_common/html.tag function.

### Example
```javascript
define(['kb_common/html'], function (html) {
    var t = html.tag,
        div = t('div'),
        span = t('span');
    var h = div({
        style: {
            textAlign: 'center'
        },
        id: 'myid'
    }, [
        'Hi, this is functional ',
        span({style: fontStyle: 'italic'}}, 'HTML'),
        '. I hope it works for you as well as it has for me.'
    ]);
});
```

There are 3 main components to this:
- import the kb_common/html module
- create a tag function for each html tag that will be used
- compose a section of markup by a set of nested tag functions.

### the kb_common/html module

This module contains a few functions to facilitate working with html. It is static - it does not require initialization. By far the most commonly used function is ```tag```.

- Note that the tag function is captured as t, to make tag definition easier.

The tag function simply creates a, urm, function which generates html for a given tag. It caches the generator function at the module level (in the html module), so after the first call to create a given tag generator, subsequent calls will simply return that generator function.

How does it work?

- define a tag generator like ```var div = t('div');```. Now ```div('hi')``` will created ```<div>hi</div>```.

A tag generator function takes two arguments, but either or both may be omitted.

tagGenerator(attribs, children)

#### attribs

The first argument is the tag attributes. It is a simple object with attribute names as keys and attribute values as key values.

E.g.

```javascript
div({id:'myspan'}, 'hi')
```

creates

```html
<div id="myspan">hi</div>
```

There are some special rules for keys and values.

- upper case letters in keys are converted to lower case and prefixed with a dash (-). Thus ```fontSize``` becomes ```font-size```. This facilitates the plain typing of attributes objects, without fussing with quoting keys in order to use dashes.
- values should normally be strings; of course they may be computed as you wish
- values which are numbers are simply converted to strings
- values which are boolean are treated as boolean attributes -- the attribute key is simply included (without the ="value") if true, omitted if false

The ```style``` attribute is treated specially. It may have an object value which itself is transformed into a style-formatted string.

E.g.

```javascript
div({style: {fontSize: '110%', color: 'green'}}, 'hi')
```

becomes
```html
<div style="font-size: 110%; color: green">hi</div>
```

#### children

The second argument is the tag children -- text or tags which are composed within the tag.

It may take the form of

- a string
- a tag function
- an array of strings or tag functions
- an array of any of the above (i.e. nested arrays is ok)

It is easiest to think of the children as always being a flat array of either strings or tag functions, and strings as being converted to text nodes and and tags into html element nodes.

When a plain string or tag generator is provided, it is promoted to an array of such. When arrays are nested they are flattened.

Although a string may contain markup (and indeed a generator function simply emits a string) in practice one should never do this; use generators for any markup.



#### summary

If you use this pattern you will find that your markup is idiomatic javascript. It is easy to debug, because your errors will very likely be javascript syntax errors, and caught by your editor or js tools.

It is easy to write, because it encourages camelCase and avoids string-wrapping of keys.

It pretty much eliminates the error of unterminated html tags, because the closing of a generator function means the same thing, and you can't avoid closing a generator function if you want your code to run!

It allows all sorts of functional composition and computation of markup. E.g. you can (and should) breakup up large swathes of markup into functions which can be composed within each other just like generator tags. Ad-hoc markup or attribute values can be computed with just plain javascript expressions.

It eliminates the need for specialized template languages and their limitations.

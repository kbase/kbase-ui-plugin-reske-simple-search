# Design Patterns

## functional html

Do not use markup embedded within strings; rather, use functional markup as provided by the kb_common/html module's tag generator function ```tag```.

This will save lots of headache. Functional html is easy to type, read, debug, extend, refactor, conditionally render, etc.

It is easy to type because it uses javascript idioms; easy to read for the same but also because html markup structure, a tree of html elements, is very similar to javascript object literal structure, which can form a tree of javascript objects and values.

It is easy to debug because it is javascript -- mistakes are often syntax errors, or object structural errors. Errors within strings of markup -- well, you are on your own because your editor and js tools will not help there.

Compared to jquery style markup building, it is much more readable and composable. Readable because it follows the same pattern as the markup -- the same ordering, the same tree structure. Composable because it is easy to break a complex bunch of markup into smaller functions which simply compose together naturally. jquery can be used that way, but because markup composition requires chaining onto a jquery object there tend to be many interruptions in the flow.

Compared to a templating system like mustache, handlebars or jinja, you don't need to learn any new tag delimiters or mini-languages. After having written thousands of lines of templating and functional html, I can say that although templating systems are still critical tools, in our context, markup required for implementing widgets and components, I have never been tempted to use them after having switched to functional markup.

Finally, compared to React's JSX. Well, JSX is very similar to functional html, in that it moves the markup closer to the code. However, JSX requires special editor support as well as compilation tooling. Similarly it uses javascript for logic, and has some conventions which require special syntax for some tags and attributes. In fact, one of the future exploratory projects for functional html is to generate react components rather than jsx (using the same or similar api, but generating calls to the react api rather than directly generating markup.) Maybe not, we'll see...

[read more](patterns/functional-html.md)

## components in module

Knockout Components are fully contained within an AMD module file, including viewmodel, template, styles, and helper functions.

Components do not register themselves - rather the plugin's config.yml file contains list of component name to module mappings, which the ui uses to instantiate and register components.

It is envisioned that a component module may contain other utility, such as a spec for the viewmodel parameters. In my opinion this is one of the missing features of components -- the viewmodel parameters are not defined anywhere -- but there are three places which depend on their implicit definition: the calling code which binds a value to the component, the component markup itself which contains a reference to the parameter, and the component itself which consumes the parameter. Getting something wrong in there is one of the most common sources of errors and confusion, especially when components and their viewmodel params interfaces get large and complex.

 If the component module contains a definition of the viewmodel params, it would be possible for the component caller to ensure it is adhering to this spec, and the component viewmodel could use the same spec to validate incoming params.


## view model hierarchy and responsibilities

When using knockout components, the viewmodel of one component serves as the basis for any parameters provided to subcomponents. Therefore the viewmodels potentially form a hierarchy or tree of viewmodels. In designing a set of components, this should be taken into account to provide the appropriate abstraction at each node -- there is no hard and fast rule...

## powerful top level component

It can be useful to assign superpowers to a top level component, which serves then as the state model for the app formed by the top level component. The top level can create a single VM which is threaded from one component to the next, but only if the sub-component is participating actively in that model. Components may be more generic and not recognize or even be passed this vm.

## pass through components

Within a tree of related components with state shared as a top level params property, some components may not be participating but may be "in the middle" of the app. Component middleware if you will. An example is a tabset, which will be used to open new tabs related to the app, but the tabset itself is unaware of the app, yet the components within tabs are. In this case the middleware component will provide a "hosted vm" parameter which contains the state of the component which is ignored by the tabset, but passed to the the components inserted into tabs, which recognize it.

## css in code

When possible, define css in code, using globally unique classnames, and injecting the stylesheet into the component itself.

This solves the problem of style inheritance, class name clashes, very long class names to avoid clashes, and generally the non-determinism of just hoping that naming conventions will protect one's styles.

Tip: The kb_common/html module's makeStyles function will do the trick, as shown in the example below.


### Example
```javascript
var styles = html.makeStyles({
    header1: {
        css: {
            fontSize: '110%'
        }
        pseudo: {
            hover: {
                backgroundColor: "pink"
            }
        }
    }
});
var html = div([
    styles.sheet,
    div({
        class: styles.classes.header1
    }, 'Hi This is a Header')
]);
```

This produces an object like this

```javascript
{
    sheet: '<style>...</style>',
    classes: {
        header1: 'header1_kb_html_1edd3452-33d7-44aa-99b9-e753bfbea71e'
    },
    def: 'the same object fed into the makeStyles function'
}
```

Note that with this utility, you can simply use the generated classname located at styles.classes.<style property name> within your code. You don't need to worry about the actual class name. However, it is useful to know it will be prefixed with "<style property name>", such as ```header1``` in the example above, like ```header1_kb_html_1edd3452-33d7-44aa-99b9-e753bfbea71e``` (snipped from actual output). This assists in debugging styling issues.

# Data Search

## Widgets and Components

```
    v2/data/main(widget) + v2/data/mainViewModel
        reske-search/data/search/ui
            reske-search/data/search/controls
            tabset2
                reske-search/data/search/summary
                reske-search/data/search/cart
                reske-search/data/search/browser (multiple tabs)
                    reske-search/error
                    reske-search/<type>/header
                    reske-search/<type>/browse
```

where ```<type>``` may be any the types supported in the summary:

- genome
- assembly
- pairedEndLibrary
- singleEndLibrary
- narrative
- genomeFeature
- assemblyContig

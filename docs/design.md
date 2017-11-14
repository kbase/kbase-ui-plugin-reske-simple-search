# Design Doc

There are two main (and one minor) component of the reske search tools.

1. Data Search
2. Narrative Browser
3. Object Search

The Data Search is the primary, general purpose data search tool. It searches across all RESKE search indexes, over public and private data.

The Narrative Browser is a specialized search tool targeted at rapid and easy navigation of a Narratives, both private, public, and shared.

The Object Search tool is a developer tool for raw searches across reske search indexes. It is was the initial (day 1) prototype, and still serves to expose raw functionality of the reske search api.

## Overview

The RESKE search tools are contained within a single kbase-ui plugin, data-search. Each of the tools is mapped to a corresponding path, and handled by a top level panel widget. Inside the panel widget, all other components are, well, knockout components.

The plugin's config.yml file maps all knockout components to a component id. We use a namespaced string for the id, in which the first component is the plugin id, and the subsequent paths are determined by the structure of the plugin.

All components are contained within a single module, and a module file may contain at most one plugin. The kbase-ui ko-component service maps the module to the component id (in config.yml) and registers it globally in knockout.

All component styles are contained within the module. The practice of css in a separately loaded file is deprecated.

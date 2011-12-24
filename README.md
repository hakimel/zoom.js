# zoom.js

Enables a minimal JS API for zooming in on specific points or DOM elements.

*Note that this is only a proof of concept so don't use it for anything important.*

[Try out the demo](http://lab.hakim.se/zoom-js/).

# Usage

#### Zoom in on an element:

```
  zoom.in({ 
    element: document.querySelector( 'img' ) 
  });
```

#### Zoom in on a point:

```
  zoom.in({
    x: 100,
    y: 200,
    width: 300,
    height: 300
  });
```

```
  zoom.in({
    x: 100,
    y: 200,
    scale: 3
  });
```

#### Reset
```
  zoom.out();
```

# License

MIT licensed

Copyright (C) 2011 Hakim El Hattab, http://hakim.se
# Silverengine Terminal (indev)

Standalone terminal script, resembles the OSX terminal.
Part of the [Silverengine Framework](http://silverengine.tk).

[Live example](http://thieudev.com/terminal/)


## Features

Maintains state even after browser restarts/page reloads.
State includes;
- Position
- Shown/hidden
- All responses written to terminal


No additional HTML, CSS or JS dependencies.


Supports all modern browsers.


## Usage

Include the script near the end of your head.
```html
	<script src="silverengine-terminal.js"></script>
</head>
```
That's it, it's running now, now press CTRL+Q or Home to open it, enter "help" to get started.


## Todo

- Create configuration options (priority, at the moment you can't do much with this code).
- Write little API for custom stuffs.
- Add [resizing](http://github.com/Mat-thieu/Resizor-JS)


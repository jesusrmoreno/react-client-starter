* [How does our build work?](#how-does-our-build-work)
* [Where should you place new assets?](#where-should-you-place-new-assets)
* [Importing images in code](#importing-images-in-code)
* [Importing images in scss](#importing-images-in-scss)
* [Why does static folder exist?](#why-does-static-folder-exist)

# How does our build work?

We use [webpack](https://webpack.github.io/) to build our application.  It bundles all of our assets (HTML, JavaScript, CSS, Images, Fonts, JSON files, etc) into a compact set of resources ready to be deployed.

How does it know what assets to include?  In general, it performs dependency analysis.  It starts with your "main" JavaScript file ([src/main.js](../src/main.js) in this case), and starts following all of the `import` statements to find all of the dependencies.

Webpack has special configuration "loader" rules which tell it how to process the different types of files that are imported.

* When we import a `.js` file, the configured [babel-loader](https://github.com/babel/babel-loader) runs [babel](http://babeljs.io/) to transpile the ES6 into ES5.
* When we import a `.scss` file, we have configured webpack to run through this pipeline:
 * [sass-loader](https://github.com/jtangelder/sass-loader) - compiles the SCSS into CSS
 * [css-loader](https://github.com/webpack/css-loader) - parses the css and finds all dependencies (e.g. all `url(...)` and `@import`).  These dependencies are added to webpack's dependency list and included in the final bundle.
 * [style-loader](https://github.com/webpack/style-loader) - tells webpack how to embed the css rules in the final bundle (e.g. in an external css file or within the JavaScript bootstrap code)
* When we import an image file (`.jpg`, `.svg`, `.png`, ...) or font file (`.woff`, ...), we use the [url-loader](https://github.com/webpack/url-loader) to include the asset in the bundle.  If the file is "small", then it gets embedded directly as a [data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs).  If the file is "big", then it gets added to the webpack bundle and a cache-busting URL is generated for it.

Finally, our build includes all files found in the [src/static](../../../tree/master/src/static) folder.

# Where should you place new assets?

When you need to include a new image asset (or font or whatever) in the app, you may be tempted to place the asset in the `src/static` folder.  Do not do this.  Placing assets in the `static` folder has the following negative consequences:

* Defeats dependency analysis - asset gets included in the bundle even if later refactorings cause us to stop referencing it in our app
* Poor caching performance - The web server caching is configured to be very conservative with files in the `static` folder.  This means that the browser will either not cache or will use a caching strategy that requires extra round trips to the server
* URL Generation - You are forced to hand-code the correct URL to your asset.  This URL can and will change depending upon the deployment target we use when building the app.  Thus your hand-coded URL may not always be correct

Instead you should place your assets in the same folder as your component and `import` them!

# Importing images in code

If you want to reference an image from your JavaScript code, just `import` it like you would import a JavaScript file.  What you will get is actually the URL of the compiled asset.  Maybe an example will help:

```es6
import React from 'react';
// yes.png and no.png are in the same folder as this source file
import yesUrl from './yes.png';
import noUrl from './no.png';

const yesStyle = {
    backgroundImage: yesUrl,
};
const noStyle = {
    backgroundImage: noUrl,
};

// ...
```

If you were to put a breakpoint in your code and look at the values of `yesUrl` and `noUrl`, then you'd either see a `data:ABC11013...` style url that has the image encoded in it, or you'd see a path like `/yes-307982309823.png`.  The junk at the end of the filename is a hash of the image contents.  If, during development, you modify the image, this hash changes.  The web server is configured to heavily cache these types of files.  Since the filename changes if the file changes, the browser can cache these forever without any worries about having a stale image.

# Importing images in scss

Just reference the image using a relative path almost like normal.  The trick is to obey the path rules we use when using the `import` statement in our JavaScript code:

* start your url with a `./` to identify an image relative to the scss file (e.g. `url(./yes.png)`)
* Don't start with anything to start from the `src` folder (e.g. `url(components/componentX/yes.png`)

Just using `url(...)` will cause the build to add that image asset to the bundle and will do the same name mangling that we discussed in the previous section.  Here's an example:

```scss
.slider {
  // ...
  .empty {
    background-image: url(./default-slider.png);
    background-repeat: no-repeat;
    background-size: auto;
    background-position: center;
  }
}
```

# Why does static folder exist?

The `static` folder exists because there are certain web assets that must be in the root website folder with specific names.  They are part of various web server protocols/conventions.  This is where the various favicon-related files go as well as things like `robots.txt`.

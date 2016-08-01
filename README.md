ngen
=========

A minimal node module for generating Angular2 component skeleton from html tags.

for example, in html we have the code as below:
```
<mytag>
  <mytag1><div>Div Test</div></mytag1>
</mytag>
```
result:

```
@Component({
  selector:'mytag1',
  template:`
      <div>Div Test</div>
  `,
  directives: [],
  styles: []
})
export class Mytag1Component {

}

import { Component } from '@angular/core';
import { Mytag1Component } from '/mytag/mytag1';
@Component({
  selector:'mytag',
  template:`

  <mytag1><div>Div Test</div></mytag1>

  `,
  directives: [mytag1],
  styles: []
})

export class MytagComponent {

}
```
## Link
```shell
C:\Users\jason>cd ngen
C:\Users\jason\ngen>npm link
C:\Users\jason\ngen>ngen
please input source directory that contains html files for generation.
Example: ngen sourceDir destDir
```

## Installation

```shell
  npm install https://github.com/jasondu168/ngen.git
```

## Usage

```js
  var ng = generate("/htmls", "/angular2", "");
```
## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.

## Release History

* 0.1.0 Initial release

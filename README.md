gocsp-fs
=======

Under development.

## example

```js
import { Channel, openRead, openWrite } from 'gocsp'

new Channel()
	.pipe(openRead(path, options))
	.pipe(openWrite(path2, options2))
```

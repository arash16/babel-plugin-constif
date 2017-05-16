# babel-plugin-constif

> This plugin allows Babel to remove remove if conditionals with string literals as condition.

## Example

**In**

```javascript
if ("isDebug")
	console.log(1);
else
	console.log(2);
```

**Out**

```javascript
// IS_DEBUG=true babel script.js
console.log(1);

// IS_DEBUG=false babel script.js
console.log(2);

// babel script.js
if ("isDebug")
	console.log(1);
else
	console.log(2);
```

## Installation

```sh
npm install --save-dev babel-plugin-constif
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```javascript
{
  "plugins": [
    ["constif", {var1: true, var2:false}]
  ]
}
```

### Via CLI

```sh
VAR1=true VAR2=0 babel --plugins constif script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: [
    ["constif", {var1: true, var2:false}]
  ]
});
```

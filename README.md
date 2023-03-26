# GPTZero-API

A TS library for GPTZero featuring getting raw response from api.gptzero.me and exporting the result to different formats.

## Installation

Simply run `npm i gptzero-api` and you're good to go.

## Use

In your code, you can import the classes by

```ts
import {GPTZeroTextAPI,GPTZeroFileAPI} from 'gptzero-api'
```

To use this class, try

```ts
var GPTZeroFile=new GPTZeroFileAPI(YOUR_API_KEY_HERE);
```

The two classes works almost the same, expect `GPTZeroTextAPI` uses the `text` endpoint while the other uses the `file` endpoint.

The package now supports exporting GPTZero response in raw format (see api.gptzero.me for further detail) and in pdf format. Planning to add support for exports in `markdown` and `html` format.

You are welcome to submit PRs and feature requests if you want to contribute to this package.

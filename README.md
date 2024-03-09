# Kompleter - jQuery auto-completion plugin

![Github action workflow status](https://github.com/steve-lebleu/kompleter/actions/workflows/build.yml/badge.svg?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/steve-lebleu/kompleter/badge)](https://www.codefactor.io/repository/github/steve-lebleu/kompleter)
![GitHub Release](https://img.shields.io/github/v/release/steve-lebleu/kompleter?logo=Github)
[![GPL Licence](https://badges.frapsoft.com/os/gpl/gpl.svg?v=103)](https://github.com/steve-lebleu/kompleter/blob/master/LICENSE)

Self-completion plugin with HTML 5, CSS 3, JavaScript and jQuery > 3.1.1.

## > Demo

Demo: https://fabrik.konfer.be/kompleter/

## > Page

Github page: https://steve-lebleu.github.io/kompleter

## Installation

``` bash 
$ npm i kompleter --save
```

## How to use ?

Retrieve kompleter styles in the head section of your page:

``` html 
<head>
...
<link href="path_to_kompleter_css" rel="stylesheet" type="text/css" />
...
</head>
```

Retrieve jQuery and Kompleter.js:

``` html 
<script src="directory_of_your_jquery/jquery.js"></script>
<script src="directory_of_your_kompleter/jquery.kompleter.js"></script>
```

Into HTML code, place the following code with your data attributes values:

* **data-url:** path to the data provider, which can be API endpoint or JSON file. Returned data format must be JSON.</li>
* **data-filter-on:** property name of JSON object on which apply filter at keyup.
* **data-fields:** JSON object fields to display, coma separated.

``` html 
<input type="text" id="auto-complete" class="input--search" autocomplete="off" placeholder="Enter a city name ..." data-url="" data-filter-on="" data-fields="" />
```
 
Invoke:

``` javascript
$('#auto-complete').kompleter({});
```

## Options

Following options are available:

* **animation**: string, style of animation ('fade','slide','none')
* **animationSpeed**: int, speed of the animation
* **begin**: boolean, check expression from beginning of the value if true, on the whole word if false
* **onChar**: int, number of chars completed in input before kompleter firing
* **maxResults**: int, number of max results to display
* **beforeDisplay**: function(e, dataset), function, callback fired before display of result set
* **afterDisplay**: function(e, dataset), function, callback fired after display of result set
* **beforeFocus**: function(e, element), function, callback fired before focus on result item
* **afterFocus**: function(e, element), callback fired after focus on result item
* **beforeComplete**: function(e, dataset, element), callback fired before insertion of result
* **afterComplete**: function(e, dataset, element), callback fired after insertion of result

### Analyze and refactoring to Vanilla version 

Two ways of usage: static, dynamic local, dynamic api

#### Static

Consumer give the full dataset when kompltr is initialized

-> No lazy loading
-> async onKeyup callback optional
-> Cache available
-> Filtering is made at kompletr side

#### Dynamic

Consumer give nothing when kompltr is initialized

-> Lazy loading
-> async onKeyup callback required
-> Cache available
-> Filtering is made at client side

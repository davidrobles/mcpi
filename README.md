# Monte Carlo PI

This JavaScript program estimates the value of PI using Monte Carlo simulations. Please refer to this [blog post](http://davidrobles.net/blog/estimating-pi-using-monte-carlo-simulations/) for more information.

## Demo

![Monte Carlo PI Demo](demo.png "Monte Carlo PI Demo")

## How to Run

```javascript
var model = new MCPI.Model();
var controller = new MCPI.Controller({
    model: model,
    sampleSize: 25000,
    stepSize: 100
});
controller.loop();
```

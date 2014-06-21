# Monte Carlo PI

This JavaScript program estimates the value of PI using Monte Carlo simulations. Please refer to this [Blog post](http://davidrobles.net/blog/estimating-pi-using-monte-carlo-simulations/) for more information.

## Demo

![alt text](img/demo.png "Logo Title Text 1")

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

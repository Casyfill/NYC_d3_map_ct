// console.log(CITY);
var VIEW;
vega.scheme('se_cat', ['#032765', '#0195E5', '#387D7D',
  '#00AAE5', '#3FE8DF', '#E0E527', '#7329FF'
]);

vega.scheme('se_cat_binary', ['#0195E5', '#032765']);
vega.scheme('se_cat_accent', ['#032765', '#3FE8DF', '#E0E527', '#7329FF']);


// RETURN specs
function getVisParams() {
  let specsfile = 'specs/' + CITY + '.vg.json';
  return {
    "data": specsfile
  };
}

function onError(error) {
  console.log(error);
  var window = d3.select('#window');
  window.selectAll("*").remove();
  window.append("img")
    .attr("src", "assets/404.jpg")
    .attr("id", "v404")
    .attr("alt", "something went wrong...");
}

let settings = getVisParams(); // get app settings
var view;
var loader = vega.loader();
loader.load(settings['data'])
  .then(function (data) {
    render(JSON.parse(data));
  })
  .catch(function (error) {
    onError(error)
  });



function prepare_tooltip_opts(spec) {

  for (i = 0; i < spec['fields'].length; i++) {
    if (spec['fields'][i]['render']) {
      var f = spec['fields'][i]['render'];
      console.log(f)
      spec['fields'][i]['render'] = new Function(f.arguments, f.body);
    }

  }

  console.log(spec);
  return spec
}


function render(vlSpec) {

  let opt = {
    "actions": false,
    "mode": "vega-lite",
    "renderer": 'svg'
  };

  if (!vlSpec["$schema"].includes("vega-lite")) {
    opt.mode = 'vega';
  }

  vegaEmbed('#Container-Data', vlSpec, opt)
    .then(function (result) {
      // result.view is the Vega View, vlSpec is the original Vega-Lite specification
      VIEW = result.view;
      let w = $('div#Container-Data').width();
      let h = $('div#Container-Data').height();
      console.log(w, h);
      VIEW.width(w).height(h).run();
      // VIEW.logLevel(vega.Debug);
      vegaTooltip.default(VIEW);
    })
    .catch(console.error);
}


$(window).on('resize', function () {
  //     // assume I have an element and viewInstance variables representing
  //     // the container, and vega View instance, respectively.
  // let element = $('div#Container-Data')
  let w = window.innerWidth;
  let h = window.innerHeight - 50;
  console.log('window size:', w, h);

  VIEW.width(w).height(h).run();
  // console.log(VIEW.getState());

});
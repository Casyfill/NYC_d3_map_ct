var max_width = 950,
    max_height = 700;

//  Community colors
var comm_colors = [ "red", "blue", "green", "yellow", "purple" ];
var ƒ = d3.f;

//  MAP
var projection = d3.geoMercator()
  .center([-73.94, 40.70])
  .scale(60000)
  .translate([(max_width) / 2, (max_height) / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#container")
  .append("svg")
  .attr("width", "100%")
  .attr("height", max_height)
  .append("g");


  // geography
  var parks = svg.append("g").attr('id','parks');
  var bs = svg.append("g").attr('id','boros');
  var cts = svg.append("g").attr('id','cts');


// title
var title = d3.select("body")
    .append("div")
    .append("h1")
    .attr('id', 'title')
    .text("NYC tracts v0.0.2");


//  CARD
var card = d3.select("body")
    .append("div")
    .attr("id", 'info');


var nhd_name = card.append("p")
                   .attr('id', 'tooltip')


// table
var table = card.append('table')
                .attr('class', 'fixed');

var tbody = table.append('tbody');





function handleMouseOver(d, i) {  // Add interactivity
  nhd_name.text( d.properties.NTAName + ', ' + d.properties.BoroCT2010);
  populate_table(d,i);
}


function handleMouseOut(d, i) {
    nhd_name.text('    ');
  }


//  LOAD DATA

d3.json("data/nyct2010_17a3_topo.json", function(error, nyb) {
  console.log('tracts uploaded, v3')

  populate_empty_table();
  get_boroughs();
  get_parks();

  var fresh_ctss = topojson.feature(nyb, nyb.objects.nyct2010_17a3).features;
  // ctss = parse_add_csv(fresh_ctss);  // match data from csv by BoroCT2010
  d3.csv("data/communities.csv", function(error, comms)
          {

              //prices is an array of json objects containing the data in from the csv
              csv = comms.map(function(d)
              {
                  //each d is one line of the csv file represented as a json object
                  // console.log("Label: " + d.CTLabel)
                  return {"community": d.community, "label": d.BoroCT2010} ;
              })

              csv.forEach(function(d, i) {
                fresh_ctss.forEach(function(e, j) {
              if (d.label === e.properties.BoroCT2010) {

                  e.properties.community = parseInt(d.community)
                  }
                })
              })

          cts.selectAll(".tract")
              .data(fresh_ctss)
              .enter().append("path")
              .attr("class", "tract")
              .attr("d", path)
              .attr("id", function(d) {
                return d.properties.BoroCT2010;})
              .attr("nhd_name", function(d) {
                return d.properties.NTAName;})
              .style('fill', function(d){
                  console.log(d.properties.community)
                  return comm_colors[d.properties.community];})
              .style("fill-opacity", .2)
              .on("mouseover", handleMouseOver)
              .on("mouseout", handleMouseOut)
              .style('fill', function(d) {return comm_colors[d.properties.community]});

        })

})



// RESIZE

d3.select(window).on('resize', sizeChange);

function sizeChange() {
      var mwidth  = Math.min($("#container").width(), max_width);
      console.log(mwidth)
      d3.select("svg").attr("transform", "scale(" + mwidth/700 + ")");
      $("svg").height(Math.min($("#container").width()*.86, max_height));


}

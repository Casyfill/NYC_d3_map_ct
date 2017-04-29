var max_width = 950,
    max_height = 700;
var initial_width = $(window).width(), initial_height = $(window).height();

console.log('Its me, your old script!')
//  MAP
var projection = d3.geoMercator()
  .center([-73.94, 40.72])
  .scale(60000)
  .translate([(max_width) / 2, (max_height) / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#svg-container")
  .append("svg")
  .attr("class", "map");
  // .attr("min-height", 700);


  // geography
  // var parks = svg.append("g").attr('id','parks');
var bs = svg.append("g").attr('id','boros');
var cts = svg.append("g").attr('id','cts');
var t = textures.lines()
          .size(3)
          .strokeWidth(.5)
          .stroke("white")
          .background("grey");

svg.call(t);

//  Community colors
var comm_colors = [ "red", "blue", "green", "yellow", "purple",
                    "orange", "teal", "pink", "steelblue", 'magenta',
                    "black", "grey", "darkgreen", "darkred", "darkblue",
                    "lime", "beige", "azure", "aliceblue", 'burlywood', 
                    "darkseagreen", 'darkslategray', 'forestgreen', 'khaki','lightsalmon',
                    'mediumturquoise', 'olivedrab', 'plum', 'salmon', 'sandybrown'];
var ƒ = d3.f;


get_color = function(d) {
  if(d.properties.hasOwnProperty('community')){
    return comm_colors[d.properties.community];
  } else {
    return t.url()
  }
}


// title
// var title = d3.select("body")
//     .append("div")
//     .append("h1")
//     .attr('id', 'title')
//     .text("NYC tracts v0.0.2");


//  CARD
var card = d3.select("#infocard")
//     .append("div")
//     .attr("id", 'info');


var nhd_name = card.append("p")
                   .attr('id', 'tooltip')


// Tract Name

// table
var table = d3.select("#infocard")
              .append('table')
              .attr('class', 'fixed');

var tbody = table.append('tbody');






function handleMouseOver(d, i) {  // Add interactivity
  populate_table(d,i);
}


function handleMouseOut(d, i) {
  empty_table();
  }


//  LOAD DATA

d3.json("data/ct2010s.json", function(error, nyb) {
  console.log('tracts uploaded, v3')

  populate_empty_table();
  // get_boroughs(nyb);

  var fresh_ctss = topojson.feature(nyb, nyb.objects.ct2010).features;
  // ctss = parse_add_csv(fresh_ctss);  // match data from csv by BoroCT2010
  d3.csv("data/communities.csv", function(error, comms)
          {

              //prices is an array of json objects containing the data in from the csv
              csv = comms.map(function(d)
              {
                  //each d is one line of the csv file represented as a json object
                  // console.log("Label: " + d.CTLabel)
                  return {"community": d.community, "label": d.tract} ;
              })

              csv.forEach(function(d, i) {
                fresh_ctss.forEach(function(e, j) {
              if (d.label === e.properties.geoid) {
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
                return d.properties.geoid;})
              .attr("nhd_name", function(d) {
                return d.properties.NTAName;})
              .on("mouseover", handleMouseOver)
              .on("mouseout", handleMouseOut)
              .style('fill', function(d) { return get_color(d)})

          bs.selectAll(".boro")
              .data(topojson.merge(nyb, nyb.objects.ct2010.geometries))
              .enter().append("path")
              .attr("class", "boro")
              .attr("d", path)

          console.log('boroughs created')

        })

})



// RESIZE

d3.select(window).on('resize', MapSizeChange);

function MapSizeChange() {
      var ratio  = Math.min($(window).height()/initial_height, $(window).width() / initial_width);
      d3.select("svg").attr("transform", "scale(" + ratio + ")");

}

if($(window).width() >=770){
  width = $(window).width()*0.666;
} else { width = $(window).width()}
var height = $(window).height()


//  MAP
var projection = d3.geoMercator()
  .center([-73.98, 40.72])
  .scale(width*74)
  .translate([(width) / 2, (height) / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#svg-container")
  .append("svg")
  .attr("class", "map");
  
// geography
  
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



// color for communities, NA texture elsewise
get_color = function(d) {
  if(d.properties.community != ''){
    return comm_colors[d.properties.community];
  } else {
    return t.url()
  }
}

var comm_stats;

//  Right Side
var card = d3.select("#infocard")

// CT table
var ct_table = d3.select("#infocard")
              .append('table')
              .attr('class', 'fixed')
              .attr('id', 'ct_table');

var ct_tbody = ct_table.append('tbody');

// Community tab;e
var cm_table = d3.select("#stats")
                 .append('table')
                 .attr('class', 'fixed')
                 .attr('id', 'cm_table');

var cm_tbody = cm_table.append('tbody');


function handleMouseOver(d, i) {  // Add interactivity
  if(d.properties.community != ''){
    populate_ct_table(d,i);
    decolorize_other_communities(d,i);
    populate_cm_table(get_community_population(d.properties.community, comm_stats));
  }
}


function handleMouseOut(d, i) {
  empty_table(null_ct, ct_tbody);
  empty_table(null_cm, cm_tbody);
  colorize_back();
  }


//  LOAD DATA

d3.json("data/ct2010s.json", function(error, nyb) {
  console.log('tracts uploaded, v3')

  populate_empty_table(null_ct, ct_tbody);
  populate_empty_table(null_cm, cm_tbody);

  var fresh_ctss = topojson.feature(nyb, nyb.objects.ct2010).features;
  // ctss = parse_add_csv(fresh_ctss);  // match data from csv by BoroCT2010
  d3.csv("data/combined_data.csv", function(error, csv_data)
          {   // part_all_  part_hidden_  part_recipr_

              comm_stats = get_community_stats(csv_data, 'part_all_');
              
              //  Probably the Slowest part of the script, double loop
              //prices is an array of json objects containing the data in from the csv
              csv = csv_data.map(function(d)
              {
                  //each d is one line of the csv file represented as a json object
                  // console.log("Label: " + d.CTLabel)
                  return {"community_all": d.part_all_, 
                          "community_hidden": d.part_hidden_,
                          "community_recipr": d.part_recipr,
                          "population" :d.population,
                          "geoid": d.tract} ;
              })
              csv.forEach(function(d, i) {
                fresh_ctss.forEach(function(e, j) {
              if (d.geoid === e.properties.geoid) {
                  e.properties.community = d.community_all
                  e.properties.population = d.population
                  }
                })
              })

          cts.selectAll(".tract")
              .data(fresh_ctss)
              .enter()
              .append("path")
              .attr("class", "tract")
              .attr("d", path)
              .attr("id", function(d) {
                return d.properties.geoid;})
              .attr("nhd_name", function(d) {
                return d.properties.NTAName;})
              .style('opacity', 0.8)
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
      // var ratio  = Math.min($(window).height()/initial_height, $(window).width() / initial_width);
    //   // d3.select("svg").attr("transform", "scale(" + ratio + ")");
    console.log('resizing!')
    if($(window).width() >=770){
        width = $(window).width()*0.666;
    } else { width = $(window).width()}
    var height = $(window).height() 

    // update projection
    projection
        .translate([width / 2, height / 2])
        .scale(width*78);

    // resize the map
    cts.selectAll(".tract").attr('d', path);

}


//  DECOLORIZE OTHER COMMUNITIES
function decolorize_other_communities(d,i){
  
  cts.selectAll(".tract")
       .filter(function(dd) { return dd.properties.community != d.properties.community; })        // <== This line
       .style('opacity', .2 );
}

function colorize_back(d, i){
  cts.selectAll(".tract")
     .style('opacity', 0.8);
} 


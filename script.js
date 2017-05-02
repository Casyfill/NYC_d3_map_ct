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

var MODE = 'part_all_';
var comm_stats;
var all_comm_stats;
var data;

//  Community colors
var comm_colors = [ "red", "blue", "green", "yellow", "purple",
                    "orange", "teal", "pink", "steelblue", 'magenta',
                    "black", "grey", "darkgreen", "darkred", "darkblue",
                    "lime", "beige", "azure", "aliceblue", 'burlywood', 
                    "darkseagreen", 'darkslategray', 'forestgreen', 'khaki','lightsalmon',
                    'mediumturquoise', 'olivedrab', 'plum', 'salmon', 'sandybrown'];



// color for communities, NA texture elsewise
get_color = function(d, mode) {

  if(d.properties[mode] != ''){
    return comm_colors[d.properties[mode]];
  } else {
    return t.url()
  }
}



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
console.log(null_cm)

function handleMouseOver(d, i) {  // Add interactivity
  if(d.properties[MODE] != ''){
    decolorize_other_communities(d,i, MODE);
    populate_ct_table(d,i);
    populate_cm_table(get_community_population(d.properties[MODE], all_comm_stats[MODE]));
  }
}


function handleMouseOut(d, i) {
  empty_table(null_ct, ct_tbody);
  empty_table(null_cm, cm_tbody);
  colorize_back();
  }


//  LOAD DATA
d3.queue(3)
  .defer(d3.json, "data/ct2010s.json")
  .defer(d3.csv, "data/combined_data.csv")
  .defer(d3.json, "data/communities_stats2.json")
  .await(ready);


function ready(error, nyc, csv_data, comm_properties){
  if (error) throw error;
  populate_empty_table(null_ct, ct_tbody);
  populate_empty_table(null_cm, cm_tbody);

  data = csv_data;
  all_comm_stats = get_all_community_stats(data, comm_properties);
  console.log(all_comm_stats);

  var fresh_ctss = topojson.feature(nyc, nyc.objects.ct2010).features;  
  

  csv = csv_data.map(function(d)
     {
         //each d is one line of the csv file represented as a json object
         // console.log("Label: " + d.CTLabel)
         return {"part_all_": d.part_all_, 
                 "part_hidden_": d.part_hidden_,
                 "part_recipr_": d.part_recipr_,
                 "population" :d.population,
                 "geoid": d.tract} ;
     })

  csv.forEach(function(d, i) {
      fresh_ctss.forEach(function(e, j) {
              if (d.geoid === e.properties.geoid) {
                  e.properties.part_all_ = d['part_all_']
                  e.properties.part_hidden_ = d['part_hidden_']
                  e.properties.part_recipr_ = d['part_recipr_']
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
              .style('fill', function(d) { return get_color(d, MODE)})

}
  
  


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
       .filter(function(dd) { return dd.properties[MODE] != d.properties[MODE]; })        // <== This line
       .style('opacity', .2 );
}

function colorize_back(d, i){
  cts.selectAll(".tract")
     .style('opacity', 0.8);
} 


// RADIO BUTTON SWITCH
$('input[type="radio"]').on('change', function(e) {
    MODE = document.querySelector('input[name="partition"]:checked').value;
    console.log('Mode is:', MODE);
    update_partition(MODE);
});


function update_partition(MODE){
  cts.selectAll(".tract")
     .style('fill', function(d) { return get_color(d, MODE)})

}
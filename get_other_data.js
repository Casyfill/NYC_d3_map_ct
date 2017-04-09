
get_parks = function(){
  d3.json("data/parks_t.json", function(error, prks) {
  console.log('parks uploaded')

  parks.selectAll(".park")
      .data(topojson.feature(prks, prks.objects.parks).features)
      .enter().append("path")
      .attr("class", "park")
      .attr("d", path);
    })
};

get_boroughs = function(){
    d3.json("data/borough.json", function(error, b) {
        console.log('borough uploaded')

        bs.selectAll(".boro")
            .data(b.features)
            .enter().append("path")
            .attr("class", "boro")
            .attr("d", path)
      })
};

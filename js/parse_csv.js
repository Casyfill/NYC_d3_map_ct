// CSV
function parse_add_csv(cts){
      var new_cts = cts
      console.log('parsing csv');
      d3.csv("data/communities.csv", function(comms)
          {

              //prices is an array of json objects containing the data in from the csv
              csv = comms.map(function(d)
              {
                  //each d is one line of the csv file represented as a json object
                  // console.log("Label: " + d.CTLabel)
                  return {"community": d.community, "label": d.BoroCT2010} ;
              })

              csv.forEach(function(d, i) {
                new_cts.forEach(function(e, j) {
              if (d.label === e.properties.BoroCT2010) {

                  e.properties.community = parseInt(d.community)
                  }
                })
              })
        })
        return new_cts
      }

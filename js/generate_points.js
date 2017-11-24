
let comms = {"1":{"pop":669},
             "2":{"pop":760},
             "3":{"pop":1705},
             "4":{"pop":763},
             "5":{"pop":1121},
             "6":{"pop":1204},
             "7":{"pop":1859},
             "8":{"pop":1364},
             "9":{"pop":1825},
             "10":{"pop":11149},
             "11":{"pop":11579},
             "12":{"pop":11360},
             "13":{"pop":11427},
             "14":{"pop":11939},
             "15":{"pop":1650} //,
             // "16":{"pop":1982},
             // "17":{"pop":11137},
             // "18":{"pop":12525},
             // "19":{"pop":1593},
             // "20":{"pop":213},
             // "21":{"pop":2531},
             // "22":{"pop":2595},
             // "23":{"pop":2558},
             // "24":{"pop":2768}
           };


function get_commTracts(polys){
  console.log(polys[100])
  // var pdata = d3.nest().key(function(d) { return d.part_user;}).rollup(function(d) { return turf.union(d);}).entries(polys);
  // console.log(pdata);
  for(var N in comms) {
    N = parseInt(N);
    console.log(N);
    // console.log(data);
    // cdata = d3.set(data.filter(function(d){return d['part_user'] == N}).map(function(d){return d.geoid}))
    let ps = polys.filter(function(d){return d.properties.part_user == N});
    // console.log(ps)
    comms[N]['multypoly'] = turf.union.apply(this, ps);
    // comms[N]['multypoly'] = topojson.merge(polys, polys.objects.ct2010.geometries.filter(function(d) { return cdata.has(d.geoid) })).geometries;
  }
  return comms;
}
//
function generate_Users(comms){
  var R = [];

  for(var N in comms) {
    var points = randomPointsOnPolygon(comms[N]['pop'], comms[N]['multypoly'], comms[N]['pop'])
    points.forEach(function(p){R.push({'lon':p.geometry.coordinates[0],
                                       'lat':p.geometry.coordinates[1],
                                       'Community':N})})
  }
  return R
}


function randomPointsOnPolygon(number, polygon, properties, fc) {
  if (typeof properties === 'boolean') {
    fc = properties;
    properties = {};
  }

  if (number < 1) {
    return new Error('Number must be >= 1');
  }

  if(polygon.type !== 'Feature') {
    return new Error('Polygon parameter must be a Feature<(Polygon|MultiPolygon)>');

    if (polygon.geomtry.type !== 'Polygon' || polygon.geomtry.type !== 'MutliPolygon') {
      return new Error('Polygon parameter must be a Feature<(Polygon|MultiPolygon)>')
    }
  }

  if (this instanceof randomPointsOnPolygon) {
    return new randomPointsOnPolygon(number, polygon, properties);
  }

  properties = properties || {};
  fc = fc || false;
  var points = [];
  var bbox = turf.bbox(polygon);
  var count = Math.round(parseFloat(number));

  for (var i = 0; i <= count; i++) {
    if (i === count) {
      if (fc) {
        return featurecollection(points);
      }

      return points;
    }

    var point = turf.randomPoint( 1, { bbox: bbox });

    if (turf.inside(point.features[0], polygon) === false) {
      i = --i;
    }

    if (turf.inside(point.features[0], polygon) === true) {
      point.features[0].properties = properties;
      points.push(point.features[0]);
    }
  }

}

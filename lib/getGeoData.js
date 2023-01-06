async function getGeoData(e) {
  const seamres = await fetch('https://gbank.gsj.jp/seamless/v2/api/1.2.1/legend.html?point=' + e.latlng.lat + ',' + e.latlng.lng);
  const seamtext = await seamres.text();
  var ppup = L.popup().setContent(seamtext);
  var addppup = L.marker(e.latlng).bindPopup(ppup).addTo(map);

}
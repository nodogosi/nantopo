//plotly用
var trace1 = {
  x: [0],
  y: [0],
  name:'ポイント指定点',
  type: 'scatter'
    };

var trace2 = {
  x: [0],
  y: [0],
  name:'標高変化',
  fill: 'tozeroy',
  type: 'scatter',
  mode: 'none'
};
var annotext = [];
var annotext1 = {
      x: 2,
      y: 5,
      xref: 'x',
      yref: 'y',
      text: 'Annotation Text',
      showarrow: true,
      arrowhead: 7,
      ax: 0,
      ay: -40
 };

annotext[0] = annotext1;

var layout = {
//  title:'ポイント間の距離と標高の変化',
//  width:480,
//  height:450,
  legend:{
   bgcolor:'#fafad2',
   x:0.6,
   y:0.1
  },
  xaxis: {
//    domain:[0, 0.7],
    title: {
      text: '距離[m]',
      font: {
//      family: 'Courier New, monospace',
      size: 18
      }
    },
  },
  yaxis: {
    title: {
      text: '標高[m]',
      font: {
//       family: 'Courier New, monospace',
       size: 18
      }
    }
  },
  annotations: annotext,
};

var initlayout = {
  title:'おまちください。。。',
  legend:{
   bgcolor:'#fafad2',
   x:0.6,
   y:0.1
  },
  xaxis: {
//    domain:[0, 0.7],
    title: {
      text: '距離[m]',
      font: {
//      family: 'Courier New, monospace',
      size: 18
      }
    },
  },
  yaxis: {
    title: {
      text: '標高[m]',
      font: {
//       family: 'Courier New, monospace',
       size: 18
      }
    }
  },
  annotations: {
      x: 2,
      y: 5,
      xref: 'x',
      yref: 'y',
      text: 'Annotation Text',
      showarrow: false,
      ax: 50,
      ay: 40
  }
};
var data = [trace1, trace2];

var xTile;
var yTile;
var TileArray = [];
var Tilealt;
//マーカーの緯度経度
var marker_before = [35.206,137.166,2000];
var marker_after = [35.208,137.168,2100];

//マーカーのLatLonクラス保持用配列初期化
var pointlatlng = [];
//マーカーのLatLonクラス設定
/*pointlatlng.push(L.latLng(35.206,137,166,2000));
pointlatlng.push(L.latLng(35.208,137.168,2100));
pointlatlng.push(L.latLng(35.308,137.168,2100));
pointlatlng.push(L.latLng(35.310,137.170,2100));
pointlatlng.push(L.latLng(35.312,137.172,2100));
pointlatlng.push(L.latLng(35.320,137.174,2100));
pointlatlng.push(L.latLng(35.320,137.180,2100));
*/
//緯度1度ごとの距離[m]
const lat_m = 111111.1111;
//経度1度ごとの距離[m]
const lon_m = 89890.776;
//距離刻み[m]
const delta_m = 10;
//累積標高の加算間隔(そのまま加算していくと細かい標高変化を積み上げてしまう。ヤマレコは多分100～200mでやってる
const ruiseki_m = 100;
var lat_hokan = [];
var lon_hokan = [];
//マーカー間の標高用データ配列
var pltlatlng = [];
//累積標高
var ruiseki_alt;
async function getPostData() {
 //補完情報をリセット、原点の設定。
 pltlatlng.length = 0;
 trace1.x.length = 0;
 trace1.y.length = 0;
 trace2.x.length = 0;
 trace2.y.length = 0;
 ruiseki_alt = 0;
 ruiseki_dwnalt = 0;
 let pltindex = 0;

 Plotly.newPlot('stage', data, initlayout);
 
　//2点間の補完計算を繰り返す
 for(let mnum = 0; mnum < pointlatlng.length-1;mnum++){
　//2点間の距離
  kyori = pointlatlng[mnum].distanceTo(pointlatlng[mnum+1]);
  console.log(pointlatlng[mnum].lat,pointlatlng[mnum].lng);
  console.log(pointlatlng[mnum+1].lat,pointlatlng[mnum+1].lng);
  console.log(kyori);
  //delta_mで割って、何点標高を測るか出す
  sokutei_p = parseInt(kyori / delta_m);
  console.log(sokutei_p);
  //delta_mからΔ経度を出す
  delta_lon = delta_m * Math.cos(Math.atan(Math.abs((pointlatlng[mnum+1].lat - pointlatlng[mnum].lat)*lat_m)/Math.abs((pointlatlng[mnum+1].lng - pointlatlng[mnum].lng)*lon_m))) / lon_m;
  //1点目より2点目が西方向であれば、Δ経度の符号反転
  if (pointlatlng[mnum+1].lng < pointlatlng[mnum].lng){
     delta_lon = (-1)*delta_lon;
  }
//  console.log(delta_lon);
  //delta_mからΔ緯度を出す
  delta_lat = delta_m * Math.sin(Math.atan(Math.abs((pointlatlng[mnum+1].lat - pointlatlng[mnum].lat)*lat_m)/Math.abs((pointlatlng[mnum+1].lng - pointlatlng[mnum].lng)*lon_m))) / lat_m;
  //1点目より2点目が南方向であれば、Δ経度の符号反転
  if (pointlatlng[mnum+1].lat < pointlatlng[mnum].lat){
     delta_lat = (-1)*delta_lat;
  }
//  console.log(delta_lat);
  //補完値の算出
  //始点は、一番目の区間の補完値push時のみpush
  if( mnum == 0){
   pltlatlng.push(L.latLng(pointlatlng[mnum].lat,pointlatlng[mnum].lng,0))
  }

  //2点間の緯度経度をpush
  for (let i=1 ; i <= sokutei_p;i++){
   pltlatlng.push(L.latLng(pointlatlng[mnum].lat+i*delta_lat,pointlatlng[mnum].lng+i*delta_lon,0))
  }
  //終点の緯度経度をpush
  pltlatlng.push(L.latLng(pointlatlng[mnum+1].lat,pointlatlng[mnum+1].lng,0))
  //補完区間の標高取得
  for ( ; pltindex < pltlatlng.length; pltindex++){
     lat = pltlatlng[pltindex].lat;
     lon = pltlatlng[pltindex].lng;
     zoom = 14;
     //ピクセル座標
     xPix = Math.floor((lon + 180) / 360 * (1 << (zoom+8)));
     yPix = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * (1 << (zoom+8)));
     //タイル座標
     xTile_tmp = parseInt(xPix / 256);
     yTile_tmp = parseInt(yPix / 256);
     //タイル内のポイント
     xTilePoint = parseInt(xPix % 256);
     yTilePoint = parseInt(yPix % 256);
     //標高タイルがなければ取ってくる
     if ((xTile_tmp != xTile)||(yTile_tmp != yTile)){
        xTile = xTile_tmp;
        yTile = yTile_tmp;
        console.log("タイル取得");
        const response = await fetch("https://cyberjapandata.gsi.go.jp/xyz/dem/"+zoom+"/"+xTile_tmp+"/"+yTile_tmp+".txt");
        const text = await response.text();
        let arr = text.split('\n');
        //1次元配列を2次元配列に変換
        for(let i = 0; i < arr.length; i++){
          //空白行が出てきた時点で終了
          if(arr[i] == '') break;
          //","ごとに配列化
          TileArray[i] = arr[i].split(',');
        }
        console.log("タイル更新");
      }else{
         console.log("タイルいらｎ");
      }
      Tilealt = TileArray[yTilePoint][xTilePoint];
      pltlatlng[pltindex].alt = TileArray[yTilePoint][xTilePoint];
      //ポイント間の累積標高測定 累積標高の加算間隔ごとに加算する
      if (pltindex * delta_m >= ruiseki_m) {
         if (((pltlatlng[pltindex].alt - pltlatlng[pltindex-(ruiseki_m / delta_m)].alt) > 0) && ((pltindex * delta_m) % ruiseki_m == 0)){
            ruiseki_alt = ruiseki_alt + parseFloat(pltlatlng[pltindex].alt) - parseFloat(pltlatlng[pltindex-(ruiseki_m / delta_m)].alt);
         }
      }
      //（下降）ポイント間の累積標高測定 累積標高の加算間隔ごとに加算する
      if (pltindex * delta_m >= ruiseki_m) {
         if (((pltlatlng[pltindex].alt - pltlatlng[pltindex-(ruiseki_m / delta_m)].alt) < 0) && ((pltindex * delta_m) % ruiseki_m == 0)){
            ruiseki_dwnalt = ruiseki_dwnalt + parseFloat(pltlatlng[pltindex].alt) - parseFloat(pltlatlng[pltindex-(ruiseki_m / delta_m)].alt);
         }
      }
      console.log(lat,lon,xTile_tmp,yTile_tmp,xTilePoint,yTilePoint,Tilealt,ruiseki_alt);
  }
 }
 //plotly用データの準備
 trace1.x.push(0);
 trace1.y.push(pointlatlng[0].alt);
 trace2.x.push(0);
 trace2.y.push(parseFloat(pltlatlng[0].alt));
 let dis = 0;
 for (let i=0 ;i < pointlatlng.length-1;i++){
   dis = dis + pointlatlng[i].distanceTo(pointlatlng[i+1]);
   trace1.x.push(dis);
   trace1.y.push(parseFloat(pointlatlng[i+1].alt));
 }
 dis = 0;
 for (let i=0 ;i < pltlatlng.length-1;i++){
   dis = dis + pltlatlng[i].distanceTo(pltlatlng[i+1]);
   trace2.x.push(dis);
   trace2.y.push(parseFloat(pltlatlng[i+1].alt));
 }
//Annotation追加。とりあえず終点だけつける
 for (let i=0 ;i < 1　;i++){
  if ( i == 0 ){
　　layout.annotations[i].x = trace1.x[pointlatlng.length-1];
　　layout.annotations[i].y = trace1.y[pointlatlng.length-1];
    layout.annotations[i].text = '累積標高(上昇)='+String(Math.floor(ruiseki_alt))+'[m]' + '<br>累積標高(下降)='+String(Math.floor(ruiseki_dwnalt))+'[m]'+ '<br>予想コースタイム='+String( Math.floor( (Math.floor(ruiseki_alt)/100 - Math.floor(ruiseki_dwnalt)/200 + dis/1000)/4 * 100)/100)+'[h]';
    layout.annotations[i].showarrow =  true;
    layout.annotations[i].arrowhead =  7;
    layout.annotations[i].ax =  0;
    layout.annotations[i].ay =  -40;
  }
 }

 Plotly.newPlot('stage', data, layout);

}
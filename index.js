var method = GeoGrid.prototype;

function GeoGrid(n) {
    if(n<1) this._n = 1; //div by zero err
    this._n = n;
    this._RADIUS = 6371;
    this._GRID_WIDTH_EQUATOR = this._RADIUS/this._n;
    this._GRID_TO_LON = this._n/360;
    this._GRID_TO_LAT = this._n/(180*2);
    //this._KM_TO_GRID_UNIT = 2*this._RADIUS*MATH.PI/this._n;
    this._GRID_UNIT_TO_KM = this._n/(2*this._RADIUS*Math.PI);
    console.log('grid unit to km'+this._GRID_UNIT_TO_KM);
    
};

method.geoHash = function(lat, lon) {
   //this._cellWidth;
   return Math.ceil( (lat +90) * this._GRID_TO_LAT ) * this._n + Math.ceil( (lon +180) *this._GRID_TO_LON) ;

};
//possibleHashes returns the hashes you should search 
method.possibleHashes = function(lat, lon, r, cb) {
   var hashes = [];
    var err = null;
   //find the hashes inside or on the circle
    var centerHash = this.geoHash(lat,lon);
    var gridLat = this.transLat(lat);
    var gridLon = this.transLon(lon);

    //boundary too close to one of the poles
    console.log('south pole dist:'+this.distGrid(gridLat, 0,0,0));
    console.log('north pole dist:'+this.distGrid(gridLat, 0,this._n/2, 0 ));
    if( (this.distGrid(gridLat, 0,0,0) <=r) || (this.distGrid(gridLat, 0,this._n/2, 0 ) <=r) ){
        console.log('too close to pole');
        return cb(err, hashes);
    }
        
    
    //find top hash for the circle
     //find the top point of the circle
     //var topHash = Math.ceil(this.trans(lat) - r * this._GRID_UNIT_TO_KM)*this._n + Math.ceil(this.trans(lon));
     var topGridLat = gridLat + r* this._GRID_UNIT_TO_KM;
    // console.log('topGridLat:'+topGridLat);
     var topGridLon = gridLon;
     var topHash = Math.ceil(topGridLat)*this._n + Math.ceil(topGridLon);
     console.log('top hash:'+topHash);
   //  var topWithinCenterCell = false;
     if(topHash > centerHash){

        var vt = Math.ceil(topGridLat)-Math.ceil(gridLat);     

        do{
           var hl = 0;
           var hr = 0;
           do{ 
             var brk = false;
             //check the left to top cell intersects with the circle
             //console.log('Math.floor(gridLon)+hl'+Math.floor(gridLon)+hl); console.log('dist top left:'+this.distGrid( Math.ceil(gridLat+vt)-1, Math.floor(gridLon)+hl, gridLat, gridLon));
               
               
             if( this.distGrid( Math.ceil(gridLat+vt)-1, Math.floor(gridLon)+hl, gridLat, gridLon) <= r) 
                hl--;
             else
                brk = true;	     
             
             //right of top cell
            //   console.log('vt: '+vt); console.log('Math.ceil(gridLat+vt)-1:'+ Math.ceil(gridLat+vt-1));
              // console.log(' Math.ceil(gridLon)+hr:'+ Math.ceil(gridLon)+hr);
               //console.log('dist form top right:'+this.distGrid( Math.ceil(gridLat+vt)-1, Math.ceil(gridLon)+hr, gridLat, gridLon)); 
             if( this.distGrid( Math.ceil(gridLat+vt)-1, Math.ceil(gridLon)+hr, gridLat, gridLon) <= r) 
                hr++;
              else
                brk=true;

           } while(!brk);
           if(gridLon + hl < 0){ //boundary left
               for(var b = Math.floor(gridLon)+hl; b<0; b++){
                   hashes.push(Math.ceil(gridLat+vt+1)*this._n - b);
                   console.log('geoGrid left boundary');
               }
               hl=Math.floor(gridLon);
           }
           if(gridLon + hr > this._n){ //boundary right
               for(var b = Math.ceil(gridLon+hr); b > this._n; b--){
                   hashes.push(Math.ceil(gridLat+vt-1)*this._n +b );
                   console.log('geoGrid right boundary');
               }
               hr = Math.floor(this._n -gridLon);
           }
           // console.log('hl'+hl+', hr:'+hr);
           for (var i = hl; i<=hr; i++){ 
             hashes.push(centerHash + vt*this._n + i);
           }
            vt--;
        } while (vt>0) 

     } //else {
    //    topWithinCenterCell = true;
    // }
     //center line
     if(gridLat%1 != 0){
         console.log('center line');
     }
     
     //bottom
          var bottomGridLat = gridLat - r* this._GRID_UNIT_TO_KM;
    // console.log('topGridLat:'+topGridLat);
     var bottomGridLon = gridLon;
     var bottomHash = Math.ceil(bottomGridLat)*this._n + Math.ceil(bottomGridLon);
     console.log('top hash:'+bottomHash);
   //  var topWithinCenterCell = false;
     if(bottomHash < centerHash){

        var vb = Math.ceil(bottomGridLat)-Math.ceil(gridLat);     

        do{
           var hl = 0;
           var hr = 0;
           do{ 
             var brk = false;
             //check the left to top cell intersects with the circle
             //console.log('Math.floor(gridLon)+hl'+Math.floor(gridLon)+hl); console.log('dist top left:'+this.distGrid( Math.ceil(gridLat+vt)-1, Math.floor(gridLon)+hl, gridLat, gridLon));
               
               
             if( this.distGrid( Math.ceil(gridLat+vt)-1, Math.floor(gridLon)+hl, gridLat, gridLon) <= r) 
                hl--;
             else
                brk = true;	     
             
             //right of top cell
            //   console.log('vt: '+vt); console.log('Math.ceil(gridLat+vt)-1:'+ Math.ceil(gridLat+vt-1));
              // console.log(' Math.ceil(gridLon)+hr:'+ Math.ceil(gridLon)+hr);
               //console.log('dist form top right:'+this.distGrid( Math.ceil(gridLat+vt)-1, Math.ceil(gridLon)+hr, gridLat, gridLon)); 
             if( this.distGrid( Math.ceil(gridLat+vt)-1, Math.ceil(gridLon)+hr, gridLat, gridLon) <= r) 
                hr++;
              else
                brk=true;

           } while(!brk);
           if(gridLon + hl < 0){ //boundary left
               for(var b = Math.floor(gridLon)+hl; b<0; b++){
                   hashes.push(Math.ceil(gridLat+vt+1)*this._n - b);
                   console.log('geoGrid left boundary');
               }
               hl=Math.floor(gridLon);
           }
           if(gridLon + hr > this._n){ //boundary right
               for(var b = Math.ceil(gridLon+hr); b > this._n; b--){
                   hashes.push(Math.ceil(gridLat+vt-1)*this._n +b );
                   console.log('geoGrid right boundary');
               }
               hr = Math.floor(this._n -gridLon);
           }
           // console.log('hl'+hl+', hr:'+hr);
           for (var i = hl; i<=hr; i++){ 
             hashes.push(centerHash + vt*this._n + i);
           }
            vt--;
        } while (vt>0) 

     }
    
 

   //check for boundary condition


   //check for poles

   return cb(err, hashes);  
};

method.transLon= function(Lon){
//translates lat or lon to your grid's lat lon
  return (Lon +180 ) *this._GRID_TO_LON; 
};
    
method.transLat= function(Lat){
//translates lat or lon to your grid's lat lon
  return (Lat +90) *this._GRID_TO_LAT; 
};


method.distGrid= function( lat1, lon1, lat2, lon2){
   // console.log('lat1, lon1 '+lat1+','+lon1);
    var lon1Unit = Math.sin(lat1/this._n *Math.PI *2);
    var lon2Unit = Math.sin(lat2/this._n *Math.PI *2);
    var factor = (lon1Unit+lon2Unit)/2;
//    console.log('lon2 ' + lon2 +'  lon1 '+lon1);
  //  console.log('lon1Unit :'+lon1Unit + '  lon2unit: '+ lon2Unit +'lon2-lon1:' +(lon2-lon1)+ '    lon2 * lon2Unit -lon1*lon1Unit:'+(lon2 * lon2Unit) +':::' +(lon1*lon1Unit));
  return Math.sqrt( Math.pow((lat2-lat1),2) + Math.pow((lon2  -lon1)*factor,2) ) / this._GRID_UNIT_TO_KM;
};

module.exports = GeoGrid;

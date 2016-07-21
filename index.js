var method = GeoGrid.prototype;

function GeoGrid(n) {
    if(n<1) this._n = 1; //div by zero err
    this._n = n;
    this._RADIUS = 6371;
    this._GRID_TO_LON = this._n/360;
    this._GRID_TO_LAT = this._n/(180*2);
    this._GRID_UNIT_TO_KM = this._n/(2*this._RADIUS*Math.PI);

    
};

method.hash = function(lat, lon) {
   return Math.floor( (lat +90) * this._GRID_TO_LAT ) * this._n + Math.floor( (lon +180) *this._GRID_TO_LON) ;

};

method.geoHash=function(lat,lon){
    if(lon<0) //left boundary
        lat++;
    if(lon>this._n) //rt boundary
        lat--; 
    return Math.floor(lat)*this._n + Math.floor(lon);
};

method.neighbours9 = function (lat, lon, cb) {
     var centerHash=this.hash(lat,lon);
     var hashes = [ 
          centerHash - this._n,
          centerHash,
          centerHash + this._n,
                  ];
    if(centerHash % this._n == 1){
        //left boundary
        hashes.push(centerHash -1 + this._n*2);
        hashes.push(centerHash -1 + this._n);
        hashes.push(centerHash -1);
    }else{
        hashes.push(centerHash - this._n -1 );
        hashes.push(centerHash - 1);
        hashes.push(centerHash + this._n -1 )
    }
    
    if(centerHash % this._n == 0){
        //right boundary
        hashes.push(centerHash+1);
        hashes.push(centerHash - this._n +1);
        hashes.push(centerHash - this._n*2 +1);
    }else{
        hashes.push(centerHash - this._n +1 );
        hashes.push(centerHash + 1);
        hashes.push(centerHash + this._n +1 )
    }
    return cb(hashes);
     
};


//possibleHashes returns the hashes you should search 
method.possibleHashes = function(lat, lon, r, cb) {
   var hashes = [];
    var err = null;
   //find the hashes inside or on the circle
    var centerHash = this.hash(lat,lon);
    var gridLat = this.transLat(lat);
    var gridLon = this.transLon(lon);

    //boundary too close to one of the poles
    if( (this.distGrid(gridLat, 0,0,0) <=r) || (this.distGrid(gridLat, 0,this._n/2, 0 ) <=r) ){
        hashes.push(centerHash);
        return cb(hashes);
    }
    
    //top semi circle excluding center row
     var endGridLat = gridLat + r* this._GRID_UNIT_TO_KM;
     if(Math.floor(endGridLat) > gridLat){ 
        var vt = Math.floor(endGridLat)-Math.floor(gridLat);     
        do{
           var hl = 0;
           var hr = 0;
           do{ 
             var brk = false;
             //check the left to end cell intersects with the circle
             if( this.distGrid( Math.floor(gridLat)+vt, Math.floor(gridLon)+hl, gridLat, gridLon) <= r) 
                hl--;
             else
                brk = true;	     
             
             //right of end cell
             if( this.distGrid( Math.floor(gridLat)+vt, Math.ceil(gridLon)+hr, gridLat, gridLon) <= r) 
                hr++;
              else
                brk=true;

           } while(!brk);

           for (var i = hl; i<=hr; i++){ 
             hashes.push(this.geoHash(gridLat+vt,gridLon+i));
           }
            vt--;
        } while (vt>0) 

     }
     //center row
     endGridLon = gridLon-r*this._GRID_UNIT_TO_KM; 
     hl = -Math.floor(gridLon) + Math.floor(endGridLon);

     endGridLon = gridLon + r*this._GRID_UNIT_TO_KM;
     hr = - Math.floor(gridLon) + Math.floor(endGridLon);
      for(var i = hl; i <=hr; i++){
         hashes.push(this.geoHash(gridLat,gridLon+i));
     }
     
     //bottom semi
     endGridLat = gridLat - r* this._GRID_UNIT_TO_KM;

     if(Math.floor(endGridLat) < gridLat){

        var vb = Math.floor(endGridLat)-Math.floor(gridLat);     

        do{
           var hl = 0;
           var hr = 0;
           do{ 
             var brk = false;
 
               
             if( this.distGrid( Math.floor(gridLat)+vb+1, Math.floor(gridLon)+hl, gridLat, gridLon) <= r) 
                hl--;
             else
                brk = true;	     

             if( this.distGrid( Math.floor(gridLat)+vb+1, Math.ceil(gridLon)+hr, gridLat, gridLon) <= r) 
                hr++;
              else
                brk=true;

           } while(!brk);
 
           for (var i = hl; i<=hr; i++){ 
             hashes.push(this.geoHash(gridLat+vb, gridLon+i));
           }
            vb++;
        } while (vb<0) 

     }
      
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
    var factor = Math.sin((lat1+lat2)/this._n *Math.PI );
  return Math.sqrt( Math.pow((lat2-lat1),2) + Math.pow((lon2  -lon1)*factor,2) ) / this._GRID_UNIT_TO_KM;
};

module.exports = GeoGrid;

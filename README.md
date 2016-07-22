# node-geo
node.js geo-hash module, easy to use with dynamoDB

#Concept

Define a grid, just like the lat-lon grid for the earth surface. As in Lat-Lon, there are 180 latitudes, 360 longitudes, you can define a grid of n/2 x n (See Grid size section below for what n should be for your design).
Then we number these n/2 rows of n cells from 0 (first cell at the south pole) to n-1 (n th cell at the bottom row)
through n for cell directly above cell 0 (second row) and so on. 

##Usage
Typical use case:
- Store lat,lon data grouped by geohash 
- Get array of hashes to query the database for proximity points

```
var node-geo = require('node-geo);
var grid = new node-geo(32768); // create a grid of 32768 longitudes and 32768/2 latitudes

var hash = grid.hash( -33.865143, 151.209900, cb(err,data) )
//returns the hash of the grid cell containing Sydney's lat/lon

//**proximity hashes**
var hashes = grid.neighbours9( lat, lon, cb(err,data) );
// returns an array of 9 hashes, 1 of the cell where lat, lon falls, and 8 of the surrounding
//neighbours9() is 6x more efficient than possibleHashes()

var hashes = grid.possibleHashes( lat, lon, r, cb(err,data));
// returns array of hashes of all the cells which are overlaped by a circle of radius r centered at lat, lon 
```
##Some Tips: 
- Store lat as local secondary indexed column. Then build your query to search between the possible lat values, eg: `grid.minMax(lat, lon, r).minLat` and `grid.minMax(lat, lon, r).maxLat`, instead of all lat values within the hash cell. Filter the query for results between `grid.minMax(lat, lon, r).minLon` and `grid.minMax(lat, lon, r).maxLon`

- Earth's radius is 6371km, i.e, circumfrence is 40030km. If you use n = 40030/5 = 8006, your grid cell will be 5km wide at the equator. If your app allows user to search within 5km, neighbour9() will return 9 cells which will cover more than 5km
- Near arctic circle, neighbours9() returned hashes may cover less (eg 2.5km at 60deg) due to convergence of longitude lines. 
- You may use neighbours9() for lat values in tropics and possibleHashes() at high latitudes 


### Grid Size and DynamoDB
Some more constraints that will influence the grid cell size that you choose 
- If dynamoDB query result exceeds **1MB** within your grid cell (before filter), the query stops and results are returned with the LastEvaluatedKey element to continue the query in a subsequent operation. Therefore, if your grid cell is too large, you will have to make more queries. If you are storing just {hash, lat, lon, reference-to-detailed-record} then your item size will be < 100bytes. DynamoDB query can lookup around 10,000 such records in one hit (within 1MB limit). If your user is to search within a radius `r` km, and the maximum point density is `d` /km2, then 
` 2 r x 40030/n x d < 10000
=> n >  8 r d 
Eg: your user will typically within 15km radius, point density is 100 per sq km, then n must be > 12000 `
- The grid size must remain within the dynamoDB contraints of 10TB of data per hash if you have lat and long as Local Secondary Indexes (You can calculate the lat long min, max and pass in KeyConditionExpression)
- DynamoDB's batchGet cannot be used for proximity searcges as you do not know the primary key. You will have to fire async queries for the hashes of proximity cells.

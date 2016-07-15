# node-geo
node.js geo-hash module for dynamodb 

#Concept

Define a grid, just like the lat-long grid for the earth surface. 
For example sake, let's say we divide the earth surface with a grid system of 32768 x 32768
(32768 is 2^15, but you may choose any other number depending on the constraints discussed below).
To reference with the lat-long values, let's say that latitude 90N and longitude 0 is the top left corner of first cell of our grid system. The cells are numbered l to 32768 in the first row, then 32769 to 2x32768 in the second row etc and the last cell of the last row is numbered 32768x32768.

Since there are 360 degrees in lat and 360 degrees in long, each degree of lat represents 32768/360 = 91.0222 gridlines in our example system.

Sydney's lat,lon is -33.865143, 151.209900. These are -180 to 180 degree scale, and we can convert these to 0-360 scale by adding 180 to the values. From this lat long value, we can calculate our grid row as:
Math.ceil( (-33.865143 +180) x 32768/360 ) =13302
and from lon value, we can calculate the grid cell in the row as:
Math.ceil( (151.209900 +180) x 32768/360 ) =30148
This gives us a cell number of 13302x32768 + 30148 = 435910084

435910084 is a hash that can be used to store all the lat,lon points that fall within the grid cell of Sydney's coordinates. 
This cell is surrounded by 8 cells with the following hashes

> 435910084-32768-1 NE | 435910084-32768  north| 435910084-32768+1 e NW

> 435910084-1 to the east     | [ [ [ [ [ 435910084 ] ] ] ] ] | 435910084+1 to the west

> 435910084+32768-1  SE | 435910084+32768  south| 435910084+32768+1  SW


_Some useful info:
Earth's radius is 6371km. 
Therefore, surface area of 510,049,428.8 km2
and circumfrence is 40030.13978_

At equator, a grid cell's width is 40030.13978 / 32768 = 1.2216km. So, **if you are looking for all the points in your database within 1km radius of Sydney, your query doesn't need to search beyond the 9 hashes above**. Similarly, if you were to search for all the points within 5km radius, you can query the hashes from 5 cells to the left, through 5 to the right, 11 cells in a row, and 5 rows above, 5 rows below , ie., 121 rows. 

These are a lot of queries. So the width of your cell is important. 
#Some other constraints that influence the grid cell size
- If dynamoDB query result exceeds 1MB within your grid cell (before filter), the query stops and results are returned with the LastEvaluatedKey element to continue the query in a subsequent operation. Therefore, if your grid cell is too large, you will have to make more queries
- the grid size must remain within the dynamoDB contraints of 10TB of data per hash if you have lat and long as Local Secondary Indexes (You can calculate the lat long min, max and pass in KeyConditionExpression)
- dynamoDB's batchGet cannot be used if you do not know the primary key, so you have to fire a query for each cell.  
- at 60deg lat, the cell width reduces to half. Therefore, for your Nordic friends searching for a point of interest within 1km, you may have to search 2 cells across. You hope you don't have any users at poles :-)

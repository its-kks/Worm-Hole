module.exports ={
    numToCoordinates
}
function numToCoordinates(n,blockSize,IN_X,IN_Y){
    
    let tens=Math.floor((n-1)/10);
    let ones=(n)%10
    let coordinates=[];
    if(tens%2==0){
        let mul=(ones-1)>=0?(ones-1):9;
        coordinates.push(IN_X+mul*blockSize);
    }
    else{
        let mul=ones!=0?(10-ones):0;
        coordinates.push(IN_X+mul*blockSize);
    }
    coordinates.push(IN_Y-tens*blockSize);
    return coordinates;
}

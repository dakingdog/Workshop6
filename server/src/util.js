function reverseString(str){
	var reversed ="";
	for (var i=1; i<str.length+1; i++){
		reversed+=str[str.length-i];
	}
	return reversed;
}
module.exports.reverseString=reverseString;
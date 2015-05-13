var trees = [
	{y: 4},
	{y: 3},
	{y: 5},
	{y: 2},
	{y: 1}
]

var doubles = trees.map(function(tree) {
	return tree.y * 2
})

console.log(doubles)
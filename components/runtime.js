const letter = (props) => {
    return {
        name: props.name,
        tier: props.tier,
        value: props.tier ** 2,
    };
};

// Tier 1
const E = letter({ name: "E", tier: 1 })
const T = letter({ name: "T", tier: 1 })
const A = letter({ name: "A", tier: 1 })
const I = letter({ name: "I", tier: 1 })
const O = letter({ name: "O", tier: 1 })
const N = letter({ name: "N", tier: 1 })

// Tier 2
const S = letter({ name: "S", tier: 2 })
const H = letter({ name: "H", tier: 2 })
const R = letter({ name: "R", tier: 2 })
const D = letter({ name: "D", tier: 2 })

// Tier 3
const L = letter({ name: "L", tier: 3 })
const C = letter({ name: "C", tier: 3 })
const U = letter({ name: "U", tier: 3 })
const M = letter({ name: "M", tier: 3 })

// Tier 4
const W = letter({ name: "W", tier: 4 })
const F = letter({ name: "F", tier: 4 })
const G = letter({ name: "G", tier: 4 })
const Y = letter({ name: "Y", tier: 4 })

// Tier 5
const P = letter({ name: "P", tier: 5 })
const B = letter({ name: "B", tier: 5 })
const V = letter({ name: "V", tier: 5 })
const K = letter({ name: "K", tier: 5 })

// Tier 6
const J = letter({ name: "J", tier: 6 })
const X = letter({ name: "X", tier: 6 })
const Q = letter({ name: "Q", tier: 6 })
const Z = letter({ name: "Z", tier: 6 })
//planning phase-------------------------------------

//generate 3 letters from tier 1

console.log('welcome to blood letter! select your letters.')
const tier1 = [E,T,A,I,O,N]


    //for loop that goes 3 times to add random selection to array

const selectArray = []
for (let i = 0; i <3; i++) {
    const randIndex = Math.floor(Math.random() * tier1.length);
    selectArray.push(tier1[randIndex])
}
console.log(selectArray)

//generate 10 gold 
let gold = 10
console.log('you have ' + gold + ' gold')

//generate health (first turn: 10)

let health = 10
console.log('you have ' + health + 'health')

//purchase task

console.log('select 3 of the following letters. type them in the order you wish to play them. type ROLL to roll')



//sell task

//purchase item task

//apply item task

//roll task



//end turn task 

//item order task 

//battle phase------------------------------

//compute points for Letter(items

//compute points from letters for player

//compute points for word

//compute points for word items

//compute points from letters for opponent

//compare points to opponent 

//declare winner

//remove health from loser 

//return to planning phase 
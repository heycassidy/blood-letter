# Self-Made AI Algo


## Sort words
1. sort by likeliness of obtaining all word letters in this turn
   1. letters in rack are already obtained: 100%
   2. letters in pool are 100% obtainable if they can be purchased with gold
   3. letters in a pool refresh are dependent on which letters are available in the current round/tier
   4. If gold is too low, letters in the pool and pool refresh have a 0% probability of being obtainable
   5. If the rack is full, letters in the pool and pool refresh have a 0% probability of being obtainable
2. take actions towards obtaining "best word" iteratively until the sort is outdated
   1. actions are all the regular actions, but some actions mark the sort as outdated
   2. Need some function to determine what is the next best action
      1. probably want to try to obtain all the letters first and then re-arrange
      2. Will need to rank freezing letters in there somewhere

### "Best Word" is decided on multiple axis
1. highest score
2. easiest to obtain, e.g. how likely is it we'll actually be able to make the word
There will need to be some balancing factor between those. We want the highest score within a certain probability of obtaining that word
   

### Sort words should be re-calculated every time any of the following actions happen:
1. a letter is purchased
2. a letter is sold
3. the pool is refreshed



### To think about later
- how do we consider freezing and unfreezing?
  - Balance of letter value and probability of getting that letter?
  - letter occurs in a word further down the chain that we might want to try in the future?
- What if the best score isn't a word, but random high-value letters?
  - How do we integrate that into the sort function?
  - In that case, the order of letters doesn't matter
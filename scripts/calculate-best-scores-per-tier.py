import itertools
import os
from tqdm import tqdm

# Get the absolute path of the current script's directory
script_dir = os.path.dirname(os.path.abspath(__file__))
word_list_path = os.path.join(script_dir, "wordlist.txt")

# Read the word list from a text file (each word on a new line)
def get_word_list_from_txt(file_path):
    with open(file_path, "r") as f:
        return set(line.strip() for line in f if line.strip())

# Load the word list from the txt file
word_list = get_word_list_from_txt(word_list_path)


# JSON list of letters with their tier and value
letters = [
    {"name": "e", "tier": 1, "value": 1},
    {"name": "t", "tier": 1, "value": 1},
    {"name": "a", "tier": 1, "value": 1},
    {"name": "i", "tier": 1, "value": 1},
    {"name": "o", "tier": 1, "value": 1},
    {"name": "n", "tier": 1, "value": 1},
    {"name": "s", "tier": 2, "value": 4},
    {"name": "h", "tier": 2, "value": 4},
    {"name": "r", "tier": 2, "value": 4},
    {"name": "d", "tier": 2, "value": 4},
    {"name": "l", "tier": 3, "value": 9},
    {"name": "c", "tier": 3, "value": 9},
    {"name": "u", "tier": 3, "value": 9},
    {"name": "m", "tier": 3, "value": 9},
    {"name": "w", "tier": 4, "value": 16},
    {"name": "f", "tier": 4, "value": 16},
    {"name": "g", "tier": 4, "value": 16},
    {"name": "y", "tier": 4, "value": 16},
    {"name": "p", "tier": 5, "value": 25},
    {"name": "b", "tier": 5, "value": 25},
    {"name": "v", "tier": 5, "value": 25},
    {"name": "k", "tier": 5, "value": 25},
    {"name": "j", "tier": 6, "value": 36},
    {"name": "x", "tier": 6, "value": 36},
    {"name": "q", "tier": 6, "value": 36},
    {"name": "z", "tier": 6, "value": 36}
]

# Function to calculate score
def calculate_score(combination):
    value_sum = sum(letter['value'] for letter in combination)
    word = ''.join(letter['name'] for letter in combination)
    
    if word in word_list:
        # return value_sum + len(word) ** 2
        return value_sum + value_sum ** 2
    return value_sum

# Function to find the best combination for a tier
def find_best_combination_for_tier(tier):
    letters_in_tier = []
    for t in range(1, tier + 1):
        letters_in_tier.extend([l for l in letters if l['tier'] == t])
    
    best_combination = None
    best_score = 0

    # Display a progress bar dynamically as combinations are generated
    pbar = tqdm(desc=f"Processing Tier {tier}", unit="combination", leave=False)

    for r in range(1, 7):
        for combination in itertools.product(letters_in_tier, repeat=r):
            score = calculate_score(combination)
            if score > best_score:
                best_score = score
                best_combination = combination
            pbar.update(1)

    pbar.close()
    return best_combination, best_score

# Find best combinations per tier
for tier in range(1, 7):
    best_combination, score = find_best_combination_for_tier(tier)
    combination_letters = ''.join([l['name'] for l in best_combination])
    print(f"Tier {tier}: Best combination = {combination_letters}, Score = {score}")

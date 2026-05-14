import json
import time
# Import the generator from your existing file
from one_fill_puzzle import OneFillGenerator

def export_levels():
    # Define the sizes requested
    categories = {
        "Easy": [
            (4, 4), (4, 5), (5, 4), (5, 5)
        ],
        "Medium": [
            (4, 6), (6, 4), (6, 5), (6, 6), 
            (5, 7), (7, 5), (6, 7), (7, 6), (7, 7)
        ],
        "Hard": [
            (8, 6), (6, 8), (8, 7), (7, 8), (8, 8)
        ]
    }
    
    levels_per_size = 25
    database = {}

    total_start_time = time.time()

    for category, sizes in categories.items():
        database[category] = {}
        
        for width, height in sizes:
            size_key = f"{width}x{height}"
            print(f"\n========================================")
            print(f"Generating {levels_per_size} puzzles for {size_key} ({category})")
            print(f"========================================")
            
            database[category][size_key] = []
            generator = OneFillGenerator(width, height)
            
            for i in range(levels_per_size):
                # Dynamically adjust density. 
                # Smaller boards need slightly lower density to avoid getting stuck in infinite loops.
                density = 0.65 if (width * height) <= 20 else 0.75
                
                # Generate the puzzle
                puzzle, solution, difficulty = generator.generate_with_implicit_end_optimized(density=density)
                
                # Format the data for TypeScript consumption
                level_data = {
                    "id": f"{size_key}_{i+1}",
                    "width": width,
                    "height": height,
                    "start": puzzle.start,
                    "end": puzzle.end,  # Storing this in case you ever want to draw it, even if implicit
                    "grid": puzzle.grid,
                    "solution": solution,
                    "difficulty": difficulty
                }
                
                database[category][size_key].append(level_data)
                print(f"  [+] Created {size_key} - Level {i+1}/25 ({difficulty})")

    # Export the entire database to a JSON file
    output_filename = "one_fill_levels.json"
    print(f"\nWriting to {output_filename}...")
    
    with open(output_filename, "w") as outfile:
        json.dump(database, outfile, indent=2)
        
    total_time = time.time() - total_start_time
    print(f"\nSUCCESS! Generated {18 * 25} puzzles in {total_time:.2f} seconds.")

def verify_exported_level(category, size_key, level_index):
    import json
    from one_fill_puzzle import OneFillPuzzle

    with open("one_fill_levels.json", "r") as f:
        data = json.load(f)
    
    lvl = data[category][size_key][level_index]
    
    # Reconstruct the puzzle object from JSON data
    puzzle = OneFillPuzzle(lvl['width'], lvl['height'], lvl['grid'], lvl['start'], lvl['end'])
    
    print(f"Checking Level ID: {lvl['id']} | Difficulty: {lvl['difficulty']}")
    print("--- Board Layout ---")
    puzzle.print_board()
    print("--- Intended Solution ---")
    puzzle.print_board(show_solution=lvl['solution'])

if __name__ == "__main__":
    # export_levels()
    # Example: Check the first 6x6 Medium puzzle
    verify_exported_level("Hard", "8x8", 0)
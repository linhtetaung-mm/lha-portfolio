import random
import time
from collections import deque

# Constants
BLOCKED = -1
OPEN = 0

class OneFillPuzzle:
    def __init__(self, width, height, grid, start, end):
        self.width = width
        self.height = height
        self.grid = grid
        self.start = start
        self.end = end

    # def print_board(self, show_solution=None):
    #     """Prints the board beautifully. If a solution path is provided, it draws the path."""
    #     symbols = []
    #     for y in range(self.height):
    #         row = []
    #         for x in range(self.width):
    #             idx = y * self.width + x
    #             if self.start == idx:
    #                 row.append("\033[92m S \033[0m") # Green Start
    #             elif self.end == idx:
    #                 row.append("\033[91m E \033[0m") # Red End
    #             elif self.grid[idx] == BLOCKED:
    #                 row.append("\033[90m███\033[0m") # Dark Block
    #             else:
    #                 if show_solution and idx in show_solution:
    #                     row.append("\033[96m • \033[0m") # Cyan Path
    #                 else:
    #                     row.append(" ◌ ") # Open cell
    #         symbols.append("".join(row))
    #     print("\n".join(symbols))
    #     print()

    def print_board(self, show_solution=None):
        """Prints the board beautifully. If a solution path is provided, it draws directional arrows."""
        
        # 1. Map each cell in the solution to a directional arrow
        arrows = {}
        if show_solution:
            for i in range(len(show_solution) - 1):
                curr = show_solution[i]
                nxt = show_solution[i + 1]
                
                # Compare indices to determine direction
                if nxt == curr + 1:
                    arrows[curr] = "\033[96m → \033[0m" # Cyan Right
                elif nxt == curr - 1:
                    arrows[curr] = "\033[96m ← \033[0m" # Cyan Left
                elif nxt == curr + self.width:
                    arrows[curr] = "\033[96m ↓ \033[0m" # Cyan Down
                elif nxt == curr - self.width:
                    arrows[curr] = "\033[96m ↑ \033[0m" # Cyan Up

        # 2. Render the board
        symbols = []
        for y in range(self.height):
            row = []
            for x in range(self.width):
                idx = y * self.width + x
                
                # Start and End cells act as anchors
                if self.start == idx:
                    row.append("\033[92m S \033[0m") # Green Start
                elif self.end == idx:
                    row.append("\033[91m E \033[0m") # Red End
                    
                # Draw blocked cells
                elif self.grid[idx] == BLOCKED:
                    row.append("\033[90m███\033[0m") # Dark Grey Block
                    
                # Draw the path arrows
                elif show_solution and idx in arrows:
                    row.append(arrows[idx])
                    
                # Empty unvisited cells
                else:
                    row.append("\033[37m ◌ \033[0m") # Dimmed open cell
                    
            symbols.append("".join(row))
            
        print("\n".join(symbols))
        print()

class OneFillSolver:
    def __init__(self):
        pass

    def solve(self, puzzle, max_solutions=2):
        """
        Fast Hamiltonian Path solver using Warnsdorff's, Degree Pruning, and Connectivity Checks.
        Returns: (list_of_solutions, stats_dict)
        """
        W, H = puzzle.width, puzzle.height
        grid = puzzle.grid
        start, end = puzzle.start, puzzle.end

        visited = [False] * (W * H)
        for i, val in enumerate(grid):
            if val == BLOCKED:
                visited[i] = True

        unvisited_count = sum(1 for v in visited if not v)

        # Precompute adjacencies
        adj = [[] for _ in range(W * H)]
        for y in range(H):
            for x in range(W):
                i = y * W + x
                if grid[i] == BLOCKED: continue
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < W and 0 <= ny < H and grid[ny * W + nx] != BLOCKED:
                        adj[i].append(ny * W + nx)

        # Dynamic degrees (number of unvisited neighbors)
        degrees = [0] * (W * H)
        for i in range(W * H):
            if not visited[i]:
                degrees[i] = sum(1 for n in adj[i] if not visited[n])

        solutions = []
        path = [start]
        visited[start] = True
        unvisited_count -= 1
        for n in adj[start]:
            degrees[n] -= 1

        stats = {'backtracks': 0, 'start_time': time.time(), 'time': 0}

        def dfs(curr, unvisited_qty):
            if len(solutions) >= max_solutions:
                return

            if unvisited_qty == 0:
                if curr == end:
                    solutions.append(list(path))
                return

            # Pruning 1: Reached end too early
            if curr == end and unvisited_qty > 0:
                return

            stats['backtracks'] += 1

            # Pruning 2: Aggressive Dead-End Analysis (Degree 0 and 1)
            deg1_count = 0
            for i in range(W * H):
                if not visited[i]:
                    if i != end:
                        if degrees[i] == 0:
                            return  # Impossible to reach and leave
                        if degrees[i] == 1:
                            if curr not in adj[i]:
                                return  # Trapped! Only neighbor is not current
                            deg1_count += 1
                    else:
                        if degrees[i] == 0 and curr not in adj[i]:
                            return  # End cell is blocked off
            
            # If >1 cells have only 1 entry point, we can't visit both without getting stuck
            if deg1_count > 1:
                return

            # Pruning 3: Connectivity Flood Fill
            # Ensure all remaining unvisited cells form a single connected component
            first_unvisited = -1
            for i in range(W * H):
                if not visited[i]:
                    first_unvisited = i
                    break
            
            if first_unvisited != -1:
                bfs_q = deque([first_unvisited])
                bfs_vis = set([first_unvisited])
                while bfs_q:
                    u = bfs_q.popleft()
                    for n in adj[u]:
                        if not visited[n] and n not in bfs_vis:
                            bfs_vis.add(n)
                            bfs_q.append(n)
                if len(bfs_vis) != unvisited_qty:
                    return  # Graph is disconnected

            # Warnsdorff's Heuristic: Sort neighbors by their degree (ascending)
            valid_neighbors = []
            for n in adj[curr]:
                if not visited[n]:
                    # Delay visiting the End cell until it's the absolute last cell
                    if n == end and unvisited_qty > 1:
                        continue
                    valid_neighbors.append((degrees[n], n))

            valid_neighbors.sort(key=lambda x: x[0])

            # Recursion
            for deg, n in valid_neighbors:
                visited[n] = True
                path.append(n)
                for nn in adj[n]: degrees[nn] -= 1
                
                dfs(n, unvisited_qty - 1)
                
                # Backtrack
                for nn in adj[n]: degrees[nn] += 1
                path.pop()
                visited[n] = False

        dfs(start, unvisited_count)
        stats['time'] = time.time() - stats['start_time']
        return solutions, stats


class OneFillGenerator:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.solver = OneFillSolver()

    def has_2x2_block(self, path_set, x, y):
        """Prevents ugly giant open blobs to ensure high-quality aesthetic puzzles."""
        for dx, dy in [(-1, -1), (-1, 0), (0, -1), (0, 0)]:
            if all((x + dx + cx, y + dy + cy) in path_set for cx, cy in [(0,0), (1,0), (0,1), (1,1)]):
                return True
        return False

    def get_valid_walk_moves(self, curr, visited_set):
        x, y = curr % self.width, curr // self.width
        moves = []
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < self.width and 0 <= ny < self.height:
                n_idx = ny * self.width + nx
                if n_idx not in visited_set:
                    # Aesthetic Check: Do not form a 2x2 open area
                    visited_set.add(n_idx)
                    if not self.has_2x2_block(visited_set, nx, ny):
                        moves.append(n_idx)
                    visited_set.remove(n_idx)
        return moves

    def generate_random_walk(self, start_idx, target_length):
        """Generates the actual intended Hamiltonian path FIRST."""
        current_path = [start_idx]
        current_visited = set([start_idx])
        
        def build(curr):
            best_path = list(current_path)
            if len(best_path) >= target_length:
                return best_path

            moves = self.get_valid_walk_moves(curr, current_visited)
            random.shuffle(moves)
            
            for m in moves:
                current_visited.add(m)
                current_path.append(m)
                
                res = build(m)
                if len(res) > len(best_path):
                    best_path = res
                
                current_path.pop()
                current_visited.remove(m)
                
                # Greedily accept the first path that reaches our target
                if len(best_path) >= target_length:
                    break
            return best_path

        return build(start_idx)

    def evaluate_difficulty(self, backtracks):
        """Evaluates puzzle difficulty based on solver constraints."""
        if backtracks < 5: return "EASY"
        if backtracks < 25: return "MEDIUM"
        if backtracks < 150: return "HARD"
        return "EXPERT"

    def get_degree(self, idx, current_grid):
        """Calculates how many open neighbors a cell has."""
        x, y = idx % self.width, idx // self.width
        degree = 0
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < self.width and 0 <= ny < self.height:
                if current_grid[ny * self.width + nx] == OPEN:
                    degree += 1
        return degree
    
    def is_valid_topology(self, grid):
        """
        Runs a fast BFS to ensure all OPEN cells form exactly ONE connected component.
        Also verifies no ugly 2x2 open blobs were created during trap generation.
        """
        open_cells = [i for i, val in enumerate(grid) if val == OPEN]
        if not open_cells: 
            return False

        # 1. Check for 2x2 Blobs (Aesthetic Check)
        for i in open_cells:
            x, y = i % self.width, i // self.width
            if x < self.width - 1 and y < self.height - 1:
                if (grid[y * self.width + x] == OPEN and 
                    grid[y * self.width + (x + 1)] == OPEN and 
                    grid[(y + 1) * self.width + x] == OPEN and 
                    grid[(y + 1) * self.width + (x + 1)] == OPEN):
                    return False # Reject: Contains a 2x2 open blob

        # 2. Fast Flood Fill (Connectivity Check)
        start_node = open_cells[0]
        visited = set([start_node])
        queue = deque([start_node])
        
        while queue:
            curr = queue.popleft()
            x, y = curr % self.width, curr // self.width
            
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < self.width and 0 <= ny < self.height:
                    n_idx = ny * self.width + nx
                    if grid[n_idx] == OPEN and n_idx not in visited:
                        visited.add(n_idx)
                        queue.append(n_idx)
                        
        # If the number of reachable open cells matches the total open cells, 
        # the board is perfectly contiguous.
        return len(visited) == len(open_cells)
    
    def generate(self, density=0.7):
        """
        Orchestrates generation. 
        Loops until it finds a board with exactly ONE unique Hamiltonian Path.
        """
        target_len = int(self.width * self.height * density)
        attempts = 0
        
        print(f"Generating {self.width}x{self.height} puzzle...")
        
        while True:
            attempts += 1
            # Prefer starting on the edges for aesthetic reasons
            sx = random.choice([0, self.width-1, random.randint(1, self.width-2)])
            sy = random.choice([0, self.height-1, random.randint(1, self.height-2)])
            start_idx = sy * self.width + sx
            
            # 1. Generate organic intended path
            intended_path = self.generate_random_walk(start_idx, target_len)
            
            # If walk got trapped too early, retry
            if len(intended_path) < target_len * 0.8:
                continue
                
            # 2. Derive board from path (Rule: Everything not in path is blocked)
            grid = [BLOCKED] * (self.width * self.height)
            for p in intended_path:
                grid[p] = OPEN
                
            end_idx = intended_path[-1]
            
            puzzle = OneFillPuzzle(self.width, self.height, grid, start_idx, end_idx)
            
            # 3. Verify uniqueness
            solutions, stats = self.solver.solve(puzzle, max_solutions=2)
            
            if len(solutions) == 1:
                diff = self.evaluate_difficulty(stats['backtracks'])
                print(f"✓ Success! Unique puzzle found in {attempts} attempts.")
                print(f"Metrics -> Backtracks: {stats['backtracks']} | Solve Time: {stats['time']:.4f}s | Difficulty: {diff}\n")
                return puzzle, solutions[0], diff

    def generate_with_implicit_end(self, density=0.75):
        """Generates puzzles where the end point is a logical dead-end (Degree 1)."""
        attempts = 0
        while True:
            attempts += 1
            # Standard generation
            puzzle, solution, diff = self.generate(density)
            
            # Post-Generation Verification:
            # Check how many neighbors the end_idx has in the final board
            end_idx = solution[-1]
            x, y = end_idx % self.width, end_idx // self.width
            
            open_neighbors = 0
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < self.width and 0 <= ny < self.height:
                    if puzzle.grid[ny * self.width + nx] == 0: # 0 is OPEN
                        open_neighbors += 1
            
            # If open_neighbors == 1, the player HAS to end there. 
            # It's a perfect 'implicit' goal.
            if open_neighbors == 1:
                print(f"Implicit End found! Degree: {open_neighbors}")
                return puzzle, solution, diff

    def generate_with_implicit_end_optimized(self, density=0.75):
        """
        OPTIMIZED: Generates by ensuring the path naturally concludes 
        in a dead-end, reducing rejection rate by up to 90%.
        """
        target_len = int(self.width * self.height * density)
        
        while True:
            # 1. Standard Path Generation
            sx = random.choice([0, self.width-1]) # Prefer starting on corners
            sy = random.choice([0, self.height-1])
            start_idx = sy * self.width + sx
            
            intended_path = self.generate_random_walk(start_idx, target_len)
            if len(intended_path) < target_len: continue
            
            # 2. DERIVE BOARD
            grid = [BLOCKED] * (self.width * self.height)
            for p in intended_path:
                grid[p] = OPEN
            
            # 3. FAST CHECK: Is the end_idx a Degree-1 node?
            # If it's not, we 'shrink' the board by turning the end's 
            # unnecessary neighbors into BLOCKS.
            end_idx = intended_path[-1]
            if self.get_degree(end_idx, grid) > 1:
                # OPTIMIZATION: Instead of retrying, let's try to 'prune' 
                # unnecessary neighbors of the end cell to FORCE it to be degree 1.
                # (This only works if those neighbors aren't part of the path)
                # In our 'path-first' approach, all neighbors are already blocked 
                # unless they are part of the path, so if degree > 1, it means 
                # the path passed NEXT to the end point.
                continue 

            puzzle = OneFillPuzzle(self.width, self.height, grid, start_idx, end_idx)
            
            # 4. UNIQUENESS CHECK (Only run this on boards that pass the degree test)
            solutions, _ = self.solver.solve(puzzle, max_solutions=2)
            if len(solutions) == 1:
                level = "Easy"
                if self.width  >= 8 or self.height >= 8:
                    level = "Hard"
                elif self.width  >= 6 or self.height >= 6:
                    level = "Medium"
                    
                return puzzle, solutions[0], level

    def generate_expert_puzzle(self, density=0.80):
        """
        Generates a puzzle with:
        1. An implicit (unmarked) End point.
        2. A 'Degree 1' end point (tucked in a corner).
        3. At least one 'Dead-End Trap' (another Degree 1 cell that isn't the end).
        """
        attempts = 0
        print(f"Searching for Expert {self.width}x{self.height} layout...")
        
        while True:
            attempts += 1
            # 1. Generate unique puzzle
            puzzle, solution, diff = self.generate(density)
            
            end_idx = solution[-1]
            
            # 2. Analyze the board for 'Tips' (cells with degree 1)
            tips = []
            for i in range(self.width * self.height):
                if puzzle.grid[i] == OPEN and i != puzzle.start:
                    # Count neighbors
                    x, y = i % self.width, i // self.width
                    open_neighs = 0
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < self.width and 0 <= ny < self.height:
                            if puzzle.grid[ny * self.width + nx] == OPEN:
                                open_neighs += 1
                    
                    if open_neighs == 1:
                        tips.append(i)

            # 3. Success Condition:
            # - The real end must be a tip (so it's a valid dead end).
            # - There must be at least one OTHER tip (the trap).
            if end_idx in tips and len(tips) >= 2:
                print(f"Expert layout found! Tips identified: {len(tips)}")
                print(f"Real End: {end_idx} | Traps: {[t for t in tips if t != end_idx]}")
                return puzzle, solution, "EXPERT"
            
            if attempts > 500:
                # If density is too low, traps are rare. Increase density or lower requirement.
                density += 0.01 
                attempts = 0

    def generate_expert_with_traps(self, density=0.75, num_traps=2):
        """
        Generates a base path, intentionally injects false dead-ends (traps),
        validates the topology, and verifies uniqueness.
        """
        target_len = int(self.width * self.height * density)
        
        while True:
            # 1. Generate core path ending in a corner
            sx = random.choice([0, self.width-1]) 
            sy = random.choice([0, self.height-1])
            start_idx = sy * self.width + sx
            
            intended_path = self.generate_random_walk(start_idx, target_len)
            if len(intended_path) < target_len: continue
            end_idx = intended_path[-1]
            
            # 2. Derive base grid
            grid = [BLOCKED] * (self.width * self.height)
            for p in intended_path:
                grid[p] = OPEN
                
            # 3. Inject False Dead-Ends (Traps)
            # Find blocked cells that touch exactly ONE open cell.
            potential_traps = []
            for i in range(self.width * self.height):
                if grid[i] == BLOCKED and self.get_degree(i, grid) == 1:
                    potential_traps.append(i)
            
            random.shuffle(potential_traps)
            traps_added = 0
            
            for trap_idx in potential_traps:
                if traps_added >= num_traps: break
                grid[trap_idx] = OPEN
                
                # PRE-CHECK: Did opening this trap create a 2x2 blob or break connectivity?
                if not self.is_valid_topology(grid):
                    grid[trap_idx] = BLOCKED # Revert mutation
                else:
                    traps_added += 1

            # Verify the implicit end is still a dead-end after adding traps
            if self.get_degree(end_idx, grid) > 1:
                continue

            # 4. Final Uniqueness Verification
            puzzle = OneFillPuzzle(self.width, self.height, grid, start_idx, end_idx)
            solutions, stats = self.solver.solve(puzzle, max_solutions=2)
            
            if len(solutions) == 1:
                diff = self.evaluate_difficulty(stats['backtracks'])
                # If we requested traps and it solved uniquely, it's a great puzzle!
                if traps_added > 0:
                    return puzzle, solutions[0], "EXPERT"

# =====================================================================
# USAGE EXAMPLE
# =====================================================================
if __name__ == "__main__":
    # Test an 8x8 Puzzle Generation
    HEIGHT, WIDTH = 8, 8
    
    generator = OneFillGenerator(WIDTH, HEIGHT)
    
    # Time the entire generation loop
    t0 = time.time()
    puzzle, solution, difficulty = generator.generate_with_implicit_end_optimized(density=0.75)
    t1 = time.time()
    
    print(f"Total Generation Time: {t1 - t0:.3f} seconds\n")
    
    print("=== THE PUZZLE ===")
    puzzle.print_board()
    
    print("=== THE SOLUTION ===")
    puzzle.print_board(show_solution=solution)
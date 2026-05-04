Here is the detailed technical breakdown of your solver formatted in Markdown. This is perfect for a **README.md** file or a **Technical Documentation** section on your portfolio website.

---

# Technical Analysis: Linear Algebra Solver for "Greens & Reds"

## 1. Mathematical Modeling
The "Greens & Reds" puzzle (a variation of the classic *Lights Out*) is fundamentally a system of linear equations. Instead of standard decimal math, it operates within **Galois Field 2 (GF(2))**, where values are restricted to `0` and `1`, and addition is equivalent to the logical **XOR** operation.

### The Components
*   **The State Vector ($\mathbf{b}$):** A $9 \times 1$ vector representing the current board. `0` represents Red (Needs toggling) and `1` represents Green (Target).
*   **The Strategy Vector ($\mathbf{x}$):** The unknown $9 \times 1$ vector we are solving for. Each index $i$ is `1` if the $i$-th button must be pressed, and `0` otherwise.
*   **The Adjacency Matrix ($A$):** A $9 \times 9$ constant matrix defining the game rules. If button $i$ toggles square $j$, then $A_{i,j} = 1$.



## 2. The Core Equation
To solve the puzzle, we find a vector $\mathbf{x}$ such that:
$$A\mathbf{x} = \mathbf{b}$$

In computer science terms, this means that the combination of button presses ($\mathbf{x}$), when applied through the rule set ($A$), must transform the board to match our target requirements ($\mathbf{b}$).

---

## 3. Algorithm: Gaussian Elimination in GF(2)
The computer finds $\mathbf{x}$ by performing **Gaussian Elimination** on an augmented matrix $[A | \mathbf{b}]$. 

### Step 1: Augmentation
We append the current board state as a 10th column to our $9 \times 9$ adjacency matrix.


### Step 2: Forward Elimination & Pivoting
The algorithm iterates through each column:
1.  **Find a Pivot:** Locate a row with a `1` in the current column position.
2.  **Row Swap:** Move that row to the current pivot position to ensure a diagonal of `1`s.
3.  **Eliminate:** For every other row that has a `1` in that column, we **XOR** it with the pivot row. This "clears" the column, ensuring the pivot is the only active bit.

### Step 3: Back Substitution (Reduced Row Echelon Form)
Because we use XOR, the process of elimination simultaneously handles back-substitution. Once the left side of the matrix ($A$) is transformed into an **Identity Matrix** (a diagonal of `1`s), the right side (the 10th column) is revealed as our **Solution Vector**.

---

## 4. Implementation Details
*   **Space Complexity:** $O(N^2)$ to store the $9 \times 9$ matrix.
*   **Time Complexity:** $O(N^3)$, where $N$ is the number of squares. For a $3 \times 3$ grid ($N=9$), the total operations are approximately $9^3 = 729$, which executes in sub-millisecond time on modern hardware.
*   **Bitwise Optimization:** The solver uses the `^=` operator, leveraging the CPU's native ability to perform binary logic, making it significantly faster than standard floating-point division.

## 5. Summary
By treating the game as a high-dimensional vector space, we move from "guessing" to "calculating." This implementation demonstrates the intersection of **Linear Algebra**, **Discrete Mathematics**, and **State Management** in React.

---
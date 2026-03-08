# UbuntuLite 2026

![UbuntuLite Desktop Preview](./public/preview.png)

A sleek, simulated web terminal and desktop environment built with Next.js, React, and TypeScript. UbuntuLite brings a robust, interactive Linux-like interface directly into your browser, allowing for realistic mock terminal operations, file management, and immersive desktop applications. Designed with performance and aesthetics in mind.

---

## 🚀 Features

*   **Draggable Window System:** Immersive, multi-window environment with draggable headers. Experience simulated context menus, multi-tasking, minimizing/maximizing, and z-index ordering.
*   **Fully Functional Terminal Emulator:** Support for 20+ realistic mock commands such as `ls`, `cd`, `cat`, `mkdir`, `top`, `ping`, and even `apt` installation mockups, complete with functional visual outputs.
*   **Interactive Desktop Apps:**
    *   📁 **Folder Explorer:** Real-time mock file system navigation with a context menu to copy, paste, rename, and delete virtual files.
    *   📝 **Text Editor:** Create and edit files within the virtual file system. 
    *   ⚙️ **Settings App:** Dynamically change desktop backgrounds, terminal user profiles, and more.
    *   🎮 **Tic-Tac-Toe Neon:** Computer VS User gameplay with a glowing UI.
    *   🧮 **Calculator:** A fully functional desktop calcuator.
*   **Persistent Virtual File System:** Built using `localStorage` to keep your created files and directories intact between page reloads, providing a persistent and stateful experience.
*   **Aesthetic Design:** Complete with professional typography, drop shadows, slick hover animations, and a system core widget.

## 🛠️ Built With

*   **Framework:** [Next.js](https://nextjs.org/) (App Router format)
*   **Library:** React
*   **Language:** TypeScript
*   **Styling:** Custom Vanilla CSS (`terminal.css`) & inline styles

## 📦 Getting Started

### Prerequisites

Ensure you have **Node.js** installed globally on your machine. 

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd college_offline_test
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## 💼 Copyright

&copy; **2026 UbuntuLite**
Developed and maintaned by **Jawaan**.

*All simulated file systems, mock apps, and tools are purely visual and client-side logic for demonstration and practice purposes. None of the included apps modify the real host system files.*

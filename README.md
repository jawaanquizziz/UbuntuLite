# UbuntuLite

> A fully interactive, client-side web application built with HTML, CSS, and Vanilla JavaScript that simulates an Ubuntu Linux desktop environment and terminal interface directly in the browser! Practice over 100+ simulated Linux commands safely.

## ✨ Features

- **Ubuntu Lock Screen:** A simulated, aesthetically pleasing Ubuntu-style login screen (Default credentials: \`root\` / \`root123\`).
- **Interactive Desktop & Dock:** A clean, draggable desktop interface with an app dock, complete with smooth animations.
- **Virtual File System:** A fully client-side Javascript file system implementation with file paths, state tracking, and content saving.
- **Terminal Simulator:** 
  - Over **100+** simulated Linux commands representing categories like File Management, User Administration, Process Tracking, and Networking.
  - Command History (up/down arrows).
  - Searchable command reference sidebar.
  - Light/Dark mode toggling.
  - Interactive \`neofetch\` and \`top\` mock outputs.
- **GUI File Explorer:** A visual folder application allowing you to point-and-click to navigate directories natively.
- **Text Editor:** A built-in graphical text editor to click, view, edit, and save mock `txt` files on the virtual system.
- **Settings & Theming:** Customize your entire desktop with an array of beautiful, dynamic gradient themes natively.

## 🚀 Getting Started

No databases, no server-side logic, and no installation required. The entire simulator operates locally in the browser.

1. Clone or download this repository.
2. Open \`ubuntu_terminal.html\` in any modern web browser or start a local server (e.g. VS Code Live Server).
3. Login using the default credentials:
   - **Username**: \`root\`
   - **Password**: \`root123\`
4. Use the dock to open the Terminal, Settings, or Home Folder!

## 💻 Simulated Commands

The terminal supports a robust mock architecture. Commands won't touch your real hardware, making it a perfect environment for beginners to safely practice Linux syntax.

### Available Mocks Include:
- **General/Files**: \`ls\`, \`cd\`, \`pwd\`, \`cat\`, \`mkdir\`, \`touch\`, \`echo\`, \`rm\`, \`cp\`, \`mv\`, \`grep\`, \`find\`, \`tar\`, \`zip\`...
- **System/Users**: \`sudo\`, \`whoami\`, \`passwd\`, \`useradd\`, \`chown\`, \`chmod\`...
- **Processes**: \`ps\`, \`top\`, \`htop\`, \`kill\`, \`free\`...
- **Networking**: \`ping\`, \`ifconfig\`, \`nmap\`, \`curl\`, \`wget\`, \`netstat\`...
*(Note: Use the 'help' command or the UI Book icon to see the full list of references)*

## 🛠️ Technology Stack

- **HTML5:** Semantic architecture for window scaffolding.
- **CSS3:** Flexbox, Grid, CSS Variables, and keyframe animations to replicate the glossy Ubuntu UI.
- **Vanilla JavaScript (ES6+):** Complete DOM manipulation, state management (No React/Vue overhead). SVG icons utilized for all visual polish.

---

&copy; 2026 UbuntuLite. All rights reserved. This project is a mockup experiment intended for educational and practicing purposes. Feel free to modify, expand the commands dictionary, and create your own mini-OS!

# Calculator Project

A modern, responsive calculator built with **HTML5, CSS3, and Vanilla JavaScript**.

## Features

- Addition, subtraction, multiplication, and division
- Percentage
- Decimal numbers
- Positive/negative toggle
- Clear and delete
- Keyboard support
- Division-by-zero handling
- Responsive desktop and mobile UI
- Four selectable themes with saved preference
- No database, backend, API, or external dependency

## Project Structure

```text
calculator-project/
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
└── screenshots/
```

## Run Locally

The simplest method is to open `index.html` in a browser.

For a local HTTP server, if Python 3 is installed:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub

After testing the application:

```bash
git init
git add .
git commit -m "Initial calculator project"
git branch -M main
git remote add origin <GITHUB_REPOSITORY_URL>
git push -u origin main
```

Replace `<GITHUB_REPOSITORY_URL>` with your GitHub repository URL.

## Linux

Clone the project:

```bash
git clone <GITHUB_REPOSITORY_URL>
cd calculator-project
```

Run:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser.

To get later changes from GitHub:

```bash
git pull
```

## Keyboard Shortcuts

- `0-9` — numbers
- `+` `-` `*` `/` — operations
- `%` — percentage
- `.` — decimal
- `Enter` or `=` — calculate
- `Backspace` — delete
- `Escape` — clear

## Testing Checklist

- [x] Addition
- [x] Subtraction
- [x] Multiplication
- [x] Division
- [x] Percentage
- [x] Decimal numbers
- [x] Positive/negative
- [x] Clear
- [x] Delete
- [x] Keyboard input
- [x] Division by zero handling
- [x] Responsive design

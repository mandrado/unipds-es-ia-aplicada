# E-commerce Recommendation System

A web application that displays user profiles and products, tracking purchases for future TensorFlow.js-based recommendations.

## Project Structure

- `index.html` - Main HTML file
- `src/` - Application source code (controllers, views, services, events, workers)
- `data/` - JSON files with users and products
- `style.css` - UI styles

## Setup and Run

1. Install dependencies:

```bash
npm install
```

2. Start the application:

```bash
npm start
```

3. Open the URL shown in the terminal (for example, `http://localhost:3000`).

## Windows Error: PathNotFound When Running npm start

If you got errors such as:

- `Path not found: data/*.json,`
- `Path not found: js/*.js'`

this usually happens for two reasons:

1. Single quotes in the script (`'...'`) can break argument parsing on Windows/PowerShell.
2. The path `js/*.js` does not exist in this project (JavaScript source files are under `src/`).

### Applied Workaround

In `package.json`, the `start` script was adjusted to a Windows/Linux-compatible format:

```json
"start": "browser-sync -w . --server --files \"index.html,data/*.json,src/**/*.js,style.css\" --port 3000"
```

With this change:

- globs are resolved correctly on Windows;
- the correct folder (`src/`) is watched;
- the app starts without `PathNotFound` errors.

## Current Features

- User profile selection
- Purchase history display
- Product listing with buy action
- Purchase tracking via sessionStorage

## Next Steps

- TensorFlow.js recommendation engine
- User similarity analysis
- Product recommendations based on purchase history

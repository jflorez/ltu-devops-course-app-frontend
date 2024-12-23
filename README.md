# Speedrun Tracker

A Vue 3 and TypeScript web application for tracking video game speedruns. Users can record, view, and compare speedrun completion times.

## Features

- **Game Selection**: Select games from the available catalog
- **Speedrun Recording**: Add speedrun entries with:
  - Runner name
  - Game selection
  - Category selection (e.g., Any%, 100%)
  - Time in milliseconds
  - Date of completion
- **Speedrun List**: View and sort entries by:
  - Runner name
  - Time
  - Date
- **Data Updates**: Refresh speedrun data when new entries are added
- **Interface**: Adapts to desktop and mobile screen sizes
- **API Status**: Monitors connection to the backend API

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Axios
- Jest
- Playwright
- Docker

## Project Setup

1. Enable Corepack (required for first time setup):

```sh
corepack enable
```

2. Install dependencies:

```sh
yarn
```

3. Configure environment variables:
   Create a `.env` file with:

```
VITE_API_BASE_URL=your_api_url
VITE_API_TOKEN=your_api_token
HTTP_PORT=8080
```

4. Start development server:

```sh
yarn dev
```

5. Build for production:

```sh
yarn build
```

## Docker Deployment

Run with Docker Compose:

```sh
docker-compose up --build
```

## Testing

### End-to-End Tests

```sh
# Install browsers for the first run
npx playwright install

# Run tests
yarn test:e2e
```

### Unit Tests

```sh
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:coverage
```

### Code Quality

```sh
# Run linter
yarn lint

# Format code
yarn format
```

## Development Tools

Recommended setup:

- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension for Vue 3
- Vetur extension should be disabled

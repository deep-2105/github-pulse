# GitHub Pulse

GitHub Pulse is a GitHub-focused developer dashboard that brings key repository and user insights into a single interface powered by the GitHub API and GitHub App authentication.

Live Demo: https://github-pulse-ten.vercel.app

## Overview

GitHub Pulse is designed to help developers quickly understand a GitHub user profile, repository activity, and repository health without leaving a single dashboard. It combines structured repository metadata, recent activity data, and focused repository inspection into one streamlined experience.

The project is built around a Vite frontend and a serverless API deployed on Vercel, with GitHub data fetched securely from the backend using Octokit and GitHub App credentials.

## Features

- User profile and account summary
- Repository listing and metadata
- Repository details and deep inspection
- Recent GitHub activity and events
- Repository health signals such as stars, forks, issues, contributors, languages, and branches
- Responsive dashboard interface
- Vercel deployment with a serverless API layer
- Backend GitHub access via GitHub App authentication

## Dashboard Sections

### 1. Overview
Displays a summary of the selected GitHub user, including account metadata and aggregated repository statistics.

### 2. Repositories
Shows a searchable list of repositories with details such as:
- repository name
- description
- stars
- forks
- language
- topics
- update dates

### 3. Repo Inspector
Focuses on a selected repository and retrieves deeper details, including:
- issues
- pull requests
- commits
- contributors
- languages
- branches

### 4. Live Pulse
Displays recent GitHub events and repository activity for the selected user. This section is described as recent GitHub activity/events rather than real-time updates unless those updates are explicitly implemented.

## GitHub App + GitHub API Architecture

GitHub Pulse uses the GitHub API as its data source and a GitHub App for secure server-side authentication.

The current architecture is:

- Frontend:
  - React 19
  - Vite
  - UI in src/App.jsx and src/components/
  - API calls organized under src/services/
  - Utility functions under src/utils/

- Backend:
  - server/app.js: reusable Express application and API routes
  - server/index.js: local development server launcher
  - server/github.js: GitHub App authentication and Octokit logic
  - api/index.js: Vercel serverless entrypoint

The backend authenticates with the GitHub App and then uses Octokit to request GitHub REST API data. The frontend does not directly hold the GitHub App credentials or private key material.

## Technology Stack

- React 19
- Vite
- Express
- Octokit
- GitHub REST API
- GitHub App authentication
- CORS
- dotenv
- Lucide React
- Vercel
- CSS

## Production Architecture

The application is deployed as a single Vercel project with:
- a Vite frontend
- a serverless API under /api
- GitHub API access handled by the backend layer

This setup keeps the frontend presentation separate from the GitHub API integration while still running in a single deployment project.

## Security

GitHub Pulse follows a server-side security model for GitHub access:

- GitHub App credentials remain in the backend environment
- The private key is never exposed to the browser
- GitHub requests are made from the backend, not directly from client-side code
- Sensitive configuration is managed through environment variables
- No secret values are included in the repository or documentation

The production environment variables include:
- GITHUB_APP_ID
- GITHUB_INSTALLATION_ID
- GITHUB_PRIVATE_KEY

These values should be configured in the Vercel project environment settings and kept out of source control.

## Local Development

### Prerequisites
- Node.js
- npm

### Install dependencies
npm install

### Start the local backend
npm run server

### Start the Vite frontend
npm run dev

The frontend development server proxies API requests to the local Express server, while the production deployment routes API traffic through the Vercel serverless entrypoint.

## Environment Variables

The application expects the following environment variables:

- GITHUB_APP_ID
- GITHUB_INSTALLATION_ID
- GITHUB_PRIVATE_KEY

These variables are required for the backend to authenticate with GitHub using the GitHub App. Do not add real secret values to the repository, and do not commit environment files containing private credentials.

## Deployment

The project is deployed to Vercel as a single project with both frontend and API responsibilities.

Typical deployment flow:
1. Configure the required GitHub App environment variables in the Vercel project
2. Deploy the repository to Vercel
3. Confirm the frontend loads correctly
4. Validate the serverless API routes under /api
5. Verify that GitHub data can be fetched successfully from the backend

## Project Structure

- api/
  - api/index.js
- server/
  - server/app.js
  - server/github.js
  - server/index.js
- src/
  - src/App.jsx
  - src/components/
  - src/services/
  - src/utils/
- public/
- index.html
- vite.config.js
- package.json
- eslint.config.js
- .gitignore

## Roadmap

Possible future enhancements may include:
- additional repository analytics views
- more detailed data filtering and sorting
- improved dashboard polish and usability
- additional GitHub metrics for deeper developer insight

The roadmap is intentionally conservative and aligned with the current architecture and functionality already present in the application.

## Acknowledgement

GitHub Pulse is built around the GitHub API and GitHub App ecosystem. It uses GitHub App authentication for secure backend access and the GitHub REST API for repository, user, and activity data. This project reflects the current implementation in the repository and is intended as a practical developer dashboard built for GitHub data exploration.

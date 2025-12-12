# Shared Front

This folder contains a public web front-end used for displaying stock overview data and statistics visualizations for Boxtribute.

## Purpose

The shared-front application provides a public interface for sharing statistics and stock data with external stakeholders without requiring authentication. It is designed to display visualizations and data summaries that can be publicly shared via links.

## Development

```bash
docker compose --build up shared-front webapp
```

Then visit the front-end at `localhost:5173`.

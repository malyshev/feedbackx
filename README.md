# FeedbackX

**Lightweight Feedback Collector for Apps**

An API-first feedback collection backend. Self-hosted, privacy-focused, and opinionated about nothing—except simplicity.

## Overview

FeedbackX is a lightweight REST API backend for collecting feedback. Build your own UI, integrate with any frontend, and own your feedback data.

Built for developers who need a feedback collection backend without the bloat. Perfect for indie hackers, early-stage SaaS teams, and privacy-conscious enterprises.

## Key Features

- **API-first** – REST API backend for feedback collection
- **Self-hosted** – Docker-ready deployment, full control over your data
- **Production-ready** – Security headers, CORS, rate limiting, structured logging
- **Minimalist** – Simple and focused
- **Open-source** – MIT/Apache 2.0 licensed

## Quick Start

### Self-hosted Deployment

Deploy FeedbackX using Docker:

```bash
# Build and run
docker build -t feedbackx:latest .
docker run -d -p 3000:3000 feedbackx:latest

# Or use docker-compose
docker-compose up -d
```

### Local Development

For contributing or local development:

```bash
# Clone and install
git clone https://github.com/yourusername/feedbackx.git
cd feedbackx
npm install

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## Configuration

Configuration is managed via environment variables:

```bash
# Server
APP_PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Logging
LOG_LEVEL=info
LOG_PRETTY=true
```

## Development

### Prerequisites

- Node.js 22+ (LTS)

### Scripts

```bash
npm run start:dev    # Start development server
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Lint code
npm run format       # Format code
```

## Contributing

We welcome contributions! This project follows [Conventional Commits](https://www.conventionalcommits.org/) for both internal development and external contributions.

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes using conventional commit format (e.g., `git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow the existing code style (enforced by ESLint/Prettier)
- Write tests for new features
- Update documentation as needed
- Keep commits focused and atomic
- **Use conventional commit messages** – We follow conventional commits for all commits, both internal and contributions
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

## License

This project is dual-licensed under:

- **MIT License** – See [LICENSE-MIT](LICENSE-MIT)
- **Apache 2.0 License** – See [LICENSE-APACHE](LICENSE-APACHE)

You may choose either license for your use case.

## Documentation

- **[Configuration Guide](./docs/CONFIGURATION.md)** – Detailed configuration options
- **[Docker Deployment](./docs/DOCKER.md)** – Docker setup and deployment
- **[Development Guide](./docs/DEVELOPMENT.md)** – Development workflow and guidelines
- **[Logging](./docs/LOGGING.md)** – Pino logging configuration and Grafana stack setup

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features and milestones.

## Support

- **Issues** – [GitHub Issues](https://github.com/yourusername/feedbackx/issues)
- **Discussions** – [GitHub Discussions](https://github.com/yourusername/feedbackx/discussions)

---

Made with ❤️ for developers who value simplicity and privacy.

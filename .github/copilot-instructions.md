# Boxtribute Copilot Instructions

Always follow these instructions and only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.

## Project Overview

Boxtribute is a humanitarian relief web application supporting the distribution of over 1 million items annually across 15+ locations in Europe and the Middle East. The application consists of:

- **Frontend**: React TypeScript app built with Vite, Chakra UI, Apollo Client
- **Backend**: Python Flask GraphQL API using Ariadne, Peewee ORM, MySQL
- **Additional Apps**: Statistics visualization (statviz), shared components
- **Architecture**: Docker-based development, deployed on Google App Engine

### Architecture Diagrams
For detailed system architecture understanding:
- **System Landscape**: `docs/c4-system-landscape.png` - High-level overview of system components and external integrations
- **Backend Components**: `docs/c4-backend-components.jpg` - Internal backend service architecture and data flow

## Essential Setup Commands

**Note**: These instructions complement the automated setup defined in `.github/workflows/copilot-setup-steps.yml`. The workflow file handles dependency installation in the Copilot environment, while these instructions are for manual development setup.

Run these commands exactly in order for initial setup:

```bash
# Clone and enter repository
cd /path/to/boxtribute

# Copy environment configuration (REQUIRED)
cp example.env .env

# Install pnpm globally (Node.js package manager)
npm install -g pnpm@9.15.1

# Install all dependencies for the workspace
pnpm install

# Create Python virtual environment for backend development
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies (requires internet access to PyPI)
pip install -U -e back -r back/requirements-dev.txt
```

## Development Environment

### Docker Compose (Primary Method)

Start the complete development environment:

```bash
# Start all services (database, backend, frontend, statviz)
docker compose up

# NEVER CANCEL: Initial Docker build can take 15-30 minutes
# Set timeout to 45+ minutes for first-time builds
# Subsequent starts are much faster (1-2 minutes)

# Access points after startup:
# - Frontend: http://localhost:3000
# - Backend GraphQL: http://localhost:5005/graphql
# - Database: localhost:32000 (MySQL, user: root, password: dropapp_root)
```

**CRITICAL**: If you encounter network timeouts with npmjs.org or pypi.org during Docker builds, this is a known environment limitation. Document the specific error and proceed with local development approach.

### Local Development (Alternative)

If Docker Compose fails due to network issues:

```bash
# Start database only
docker compose up -d db

# Frontend development server (in separate terminal)
cd front
pnpm dev
# Runs on http://localhost:3000

# Backend development server (in separate terminal)
cd back
source ../.venv/bin/activate
MYSQL_HOST=127.0.0.1 MYSQL_USER=root MYSQL_PASSWORD=dropapp_root MYSQL_DB=dropapp_dev MYSQL_PORT=32000 python -m boxtribute_server.dev_main
# Runs on http://localhost:5005
```

## Testing Commands

### Frontend Tests
```bash
# Run all frontend tests with coverage
# NEVER CANCEL: Takes ~1-2 minutes to complete
pnpm test:coverage
# Timeout: Set to 5+ minutes

# Run tests in watch mode for development
pnpm test

# Test shared components separately
pnpm -C shared-components test:coverage
```

### Backend Tests
```bash
# Start database for testing
docker compose up -d db

# Install backend dependencies (REQUIRES internet access to PyPI)
cd back
source ../.venv/bin/activate
pip install -U -e . -r requirements-dev.txt
# NOTE: May fail with network timeouts in restricted environments

# Run backend tests (requires MySQL database and dependencies)
pytest
# NEVER CANCEL: Takes ~5-10 minutes including database setup
# Timeout: Set to 15+ minutes

# Run specific test categories (when dependencies are available)
pytest test/unit_tests/          # Unit tests only (~2 minutes)
pytest test/model_tests/         # Data model tests (~3 minutes)  
pytest test/endpoint_tests/      # API endpoint tests (~8 minutes)
# Skip auth0_integration_tests/ when internet access is limited
```

**CRITICAL NOTE**: Backend development requires internet access to PyPI for dependency installation. If you encounter `ReadTimeoutError` from pypi.org, document this in your PR and focus on frontend validation.

## Build Commands

### Frontend Build
```bash
# Build the frontend for production
cd front
pnpm build
# Takes ~30-60 seconds
# Timeout: Set to 3+ minutes

# Build statistics app
pnpm -C statviz build
# Takes ~30-60 seconds
```

### Type Checking
```bash
# Check TypeScript types across all projects
pnpm check-types
# Takes ~40-60 seconds
# Timeout: Set to 3+ minutes
```

## Code Quality Commands

### Linting
```bash
# Lint all frontend code
pnpm lint:all
# Takes ~30-45 seconds

# Lint and auto-fix
pnpm lint:all:fix

# Backend linting (via pre-commit)
cd back
source ../.venv/bin/activate
pre-commit run --all-files
# Takes ~30-60 seconds
```

### Formatting
```bash
# Check code formatting
pnpm format:check:all

# Fix code formatting
pnpm format:write:all
# Takes ~3-5 seconds

# Backend formatting is handled by pre-commit hooks (black, isort)
```

## Manual Validation Requirements

After making changes, ALWAYS validate functionality by:

### Full Integration Testing

**Note**: Frontend validation always requires a running backend, so complete integration testing is mandatory for all frontend changes.

1. Start complete stack: `docker compose up` (when network allows) or start services separately:
   ```bash
   # Alternative when Docker Compose fails:
   docker compose up -d db
   cd back && MYSQL_HOST=127.0.0.1 MYSQL_USER=root MYSQL_PASSWORD=dropapp_root MYSQL_DB=dropapp_dev MYSQL_PORT=32000 python -m boxtribute_server.dev_main &
   cd front && pnpm dev
   ```

2. Navigate to http://localhost:3000

3. **Login Flow Test**:
   - Click login button
   - Use test credentials: `dev_coordinator@boxaid.org` / `Browser_tests`
   - Verify successful authentication and redirect to dashboard

4. **Basic Navigation Test**:
   - Test main menu navigation (Boxes, People, Distributions, etc.)
   - Verify all routes load without errors
   - Check browser console for JavaScript errors

5. **Core Functionality Tests** (based on your changes):
   - **Box management**: Create, edit boxes
   - **User management**: Add/edit beneficiaries
   - **Transfer workflows**: Box transfers between locations

6. **End-to-End User Scenarios**:
   - Complete user registration and login flow
   - Box creation and editing
   - Location-to-location box transfers
   - Shipment creation and box assignments
   - Distribution event management (if applicable)

7. **Error Handling Validation**:
   - Test invalid inputs and verify proper error messages
   - Test network failure scenarios
   - Verify authentication timeout handling

8. **Performance Validation**:
   - Large data set handling (100+ boxes, users)
   - Multiple concurrent user simulation
   - Mobile device responsiveness testing

9. Take screenshots of any UI changes for PR documentation

### Backend Validation (when dependencies available)
1. Start GraphQL server: `cd back && MYSQL_HOST=127.0.0.1 MYSQL_USER=root MYSQL_PASSWORD=dropapp_root MYSQL_DB=dropapp_dev MYSQL_PORT=32000 python -m boxtribute_server.dev_main`
2. Access GraphiQL explorer at http://localhost:5005/graphql
3. **Authentication Test**:
   ```bash
   # Get test token
   cd back && ./fetch_token --test
   # Add to GraphiQL headers: {"authorization": "Bearer <token>"}
   ```
4. **Basic Query Test**:
   ```graphql
   query { organisations { name bases { name } } }
   ```
5. **Data Integrity Test**: Verify any new mutations return expected data structure
6. Check server logs for warnings or errors

### Test Data Available
The development database includes:
- **Organizations**: BoxAid (Lesvos), BoxCare (Samos, Thessaloniki, Athens)
- **Test Users**: Various roles from volunteer to head of operations
- **Sample Data**: Boxes, locations, products, and QR codes
- **QR Test Codes**: Available in `docs/qr/` directory

**All test user passwords**: `Browser_tests`

## Important File Locations

### Frequently Modified Files
- `front/src/` - React frontend source code
- `back/boxtribute_server/` - Python backend source code  
- `back/boxtribute_server/graph_ql/` - GraphQL schema and resolvers
- `back/boxtribute_server/models/` - Database models (Peewee ORM)
- `shared-components/` - Reusable UI components
- `graphql/` - Generated GraphQL types and schema

### Configuration Files
- `package.json` - Root workspace configuration and scripts
- `front/package.json` - Frontend dependencies and scripts
- `back/requirements.txt` - Backend Python dependencies
- `docker-compose.yml` - Development environment configuration
- `.env` - Environment variables (copy from example.env)
- `pnpm-workspace.yaml` - pnpm workspace configuration

### Testing Files
- `front/src/**/*.test.tsx` - Frontend test files
- `back/test/` - Backend test files
- `vitest.workspace.json` - Test runner configuration

## Development Tips

### GraphQL Schema Updates
After modifying GraphQL schema files in `back/boxtribute_server/graph_ql/definitions/`:
```bash
# Regenerate TypeScript types
pnpm graphql-gen
```

### Database Changes
- Database seeds and migrations are in `back/init.sql`
- Database models are in `back/boxtribute_server/models/`
- Always test database changes with both unit tests and integration tests

### Auth0 Integration
- Development uses Auth0 test tenant
- Test credentials are documented in README.md
- Auth0 secrets are required for backend tests but provided in .env

### Known Limitations
- Network access to npmjs.org and pypi.org may be limited in some environments
- Auth0 integration tests require internet connectivity
- Some secrets are not included in example.env (expected for development)

## CI/CD Information

The project uses CircleCI for automated testing and deployment:
- **Frontend tests**: ~5-8 minutes in CI
- **Backend tests**: ~10-15 minutes in CI  
- **Build process**: ~15-25 minutes total in CI
- **Deployment**: Automated to Google App Engine

**CRITICAL**: NEVER modify `.circleci/config.yml` or trigger any deployment manually. If changes to CI configuration are absolutely necessary, request approval in a PR comment.

Always run the full test suite locally before pushing:
```bash
# Complete validation sequence
pnpm install
pnpm check-types
pnpm lint:all
pnpm test:coverage
pnpm -C front build
pnpm -C statviz build
cd back && pytest
```

## Troubleshooting

### Common Issues
1. **"Module not found" errors**: Run `pnpm install` 
2. **Docker network timeouts**: Use local development approach
3. **Database connection errors**: Ensure `docker compose up db` is running
4. **Auth0 authentication failures**: Check .env file configuration
5. **Type errors**: Run `pnpm graphql-gen` after schema changes

### Network Issues
If experiencing network connectivity problems during setup:
- **PyPI timeouts**: Document specific pip install errors in your PR 
- **npmjs.org timeouts**: Use local development instead of Docker builds
- **Auth0 connectivity**: Backend tests may fail without internet access
- **Workaround**: Focus on frontend development and validation when network-restricted

**Always document network limitations encountered** rather than skipping validation steps.

### Environment Limitations
This development environment may have limited internet access to:
- pypi.org (Python package index)
- npmjs.org (Node.js package registry) 
- Auth0 authentication service

When encountering these limitations:
1. Document the specific error in your changes
2. Use the alternative local development approach
3. Focus on areas that can be validated without full dependency installation
4. Include network limitation notes in your PR description
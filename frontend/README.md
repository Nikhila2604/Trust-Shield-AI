# Truth Shield AI - Decoupled Frontend Codebase

This folder contains references and guidelines to decouple our React + Tailwind CSS client codebase and compile it standalone to run on a decoupled server while communicating directly with our Java Spring Boot + MySql backend service.

## Decoupled Build Parameters

### 1. Unified Endpoints Mapping
To point the frontend to your Spring Boot REST instance running on `http://localhost:8080`, simply edit `/vite.config.ts` proxies or update the API calls within your pages directly. Under production, set the remote domain parameter inside your client:

```typescript
// Replace active fetch urls globally:
// From:
const res = await fetch("/api/auth/register");
// To decoupled server domain:
const res = await fetch("http://localhost:8080/api/auth/register");
```

### 2. Available Frontend Templates Pre-loaded
All active UI elements and views are represented:
- **Registration Form:** Fully interactive input states.
- **Login Validator:** Account handle encryption matching Spring Security.
- **Personal Search Archives Vault:** History pages querying scans filtered and saved separately.

## How to Package the Frontend Cleanly
1. Ensure Node.js is installed locally.
2. Initialize standalone directories:
   ```bash
   npm install
   npm run build
   ```
3. Deploy the resulting `/dist` folder directly to static hosts, or bundle it as static resources within the `/backend` resources directory `src/main/resources/static` so Spring Boot serves the frontend automatically!

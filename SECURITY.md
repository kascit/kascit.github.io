# Security Policy

## Supported Versions

| Version         | Supported |
| --------------- | --------- |
| Latest (`main`) | ✅        |
| Older deploys   | ❌        |

## Reporting a Vulnerability

Please report any suspected or confirmed security vulnerabilities privately to **[security@dhanur.me](mailto:security@dhanur.me)**. Please do not open a public issue.

Instead, report it privately:

1. **Email:** [security@dhanur.me](mailto:security@dhanur.me)
2. **Subject line:** `[SECURITY] kascit.github.io — <brief description>`

### What to include

- A clear description of the vulnerability
- Steps to reproduce (URL, browser, payload, etc.)
- Impact assessment (XSS, data leak, CSP bypass, etc.)
- Any suggested fix, if available

### Response timeline

- **Acknowledgement:** Within 48 hours
- **Initial assessment:** Within 5 business days
- **Fix or mitigation:** As soon as reasonably possible, depending on severity

### Scope

The following are in scope:

- The production site at `dhanur.me` and all `*.dhanur.me` subdomains
- All code in this repository (templates, scripts, static assets)
- CSP, Trusted Types, and other security header configurations
- Authentication flows via `auth.dhanur.me`

The following are **out of scope**:

- Third-party services (Cloudflare, GitHub, Sentry, Giscus)
- Denial-of-service attacks
- Social engineering

### Disclosure

We follow coordinated disclosure. Please allow reasonable time for a fix before any public disclosure.

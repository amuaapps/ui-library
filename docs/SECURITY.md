# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

The Amua Apps team takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**security@amuaapps.com** (placeholder - update with actual contact)

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., XSS, dependency vulnerability, etc.)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Process

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
2. **Investigation**: We will investigate and validate the vulnerability
3. **Fix Development**: We will develop a fix and prepare a security advisory
4. **Disclosure**: We will coordinate disclosure timing with you
5. **Release**: We will release a patched version and publish the security advisory

## Security Best Practices

When using this library:

### Dependency Security

- Keep dependencies up to date
- Run `npm audit` regularly
- Review security advisories for dependencies

### Component Usage

- Sanitize user input before passing to components
- Follow React security best practices
- Avoid dangerously setting innerHTML unless absolutely necessary
- Validate props that accept user-generated content

### Build & Deploy

- Use lockfiles (`package-lock.json`) to ensure deterministic builds
- Scan for vulnerabilities in CI/CD pipeline
- Follow least privilege principles for deployment credentials

## Security Standards

This project follows security standards defined in [`docs/agents.md`](./agents.md):

- **Input validation** at component boundaries
- **No secrets in code** or repository history
- **Least privilege** for all integrations
- **Automated security scanning** via npm audit and CodeQL (when CI is set up)
- **Dependency vulnerability checks** that fail the pipeline on high/critical issues

## Known Security Considerations

### Client-Side Component Library

This is a client-side React component library. Security considerations include:

- **XSS Prevention**: Components should not render unsanitized user input
- **Dependency Chain**: Security depends on React and other dependencies
- **Consumer Responsibility**: Applications using this library are responsible for:
  - Authentication and authorization
  - Server-side input validation
  - Secure API communication
  - Content Security Policy (CSP) configuration

## Security Updates

Security updates will be released as patch versions and announced via:
- GitHub Security Advisories
- Release notes
- npm security advisories (if applicable)

## Disclosure Policy

- Security issues are disclosed after a fix is available
- We aim for coordinated disclosure with reporters
- Credit will be given to reporters (unless they prefer to remain anonymous)

## Questions

For questions about security that are not vulnerabilities, please open a GitHub discussion or contact the maintainers.

---

**Last Updated**: January 2026  
**Version**: 1.0.0

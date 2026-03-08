# Security Policy

## Reporting Security Vulnerabilities

**Do NOT open public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability in EduChemSuite, please report it privately to:

📧 **Email**: [security@example.com](mailto:security@example.com)

Include the following information in your report:
- Description of the vulnerability
- Affected component(s) or version(s)
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)

## Response Timeline

We aim to:
- **Acknowledge** your report within 48 hours
- **Provide** a timeline for a fix within 5 business days
- **Release** a patch or security update as soon as feasible
- **Credit** your discovery (if desired)

## Supported Versions

| Version | Status | Security Updates |
|---------|--------|------------------|
| master  | Active | Yes (current)    |
| Previous releases | EOL | No |

Only the current `master` branch receives security updates. We recommend always running the latest version.

## Security Best Practices

When self-hosting EduChemSuite:
- Use HTTPS with valid SSL/TLS certificates
- Keep .NET and dependencies up to date
- Use strong database passwords
- Rotate JWT signing keys regularly
- Keep PostgreSQL updated and secure
- Use environment variables for all secrets (never commit credentials)
- Monitor logs (Seq integration) for suspicious activity

## Acknowledgments

We appreciate responsible disclosure and will publicly acknowledge security researchers who report vulnerabilities (with permission).

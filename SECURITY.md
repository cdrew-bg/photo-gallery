# Security Policy

## Reporting a vulnerability

**Do not open a public issue for a security report.** A disclosed-but-unpatched vulnerability is an
active risk.

Use a private channel instead:

1. **GitHub private vulnerability reporting** (preferred) — open the repository's **Security** tab
   and choose **Report a vulnerability**. This opens a private advisory visible only to maintainers.
2. **Email** — the maintainer address in `CODEOWNERS`. Omit exploit details from the first message
   and request a secure channel if needed.

Please include:

- The affected component, route, or dependency.
- A description of the impact (what an attacker can do).
- Minimal reproduction steps — not a weaponized exploit or a step-by-step data-extraction path.
- Any relevant version, commit SHA, or configuration.

## What to expect

- **Acknowledgement** within a few business days.
- **Triage and severity** using CVSS as a guide.
- **Coordinated disclosure**: we agree a timeline with you and credit you unless you prefer anonymity.

## Supported versions

Security fixes land on `main` and roll out with the next deploy; there is no separate LTS branch.

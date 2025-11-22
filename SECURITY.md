# Security Policy

## Supported Versions

We are committed to maintaining the security of StockMaster. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.3.x   | :white_check_mark: |
| 1.2.x   | :white_check_mark: |
| 1.1.x   | :x:                |
| < 1.1   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in StockMaster, please report it to us as described below.

### How to Report

1. **Do not** open a public issue
2. Email security concerns to: [security@stockmaster.com]
3. Include detailed information about the vulnerability
4. Provide steps to reproduce if possible

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if you have one)

### Response Timeline

- **Initial Response**: Within 24 hours
- **Assessment**: Within 3 business days
- **Fix Timeline**: Varies based on severity
- **Public Disclosure**: After fix is deployed (coordinated disclosure)

## Security Measures

### Environment Variables
- All sensitive configuration stored in environment variables
- `.env` files are gitignored and never committed
- Separate configurations for different environments

### Firebase Security
- Firestore Security Rules enforce data access permissions
- Authentication required for all operations
- Role-based access control (RBAC) implemented
- Input validation and sanitization

### Application Security
- Protected routes with authentication checks
- XSS protection through React's built-in sanitization
- CSRF protection through Firebase security
- Secure session management
- Regular dependency updates

### Data Protection
- Encryption in transit (HTTPS)
- Encryption at rest (Firebase)
- No sensitive data stored in client-side code
- Audit logging for all operations

## Best Practices for Users

### Environment Setup
1. Never commit `.env` files to version control
2. Use strong, unique Firebase API keys
3. Regularly rotate API keys and secrets
4. Enable Firebase Security Rules
5. Monitor Firebase usage and access logs

### Development
1. Keep dependencies updated
2. Run security audits: `npm audit`
3. Use HTTPS in production
4. Implement proper error handling
5. Follow principle of least privilege

### Deployment
1. Use secure hosting platforms
2. Enable HTTPS/SSL certificates
3. Configure proper CORS settings
4. Monitor application logs
5. Regular security assessments

## Compliance

StockMaster follows these security standards:
- OWASP Web Application Security Project guidelines
- Firebase Security Best Practices
- Modern web security standards

## Contact

For security-related questions or concerns:
- Security Team: [security@stockmaster.com]
- General Support: [support@stockmaster.com]

---

**Last Updated**: November 2025
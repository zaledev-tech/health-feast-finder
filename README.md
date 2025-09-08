# Afya++ - AI-Powered Health Recipe Platform

Afya++ is a comprehensive health-focused recipe application that uses artificial intelligence to generate personalized recipes based on user preferences, dietary restrictions, and nutritional needs.

## Features

### Core Functionality
- **AI Recipe Generation**: Personalized recipes using OpenAI GPT models
- **User Profiles**: Comprehensive health and dietary preference management
- **Recipe Management**: Save, favorite, and organize recipes
- **Shopping Lists**: Auto-generated shopping lists from recipes
- **Nutritional Information**: Detailed nutritional data for all recipes

### Security Features
Our application implements enterprise-grade security measures:

#### Authentication & Authorization
- **Multi-factor Authentication**: Email verification required
- **Password Security**: 8+ character minimum with complexity requirements (uppercase, lowercase, numbers, special characters)
- **Rate Limiting**: 5 login attempts per 5 minutes, 3 signup attempts per 5 minutes
- **Session Management**: Automatic session timeout and monitoring
- **Row Level Security (RLS)**: Database-level access control

#### Input Security
- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **Input Validation**: Comprehensive validation for all form fields
- **Length Limits**: Email (254 chars), names (100 chars), descriptions (500 chars)
- **Content Filtering**: Removal of HTML tags, scripts, and malicious content

#### API Security
- **Rate Limiting**: Recipe generation limited to 5 requests per minute per user
- **Request Validation**: All API requests validated and sanitized
- **Error Handling**: Generic error messages to prevent information disclosure
- **CORS Protection**: Strict Cross-Origin Resource Sharing policies

#### Security Monitoring
- **Event Logging**: All authentication events, failed attempts, and suspicious activities
- **Audit Trail**: Complete audit trail for sensitive data access
- **Real-time Monitoring**: Automatic detection of unusual access patterns
- **Security Alerts**: Notifications for potential security incidents

#### Data Protection
- **Encrypted Storage**: All sensitive data encrypted at rest
- **Secure Transmission**: HTTPS enforced for all connections
- **Private Data**: User profiles only visible to authenticated users
- **Data Validation**: Server-side validation for all data operations

#### Additional Security Measures
- **Environment Variables**: No hardcoded secrets or API keys
- **TypeScript Safety**: Type safety for all user inputs and API responses
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **XSS Protection**: Content Security Policy and input sanitization

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom design system
- **Shadcn/ui** components for consistent UI
- **React Router** for navigation
- **React Hook Form** for form management with validation

### Backend
- **Supabase** for backend-as-a-service
- **PostgreSQL** database with Row Level Security
- **Supabase Edge Functions** for serverless API endpoints
- **OpenAI API** for AI recipe generation

### Security Stack
- **Supabase Auth** with email verification
- **Row Level Security (RLS)** policies
- **Input validation and sanitization** libraries
- **Rate limiting** middleware
- **Security event logging** system
- **CORS protection**

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd afya-plus-plus
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
# These are automatically configured in Lovable
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase secrets (for Edge Functions):
- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key

5. Run the development server:
```bash
npm run dev
# or
bun dev
```

### Database Setup

The application uses Supabase with the following main tables:
- `profiles`: User profile information
- `recipes`: AI-generated and user recipes
- `favorites`: User's favorite recipes
- `user_allergies`: User's allergy information
- `user_deficiencies`: Nutritional deficiency tracking
- `security_events`: Security monitoring and audit logs

All tables are protected with Row Level Security policies.

## Usage

### For Users
1. **Sign Up**: Create an account with email verification
2. **Profile Setup**: Add your dietary preferences, allergies, and health information
3. **Generate Recipes**: Use the AI-powered recipe generator
4. **Manage Recipes**: Save favorites and create shopping lists
5. **Track Nutrition**: Monitor your nutritional intake

### For Developers
1. **Security First**: Follow the security guidelines when adding features
2. **Input Validation**: Always validate and sanitize user inputs
3. **Error Handling**: Use generic error messages in production
4. **Logging**: Log security events for monitoring
5. **Testing**: Test all security features thoroughly

## Security Guidelines for Developers

### Input Handling
```typescript
// Always sanitize inputs
import { sanitizeInput, validateEmail } from '@/lib/validation';

const cleanInput = sanitizeInput(userInput, 100);
const isValidEmail = validateEmail(email);
```

### Authentication
```typescript
// Always check authentication
import { useAuth } from '@/hooks/useAuth';

const { user, loading } = useAuth();
if (!user && !loading) {
  // Redirect to login
}
```

### Security Logging
```typescript
// Log security events
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

const { logSecurityEvent } = useSecurityMonitoring();
logSecurityEvent({
  event_type: 'SUSPICIOUS_ACTIVITY',
  event_data: { description: 'Unusual access pattern' }
});
```

## API Endpoints

### Recipe Generation
- **Endpoint**: `/functions/v1/generate-recipe`
- **Method**: POST
- **Authentication**: Required
- **Rate Limit**: 5 requests per minute
- **Validation**: Full input sanitization and validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow security guidelines
4. Add tests for new features
5. Submit a pull request

### Security Considerations for Contributors
- Never commit secrets or API keys
- Always validate user inputs
- Follow the principle of least privilege
- Log security-relevant events
- Use parameterized queries
- Implement proper error handling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For security issues, please contact the maintainers directly rather than opening public issues.

For general support, please open an issue on GitHub.

## Security Compliance

This application follows industry security standards and best practices:
- OWASP Top 10 protection
- Input validation and sanitization
- Authentication and authorization
- Security monitoring and logging
- Data encryption and protection
- Regular security audits

Last updated: January 2025
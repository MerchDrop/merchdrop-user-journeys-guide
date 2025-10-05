import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
  Img,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface UserConfirmationEmailProps {
  displayName: string;
  confirmationUrl: string;
}

export const UserConfirmationEmail = ({
  displayName,
  confirmationUrl,
}: UserConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your Merchdrop account and start shopping</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://fnipjjcqlpklyuaduwml.supabase.co/storage/v1/object/public/brand-assets/merchdrop-white-logo.png"
          alt="Merchdrop"
          width="150"
          style={logo}
        />
        <Heading style={h1}>Welcome to Merchdrop, {displayName}! 🛍️</Heading>
        
        <Text style={text}>
          Thank you for joining Merchdrop! We're excited to have you as part of our community.
        </Text>

        <Text style={text}>
          Please confirm your email address to complete your registration:
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Confirm Email Address
          </Button>
        </Section>

        <Text style={text}>
          Or copy and paste this link into your browser:
        </Text>
        <Text style={linkText}>{confirmationUrl}</Text>

        <Section style={infoBox}>
          <Heading style={h2}>What's Next?</Heading>
          <Text style={text}>
            Once you confirm your email, you can:<br /><br />
            ✓ Browse exclusive merchandise from top artists<br />
            ✓ Add items to your wishlist<br />
            ✓ Get notified about new drops and sales<br />
            ✓ Track your orders and delivery status
          </Text>
        </Section>

        <Text style={text}>
          Start exploring unique designs created by talented artists and designers!
        </Text>

        <Text style={footer}>
          Questions? Contact us at{' '}
          <Link href="mailto:support@merchdrop.live" style={link}>
            support@merchdrop.live
          </Link>
        </Text>

        <Text style={footer}>
          <strong>Merchdrop</strong> - Exclusive Artist Merchandise
        </Text>
      </Container>
    </Body>
  </Html>
);

export default UserConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 48px',
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 48px',
};

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#3B82F6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '0 48px',
};

const linkText = {
  color: '#3B82F6',
  fontSize: '14px',
  padding: '0 48px',
  wordBreak: 'break-all' as const,
};

const link = {
  color: '#3B82F6',
  textDecoration: 'underline',
};

const infoBox = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 48px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 48px',
  marginTop: '24px',
};

const logo = {
  margin: '40px auto 0',
  display: 'block',
};

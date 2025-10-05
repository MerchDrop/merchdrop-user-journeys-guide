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

interface DesignerConfirmationEmailProps {
  displayName: string;
  confirmationUrl: string;
}

export const DesignerConfirmationEmail = ({
  displayName,
  confirmationUrl,
}: DesignerConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your Merchdrop designer account and start creating</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://fnipjjcqlpklyuaduwml.supabase.co/storage/v1/object/public/brand-assets/merchdrop-white-logo.png"
          alt="Merchdrop"
          width="150"
          style={logo}
        />
        <Heading style={h1}>Welcome to Merchdrop, {displayName}! ✨</Heading>
        
        <Text style={text}>
          Thank you for joining Merchdrop as a designer! We're thrilled to have your creative talent on our platform.
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
          <Heading style={h2}>Next Steps:</Heading>
          <Text style={text}>
            1. <strong>Confirm your email</strong> (click the button above)<br />
            2. <strong>Complete your designer profile</strong> with your portfolio and bio<br />
            3. <strong>Wait for approval</strong> - Our team will review your application within 48 hours<br />
            4. <strong>Start uploading designs</strong> - Once approved, you can submit designs to artists
          </Text>
        </Section>

        <Text style={text}>
          While you wait for approval, you can start setting up your profile and familiarizing yourself with the platform.
        </Text>

        <Text style={footer}>
          Questions? Contact us at{' '}
          <Link href="mailto:support@merchdrop.live" style={link}>
            support@merchdrop.live
          </Link>
        </Text>

        <Text style={footer}>
          <strong>Merchdrop</strong> - Where Artists & Designers Create Together
        </Text>
      </Container>
    </Body>
  </Html>
);

export default DesignerConfirmationEmail;

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
  backgroundColor: '#10B981',
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
  color: '#10B981',
  fontSize: '14px',
  padding: '0 48px',
  wordBreak: 'break-all' as const,
};

const link = {
  color: '#10B981',
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

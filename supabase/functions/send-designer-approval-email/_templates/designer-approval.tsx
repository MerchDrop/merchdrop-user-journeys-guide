import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface DesignerApprovalEmailProps {
  displayName: string;
  dashboardUrl: string;
}

export const DesignerApprovalEmail = ({
  displayName,
  dashboardUrl,
}: DesignerApprovalEmailProps) => (
  <Html>
    <Head />
    <Preview>Congratulations! Your designer application has been approved</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Welcome to Merchdrop Designers!</Heading>
        <Text style={text}>
          Hi {displayName},
        </Text>
        <Text style={text}>
          Great news! Your designer application has been approved. You can now start uploading designs and collaborating with artists on the Merchdrop platform.
        </Text>
        <Text style={text}>
          As an approved designer, you can:
        </Text>
        <ul style={list}>
          <li>Upload original designs to our marketplace</li>
          <li>Collaborate with artists to create unique merchandise</li>
          <li>Earn revenue from your approved designs</li>
          <li>Track your performance and earnings through your dashboard</li>
        </ul>
        <Button
          href={dashboardUrl}
          style={button}
        >
          Access Your Designer Dashboard
        </Button>
        <Text style={text}>
          We're excited to see your creative work on Merchdrop!
        </Text>
        <Text style={text}>
          If you have any questions, feel free to reach out to our support team.
        </Text>
        <Text style={footer}>
          Best regards,
          <br />
          The Merchdrop Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export default DesignerApprovalEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 48px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
  margin: '16px 0',
}

const list = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '24px 48px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 48px',
  margin: '32px 0',
}

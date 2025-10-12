import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface DesignerRejectionEmailProps {
  displayName: string;
  reason?: string;
}

export const DesignerRejectionEmail = ({
  displayName,
  reason,
}: DesignerRejectionEmailProps) => (
  <Html>
    <Head />
    <Preview>Update on your designer application</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Designer Application Update</Heading>
        <Text style={text}>
          Hi {displayName},
        </Text>
        <Text style={text}>
          Thank you for your interest in becoming a designer on Merchdrop. After careful review, we're unable to approve your application at this time.
        </Text>
        {reason && (
          <>
            <Text style={text}>
              <strong>Reason:</strong>
            </Text>
            <Text style={reasonText}>
              {reason}
            </Text>
          </>
        )}
        <Text style={text}>
          We encourage you to review our designer guidelines and consider reapplying in the future. Our platform is always looking for talented designers.
        </Text>
        <Text style={text}>
          If you have any questions or would like feedback on your application, please don't hesitate to contact our support team.
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

export default DesignerRejectionEmail

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

const reasonText = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '16px 48px',
  margin: '8px 0',
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #dee2e6',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 48px',
  margin: '32px 0',
}

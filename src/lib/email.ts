import sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export interface TransactionEmailData {
  to: string
  userName: string
  transactionType: string
  amount: number
  accountNumber: string
  reference: string
  date: string
  balance?: number
}

/**
 * Send a generic email using SendGrid
 */
export async function sendEmail(data: EmailData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent.')
    return false
  }

  try {
    const msg = {
      to: data.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@obs.com',
        name: process.env.SENDGRID_FROM_NAME || 'Online Banking System'
      },
      subject: data.subject,
      text: data.text || data.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html: data.html,
    }

    await sgMail.send(msg)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

/**
 * Send transaction confirmation email
 */
export async function sendTransactionConfirmation(data: TransactionEmailData): Promise<boolean> {
  const subject = `Transaction Confirmation - ${data.transactionType}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transaction Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .transaction-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Online Banking System</h1>
          <h2>Transaction Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Dear ${data.userName},</p>
          
          <p>Your transaction has been successfully processed. Here are the details:</p>
          
          <div class="transaction-details">
            <h3>Transaction Details</h3>
            <p><strong>Type:</strong> ${data.transactionType}</p>
            <p><strong>Amount:</strong> <span class="amount">$${data.amount.toFixed(2)}</span></p>
            <p><strong>Account:</strong> ****${data.accountNumber.slice(-4)}</p>
            <p><strong>Reference:</strong> ${data.reference}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            ${data.balance !== undefined ? `<p><strong>Remaining Balance:</strong> $${data.balance.toFixed(2)}</p>` : ''}
          </div>
          
          <p>If you have any questions about this transaction, please contact our customer service.</p>
          
          <p>Thank you for using Online Banking System!</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 Online Banking System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject,
    html
  })
}

/**
 * Send transfer notification email
 */
export async function sendTransferNotification(data: TransactionEmailData & { 
  recipientAccount?: string 
  recipientName?: string 
}): Promise<boolean> {
  const subject = `Transfer Confirmation - $${data.amount.toFixed(2)}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transfer Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .transfer-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #dc2626; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Online Banking System</h1>
          <h2>Transfer Confirmation</h2>
        </div>
        
        <div class="content">
          <p>Dear ${data.userName},</p>
          
          <p>Your transfer has been successfully processed. Here are the details:</p>
          
          <div class="transfer-details">
            <h3>Transfer Details</h3>
            <p><strong>Amount:</strong> <span class="amount">$${data.amount.toFixed(2)}</span></p>
            <p><strong>From Account:</strong> ****${data.accountNumber.slice(-4)}</p>
            ${data.recipientAccount ? `<p><strong>To Account:</strong> ****${data.recipientAccount.slice(-4)}</p>` : ''}
            ${data.recipientName ? `<p><strong>Recipient:</strong> ${data.recipientName}</p>` : ''}
            <p><strong>Reference:</strong> ${data.reference}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            ${data.balance !== undefined ? `<p><strong>Remaining Balance:</strong> $${data.balance.toFixed(2)}</p>` : ''}
          </div>
          
          <p>Your transfer is being processed and should be available in the recipient account within 1-2 business days.</p>
          
          <p>Thank you for using Online Banking System!</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 Online Banking System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: data.to,
    subject,
    html
  })
}

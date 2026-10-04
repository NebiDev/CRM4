interface InvitationEmailInput {
    to: string;
    organizationName: string;
    inviterName: string;
    acceptUrl: string;
    role: string;
}

export function invitationEmail(input: InvitationEmailInput) {
    const { to, organizationName, inviterName, acceptUrl, role } = input;
    const subject = `${inviterName} invited you to ${organizationName} on NEXA`;

    const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 22px; margin: 0 0 16px;">You're invited to ${organizationName}</h1>
      <p style="color: #475569; line-height: 1.6;">
        ${inviterName} invited you to join <strong>${organizationName}</strong> on NEXA as a <strong>${role}</strong>.
      </p>
      <p style="margin: 28px 0;">
        <a href="${acceptUrl}"
           style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          Accept invitation
        </a>
      </p>
      <p style="color:#64748b;font-size:13px;">If you didn't expect this email, you can ignore it.</p>
    </div>
  `;

    const text = `${inviterName} invited you to join ${organizationName} as ${role}. Accept: ${acceptUrl}`;

    return { to, subject, html, text };
}

interface InvoiceSentEmailInput {
    to: string;
    clientName: string;
    organizationName: string;
    invoiceNumber: string;
    total: string;
    currency: string;
    dueDate: string | null;
    viewUrl: string;
}

export function invoiceSentEmail(input: InvoiceSentEmailInput) {
    const { to, clientName, organizationName, invoiceNumber, total, currency, dueDate, viewUrl } = input;
    const subject = `Invoice ${invoiceNumber} from ${organizationName}`;

    const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 22px; margin: 0 0 16px;">Invoice ${invoiceNumber}</h1>
      <p style="color:#475569;line-height:1.6;">Hi ${clientName},</p>
      <p style="color:#475569;line-height:1.6;">
        ${organizationName} has issued invoice <strong>${invoiceNumber}</strong> for
        <strong>${currency} ${total}</strong>${dueDate ? `, due on <strong>${dueDate}</strong>` : ""}.
      </p>
      <p style="margin: 28px 0;">
        <a href="${viewUrl}"
           style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          View invoice
        </a>
      </p>
      <p style="color:#64748b;font-size:13px;">Sent by ${organizationName} via NEXA.</p>
    </div>
  `;

    const text = `Invoice ${invoiceNumber} for ${currency} ${total}${dueDate ? ` due ${dueDate}` : ""}. View: ${viewUrl}`;

    return { to, subject, html, text };
}
interface EmailVariables {
  [key: string]: any;
}

export const generateEmailContent = async (
  templateKey: string,
  variables: EmailVariables
): Promise<{ subject: string; body: string } | null> => {
  console.log('Generating email content for template:', templateKey);
  console.log('Variables:', variables);

  const templates: Record<string, { subject: string; body: string }> = {
    LEAVE_APPLICATION_SUBMITTED: {
      subject: 'Leave Application Submitted',
      body: `
        <h2>Leave Application Submitted</h2>
        <p>A leave application has been submitted and is pending approval.</p>
        <p><strong>Employee:</strong> ${variables.employee_name || 'N/A'}</p>
        <p><strong>Leave Type:</strong> ${variables.leave_type || 'N/A'}</p>
        <p><strong>Duration:</strong> ${variables.start_date || 'N/A'} to ${variables.end_date || 'N/A'}</p>
        <p><strong>Reason:</strong> ${variables.reason || 'N/A'}</p>
      `,
    },
    LEAVE_APPLICATION_APPROVED: {
      subject: 'Leave Application Approved',
      body: `
        <h2>Leave Application Approved</h2>
        <p>Your leave application has been approved.</p>
        <p><strong>Leave Type:</strong> ${variables.leave_type || 'N/A'}</p>
        <p><strong>Duration:</strong> ${variables.start_date || 'N/A'} to ${variables.end_date || 'N/A'}</p>
        <p><strong>Approved By:</strong> ${variables.approved_by_name || 'N/A'}</p>
      `,
    },
    LEAVE_APPLICATION_REJECTED: {
      subject: 'Leave Application Rejected',
      body: `
        <h2>Leave Application Rejected</h2>
        <p>Your leave application has been rejected.</p>
        <p><strong>Leave Type:</strong> ${variables.leave_type || 'N/A'}</p>
        <p><strong>Duration:</strong> ${variables.start_date || 'N/A'} to ${variables.end_date || 'N/A'}</p>
        <p><strong>Rejection Reason:</strong> ${variables.rejection_reason || 'N/A'}</p>
      `,
    },
    PAYROLL_PROCESSED: {
      subject: 'Payroll Processed',
      body: `
        <h2>Payroll Processed</h2>
        <p>Your salary for ${variables.payroll_month || 'N/A'}/${variables.payroll_year || 'N/A'} has been processed.</p>
        <p><strong>Net Salary:</strong> ${variables.currency || '₹'}${variables.net_salary || '0'}</p>
        <p><strong>Status:</strong> ${variables.status || 'Processed'}</p>
        <p>Please check your salary slip for detailed breakdown.</p>
      `,
    },
    CANDIDATE_APPLICATION_RECEIVED: {
      subject: 'Application Received',
      body: `
        <h2>Application Received</h2>
        <p>Thank you for applying for the position.</p>
        <p><strong>Job Title:</strong> ${variables.job_title || 'N/A'}</p>
        <p><strong>Application Date:</strong> ${variables.application_date || 'N/A'}</p>
        <p>We will review your application and get back to you soon.</p>
      `,
    },
    WELCOME_EMAIL: {
      subject: 'Welcome to HRMS',
      body: `
        <h2>Welcome to HRMS</h2>
        <p>Dear ${variables.name || 'Employee'},</p>
        <p>Welcome to our Human Resource Management System!</p>
        <p><strong>Email:</strong> ${variables.email || 'N/A'}</p>
        <p><strong>Employee ID:</strong> ${variables.employee_id || 'N/A'}</p>
        <p>Please login to access your account and update your profile.</p>
      `,
    },
  };

  const template = templates[templateKey];
  
  if (!template) {
    console.error(`Template not found for key: ${templateKey}`);
    return null;
  }

  return template;
};

export default generateEmailContent;

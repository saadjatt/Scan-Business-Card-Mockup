import { ContactInfo, GeneratedEmail } from '../types';

// We cycle through these templates when "Regenerate" is clicked
const TEMPLATES = [
  {
    name: "Standard Professional",
    subject: (c: ContactInfo) => `Great meeting you - ${c.name}`,
    body: (c: ContactInfo, u: any) => `Hi ${c.name.split(' ')[0] || c.name},

It was a pleasure meeting you earlier. I enjoyed our brief conversation and would love to stay in touch regarding our discussion.

Please feel free to reach out if you'd like to connect further.

Best regards,

${u.name}
${u.role} | ${u.company}`
  },
  {
    name: "Casual Coffee",
    subject: (c: ContactInfo) => `Coffee? - ${c.name}`,
    body: (c: ContactInfo, u: any) => `Hey ${c.name.split(' ')[0] || c.name},

Great running into you! If you're around next week, I'd love to grab a coffee and continue our chat.

Let me know what works for you.

Cheers,

${u.name}`
  },
  {
    name: "Direct Business",
    subject: (c: ContactInfo) => `Follow up re: ${c.company}`,
    body: (c: ContactInfo, u: any) => `Dear ${c.name},

Following up on our introduction. I see potential synergy between ${c.company} and ${u.company}.

I would appreciate the opportunity to schedule a brief call to discuss this further.

Sincerely,

${u.name}
${u.role}`
  }
];

let templateIndex = 0;

export const generateFollowUpEmail = async (
  contact: ContactInfo, 
  userContext: { name: string, role: string, company: string }
): Promise<GeneratedEmail> => {
  
  // Use current template index
  const t = TEMPLATES[templateIndex % TEMPLATES.length];
  
  // Advance index for next time (simulating regeneration)
  templateIndex++;

  return {
    subject: t.subject(contact),
    body: t.body(contact, userContext)
  };
};

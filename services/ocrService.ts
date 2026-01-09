import { createWorker } from 'tesseract.js';
import { ContactInfo } from '../types';

export const extractContactFromImage = async (base64Image: string): Promise<ContactInfo> => {
  // Initialize Tesseract Worker
  const worker = await createWorker('eng');
  
  // Perform OCR
  const ret = await worker.recognize(base64Image);
  const text = ret.data.text;
  
  await worker.terminate();

  return parseContactFromText(text);
};

// Heuristic parsing logic to extract contact info from raw text
const parseContactFromText = (text: string): ContactInfo => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let email = '';
  let role = '';
  let company = '';
  let name = '';
  let phone = '';

  // 1. Email Extraction (Robust Regex)
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  
  // 2. Phone Extraction (International formats)
  // Matches: +1-555-555-5555, (555) 555-5555, 555 555 5555, etc.
  const phoneRegex = /(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/;

  for (const line of lines) {
    // Email
    if (!email) {
      const match = line.match(emailRegex);
      if (match) email = match[0];
    }
    
    // Phone
    if (!phone) {
      // Avoid matching years (2025) or short numbers
      const match = line.match(phoneRegex);
      if (match && match[0].length > 8) phone = match[0];
    }
  }

  // 3. Role Extraction (Keyword matching)
  const roleKeywords = [
    'CEO', 'CTO', 'CFO', 'COO', 'President', 'Founder', 'Director', 'Manager', 
    'Lead', 'Head', 'Engineer', 'Developer', 'Designer', 'Consultant', 
    'Representative', 'Specialist', 'Coordinator', 'Administrator', 'Partner'
  ];
  for (const line of lines) {
    if (roleKeywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))) {
      role = line;
      break;
    }
  }

  // 4. Company Extraction
  const companySuffixes = ['Inc', 'LLC', 'Ltd', 'Corp', 'Group', 'Holdings', 'Solutions', 'Systems', 'Agency', 'Enterprises'];
  for (const line of lines) {
    if (companySuffixes.some(s => line.includes(s))) {
      company = line;
      break;
    }
  }
  // Fallback: Infer company from email domain
  if (!company && email) {
    const domain = email.split('@')[1];
    const publicProviders = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];
    if (domain && !publicProviders.includes(domain)) {
      const namePart = domain.split('.')[0];
      company = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
  }

  // 5. Name Extraction
  if (email) {
    const localPart = email.split('@')[0];
    if (localPart.includes('.') || localPart.includes('_')) {
      name = localPart.split(/[._]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    } else {
      name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }
  }
  
  if (!name || name.length < 3) {
     for(const line of lines) {
       const words = line.split(/\s+/);
       const isNameCandidate = 
         words.length >= 2 && 
         words.length <= 3 && 
         !/\d/.test(line) && 
         !line.includes('@') && 
         !roleKeywords.some(r => line.includes(r)) &&
         words.every(w => /^[A-Z]/.test(w));
         
       if (isNameCandidate) {
         name = line;
         break;
       }
     }
  }

  return {
    name: name || '',
    email: email || '',
    role: role || '',
    company: company || '',
    phone: phone || '',
    rawData: text
  };
};
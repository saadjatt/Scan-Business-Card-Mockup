import { GoogleUser } from '../types';

// NOTE: In a real production app, you must create a Project in Google Cloud Console
// and generate a valid Client ID for your domain/origin.
// Since this is a demo environment, this placeholder will allow the code to compile,
// but the actual popup will error unless replaced with a valid ID.
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com'; 

export const initGoogleAuth = (
  callback: (user: GoogleUser) => void
): void => {
  // @ts-ignore
  if (typeof google === 'undefined') return;

  // @ts-ignore
  const client = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    callback: async (tokenResponse: any) => {
      if (tokenResponse && tokenResponse.access_token) {
        // Fetch user profile details
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        callback({
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          accessToken: tokenResponse.access_token
        });
      }
    },
  });

  // Trigger the popup
  client.requestAccessToken();
};

export const sendGmail = async (
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<boolean> => {
  
  // Construct MIME message
  const utf8Subject = `=?utf-8?B?${btoa(subject)}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    body,
  ];
  const message = messageParts.join("\n");

  // Encode to Base64Web (RFC 4648)
  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      }
    );

    if (response.ok) {
      return true;
    } else {
      console.error('Gmail API Error', await response.json());
      return false;
    }
  } catch (error) {
    console.error('Network Error', error);
    return false;
  }
};
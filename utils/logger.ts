/**
 * Logs a user action to the console for development and debugging purposes.
 * This helps in understanding user flow and interactions within the app.
 * @param action A string describing the user's action (e.g., 'View Changed').
 * @param details An optional object for additional context.
 */
export const logUserAction = (action: string, details?: object) => {
  const timestamp = new Date().toISOString();
  console.log(
    `%c[USER ACTION]%c ${timestamp} - %c${action}`,
    'color: #9333ea; font-weight: bold;', // purple
    'color: inherit;',
    'color: #2563eb; font-weight: bold;', // blue
    details || ''
  );
};

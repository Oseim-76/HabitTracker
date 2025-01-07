export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta ? meta : '');
  },
  error: (message: string, error: any) => {
    console.error(`[ERROR] ${message}:`, {
      message: error.message,
      stack: error.stack,
      ...(error.response && { response: error.response.data })
    });
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${message}`, meta ? meta : '');
    }
  }
}; 
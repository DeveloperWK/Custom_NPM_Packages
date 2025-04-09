function isOriginAllowedWithPort(
  requestOrigin: string,
  allowedOrigins: string[]
) {
  if (!requestOrigin) return false;

  try {
    const requestedUrl = new URL(requestOrigin);
    const requestedBase = `${requestedUrl.protocol}//${requestedUrl.host}`; // Includes port

    return allowedOrigins.some((allowedOrigin) => {
      const allowedUrl = new URL(allowedOrigin);
      return (
        requestedUrl.protocol === allowedUrl.protocol &&
        requestedUrl.hostname === allowedUrl.hostname &&
        requestedUrl.port === allowedUrl.port
      );
    });
  } catch (err) {
    return false;
  }
}
export default isOriginAllowedWithPort;

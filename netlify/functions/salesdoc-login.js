const jsonHeaders = {
  "Content-Type": "application/json",
};

export const handler = async () => ({
  statusCode: 404,
  headers: jsonHeaders,
  body: JSON.stringify({
    status: false,
    error: "Not Found",
  }),
});

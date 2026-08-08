export const handler = async (event: unknown) => {
  console.log("Scheduled callback payload:", JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Scheduled callback executed",
    }),
  };
};

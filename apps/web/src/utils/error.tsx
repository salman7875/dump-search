export const handleAPIError = (error: unknown): never => {
  if (error instanceof Error) {
    throw new Error(error.message);
  }

  if (typeof error === "string") {
    throw new Error(error);
  }

  throw new Error("Something went wrong!");
};

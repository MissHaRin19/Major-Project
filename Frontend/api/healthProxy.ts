export async function GET() {
  try {
    const response = await fetch(
      "https://pseudohumanistic-jamee-subbronchially.ngrok-free.dev/health",
      {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      }
    );

    const data = await response.json();

    return Response.json(data);

  } catch (error) {
    return Response.json(
      { status: "error", model_loaded: false },
      { status: 500 }
    );
  }
}

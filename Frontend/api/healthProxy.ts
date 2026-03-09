export async function GET() {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/health",
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

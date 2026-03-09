export async function checkBackendHealth(): Promise<boolean> {
  try {
    console.log("Checking backend health...");

    const response = await fetch(
      "https://pseudohumanistic-jamee-subbronchially.ngrok-free.dev/health",
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true"
        },
        mode: "cors",
        cache: "no-store"
      }
    );

    console.log("Health response status:", response.status);

    const text = await response.text();

    console.log("Health raw response:", text);

    const data = JSON.parse(text);

    console.log("Parsed health data:", data);

    return data.model_loaded === true;

  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.model_loaded === true;
  } catch {
    return false;
  }
}

export const imageSettings = {
  baseURL: "https://ai.gateway.lovable.dev",
  model: "openai/gpt-image-2.5-sunburst",
} as const;

export function generateOfferImage(apiKey: string, prompt: string, stream = true) {
  return fetch(`${imageSettings.baseURL}/v1/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: imageSettings.model,
      prompt,
      size: "1024x1024",
      quality: "low",
      ...(stream ? { stream: true, partial_images: 1 } : {}),
    }),
  });
}
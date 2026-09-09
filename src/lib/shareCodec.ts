/**
 * URL 공유용 인코딩. 한글이 들어가므로 btoa에 바로 넘기지 않고 UTF-8 바이트로 바꿔서 처리한다.
 * base64url로 만들어 URL 파라미터에 그대로 실을 수 있게 한다.
 */

export const encodeState = (value: unknown): string => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const decodeState = <T>(encoded: string): T | null => {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
};

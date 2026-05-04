import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function useWebAuthn() {
  const [isSupported] = useState(() => {
    return !!window.PublicKeyCredential && !!navigator.credentials;
  });
  const [registering, setRegistering] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  const register = async (userId: string, userName: string) => {
    if (!isSupported) {
      toast({ title: "Biometric not supported", description: "Your device does not support biometric authentication.", variant: "destructive" });
      return false;
    }

    setRegistering(true);
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "AtlastWave Travel", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: userName,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },   // ES256
            { alg: -257, type: "public-key" },  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred",
          },
          timeout: 60000,
          attestation: "none",
        },
      }) as PublicKeyCredential;

      if (!credential) return false;

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialData = {
        credentialId: bufferToBase64(credential.rawId),
        publicKey: bufferToBase64(response.getPublicKey?.() || new ArrayBuffer(0)),
        attestation: bufferToBase64(response.attestationObject),
      };

      // Store credential in localStorage (per-device)
      const stored = JSON.parse(localStorage.getItem("webauthn_credentials") || "{}");
      stored[userId] = credentialData;
      localStorage.setItem("webauthn_credentials", JSON.stringify(stored));

      toast({ title: "Biometric registered!", description: "You can now use fingerprint or face recognition to log in." });
      return true;
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        toast({ title: "Registration failed", description: err.message, variant: "destructive" });
      }
      return false;
    } finally {
      setRegistering(false);
    }
  };

  const authenticate = async (): Promise<string | null> => {
    if (!isSupported) return null;

    setAuthenticating(true);
    try {
      const stored = JSON.parse(localStorage.getItem("webauthn_credentials") || "{}");
      const userIds = Object.keys(stored);
      if (userIds.length === 0) return null;

      const allowCredentials = userIds.map(uid => ({
        id: base64ToBuffer(stored[uid].credentialId),
        type: "public-key" as const,
      }));

      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials,
          userVerification: "required",
          timeout: 60000,
          rpId: window.location.hostname,
        },
      }) as PublicKeyCredential;

      if (!assertion) return null;

      // Find which user this credential belongs to
      const assertionId = bufferToBase64(assertion.rawId);
      const matchedUserId = userIds.find(uid => stored[uid].credentialId === assertionId);

      return matchedUserId || null;
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        console.error("WebAuthn authentication error:", err);
      }
      return null;
    } finally {
      setAuthenticating(false);
    }
  };

  const hasRegisteredCredential = (userId: string): boolean => {
    const stored = JSON.parse(localStorage.getItem("webauthn_credentials") || "{}");
    return !!stored[userId];
  };

  const hasAnyCredential = (): boolean => {
    const stored = JSON.parse(localStorage.getItem("webauthn_credentials") || "{}");
    return Object.keys(stored).length > 0;
  };

  const removeCredential = (userId: string) => {
    const stored = JSON.parse(localStorage.getItem("webauthn_credentials") || "{}");
    delete stored[userId];
    localStorage.setItem("webauthn_credentials", JSON.stringify(stored));
  };

  return {
    isSupported,
    registering,
    authenticating,
    register,
    authenticate,
    hasRegisteredCredential,
    hasAnyCredential,
    removeCredential,
  };
}

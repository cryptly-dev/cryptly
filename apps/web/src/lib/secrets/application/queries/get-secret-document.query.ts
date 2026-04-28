import type { DecryptedSecretDocument } from '../../domain/decrypted-secret-document';

export async function getSecretDocumentQuery(projectId: string): Promise<DecryptedSecretDocument> {
  return {
    projectId,
    content: '',
    updatedAt: new Date().toISOString()
  };
}

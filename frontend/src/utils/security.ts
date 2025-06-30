// セキュリティ関連のユーティリティ関数

export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // HTMLタグを除去
  const withoutTags = text.replace(/<[^>]*>/g, '');
  
  // 危険な文字をエスケープ
  const escaped = withoutTags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return escaped.trim();
}

export function validateInput(text: string, maxLength: number = 1000): { isValid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'テキストが入力されていません' };
  }
  
  if (text.length > maxLength) {
    return { isValid: false, error: `テキストが長すぎます（${maxLength}文字以内）` };
  }
  
  // 危険なパターンのチェック
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, error: '禁止された内容が含まれています' };
    }
  }
  
  return { isValid: true };
}

export function isValidRoomName(name: string): boolean {
  return name.length > 0 && name.length <= 50 && !/<[^>]*>/.test(name);
}

export function isValidNickname(nickname: string): boolean {
  return nickname.length > 0 && nickname.length <= 32 && !/<[^>]*>/.test(nickname);
}

// レート制限のチェック（クライアントサイド）
export class ClientRateLimit {
  private static limits: Map<string, number[]> = new Map();
  
  static check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const times = this.limits.get(key) || [];
    
    // 時間窓外の記録を削除
    const validTimes = times.filter(time => now - time < windowMs);
    
    if (validTimes.length >= limit) {
      return false; // レート制限に引っかかった
    }
    
    // 新しい記録を追加
    validTimes.push(now);
    this.limits.set(key, validTimes);
    
    return true; // OK
  }
  
  static clear(key?: string): void {
    if (key) {
      this.limits.delete(key);
    } else {
      this.limits.clear();
    }
  }
}
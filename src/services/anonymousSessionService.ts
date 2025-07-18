import { AnonymousSession, SaveOptions, AccessAttempt } from '@/types';

class AnonymousSessionService {
  private static readonly LOCAL_STORAGE_KEY = 'bcp_anonymous_session';
  private static readonly SESSION_EXPIRY_DAYS = 30;

  // Check if we're on the client side
  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Generate a unique session ID
  private generateSessionId(): string {
    return 'bcp_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Generate a shareable link ID
  private generateShareableId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
  }

  // Get current session from localStorage
  getCurrentSession(): AnonymousSession | null {
    if (!this.isClient()) return null;

    try {
      const stored = localStorage.getItem(AnonymousSessionService.LOCAL_STORAGE_KEY);
      if (!stored) return null;

      const session: AnonymousSession = JSON.parse(stored);
      
      // Check if session is expired
      const now = new Date();
      const lastAccessed = new Date(session.lastAccessed);
      const daysDiff = (now.getTime() - lastAccessed.getTime()) / (1000 * 3600 * 24);
      
      if (daysDiff > AnonymousSessionService.SESSION_EXPIRY_DAYS) {
        this.clearSession();
        return null;
      }

      // Update last accessed - use saveSession directly to avoid circular dependency
      session.lastAccessed = now;
      this.saveSession(session);
      
      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  // Create new anonymous session
  createSession(): AnonymousSession {
    const session: AnonymousSession = {
      id: this.generateSessionId(),
      createdAt: new Date(),
      lastAccessed: new Date(),
      planData: {},
      isCloudSaved: false
    };

    this.saveSession(session);
    return session;
  }

  // Get or create session
  getOrCreateSession(): AnonymousSession {
    const existing = this.getCurrentSession();
    if (existing) return existing;
    return this.createSession();
  }

  // Save session to localStorage
  private saveSession(session: AnonymousSession): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(AnonymousSessionService.LOCAL_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  // Update existing session
  updateSession(session: Partial<AnonymousSession>): void {
    if (!this.isClient()) return;
    
    const current = this.getCurrentSession();
    if (!current) return;

    const updated = { ...current, ...session, lastAccessed: new Date() };
    this.saveSession(updated);
  }

  // Save plan data to current session
  savePlanData(planData: any): void {
    if (!this.isClient()) return;
    
    // Get or create session if none exists
    const session = this.getOrCreateSession();
    this.updateSession({ planData });
  }

  // Clear current session
  clearSession(): void {
    if (!this.isClient()) return;
    
    localStorage.removeItem(AnonymousSessionService.LOCAL_STORAGE_KEY);
  }

  // Save to cloud (would connect to your backend)
  async saveToCloud(options: SaveOptions): Promise<{ success: boolean; shareableLink?: string; error?: string }> {
    try {
      const session = this.getCurrentSession();
      if (!session) {
        return { success: false, error: 'No active session' };
      }

      // Validate PIN (6 digits)
      if (options.pin && !/^\d{6}$/.test(options.pin)) {
        return { success: false, error: 'PIN must be exactly 6 digits' };
      }

      const shareableId = this.generateShareableId();
      const shareableLink = `${window.location.origin}/shared/${shareableId}`;

      // Here you would make an API call to save to your backend
      const response = await fetch('/api/save-anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          businessName: options.businessName,
          pin: options.pin,
          email: options.email,
          planData: session.planData,
          shareableId,
          allowSharing: options.allowSharing
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save to cloud');
      }

      // Update local session
      this.updateSession({
        businessName: options.businessName,
        pin: options.pin,
        email: options.email,
        isCloudSaved: true,
        shareableLink: options.allowSharing ? shareableLink : undefined
      });

      return { success: true, shareableLink: options.allowSharing ? shareableLink : undefined };
    } catch (error) {
      console.error('Error saving to cloud:', error);
      return { success: false, error: 'Failed to save to cloud' };
    }
  }

  // Access saved plan with business name and PIN
  async accessSavedPlan(attempt: AccessAttempt): Promise<{ success: boolean; planData?: any; error?: string }> {
    try {
      const response = await fetch('/api/access-anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt)
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'No plan found with those credentials' };
        }
        if (response.status === 401) {
          return { success: false, error: 'Incorrect PIN' };
        }
        throw new Error('Failed to access plan');
      }

      const data = await response.json();
      
      // Create local session with cloud data
      const session: AnonymousSession = {
        id: this.generateSessionId(),
        businessName: attempt.businessName,
        pin: attempt.pin,
        createdAt: new Date(),
        lastAccessed: new Date(),
        planData: data.planData,
        isCloudSaved: true,
        shareableLink: data.shareableLink
      };

      this.saveSession(session);
      
      return { success: true, planData: data.planData };
    } catch (error) {
      console.error('Error accessing saved plan:', error);
      return { success: false, error: 'Failed to access plan' };
    }
  }

  // Generate QR code for current session (if cloud saved)
  generateQRCode(): string | null {
    const session = this.getCurrentSession();
    if (!session || !session.isCloudSaved || !session.businessName || !session.pin) {
      return null;
    }

    // This would generate a QR code containing the business name and PIN
    // For now, return a data URL that represents the access info
    const accessInfo = {
      businessName: session.businessName,
      pin: session.pin,
      url: window.location.origin
    };

    // You'd use a QR code library here - for now returning a placeholder
    return `data:text/plain;base64,${btoa(JSON.stringify(accessInfo))}`;
  }

  // Check if user has an active session
  hasActiveSession(): boolean {
    return this.getCurrentSession() !== null;
  }

  // Get session summary for UI
  getSessionSummary(): { hasSession: boolean; isCloudSaved: boolean; businessName?: string; canShare: boolean } {
    if (!this.isClient()) {
      return {
        hasSession: false,
        isCloudSaved: false,
        canShare: false
      };
    }

    const session = this.getCurrentSession();
    return {
      hasSession: !!session,
      isCloudSaved: session?.isCloudSaved || false,
      businessName: session?.businessName,
      canShare: !!(session?.shareableLink)
    };
  }
}

export const anonymousSessionService = new AnonymousSessionService(); 
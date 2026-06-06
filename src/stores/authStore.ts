import { useRBACStore } from '@/stores/rbacStore';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  loadUserPermissions: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user: User, token: string) => {
        console.log('AuthStore login called with token:', token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        // Load user permissions after login
        get().loadUserPermissions();
      },

      loadUserProfile: async () => {
        set({ isLoading: true });
        try {
          const userProfile = await import('@/services/authService').then(mod => mod.default.getProfile());
          set({ user: userProfile, isLoading: false, isAuthenticated: true });
          await get().loadUserPermissions();
        } catch (error) {
          console.error('Failed to load user profile:', error);
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Clear RBAC data
        const rbacStore = useRBACStore.getState();
        rbacStore.clearUserPermissions();
        // Clear any other stored data
        localStorage.removeItem('student-portal-auth');
      },

      loadUserPermissions: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const rbacStore = useRBACStore.getState();
          const isAdmin = user.role === 'admin';

          const mockUserPermissions = {
            userId: user._id,
            roles: isAdmin ? [
              {
                _id: 'admin_role',
                name: 'admin',
                description: 'Administrator role with full access',
                permissions: ['*'],
                isSystemRole: true,
                isActive: true,
                category: 'administrative' as const,
                level: 99,
                createdBy: 'system',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            ] : [
              {
                _id: 'student_role',
                name: 'Student',
                description: 'Standard student role',
                permissions: ['courses:read', 'grades:read', 'payments:read'],
                isSystemRole: true,
                isActive: true,
                category: 'academic' as const,
                level: 1,
                createdBy: 'system',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            ],
            permissions: isAdmin ? [
              { _id: 'admin:all', name: 'Full Access', resource: '*', action: '*' as const, description: 'Administrator full access', category: 'administrative' as const, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            ] : [
              { _id: 'courses:read', name: 'View Courses', resource: 'courses', action: 'read' as const, description: 'View course information', category: 'academic' as const, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { _id: 'grades:read', name: 'View Grades', resource: 'grades', action: 'read' as const, description: 'View grade information', category: 'academic' as const, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              { _id: 'payments:read', name: 'View Payments', resource: 'payments', action: 'read' as const, description: 'View payment information', category: 'financial' as const, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            ],
            effectivePermissions: isAdmin ? ['*'] : ['courses:read', 'grades:read', 'payments:read'],
            lastUpdated: new Date().toISOString(),
            cacheExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          };

          rbacStore.setUserPermissions(mockUserPermissions);
        } catch (error) {
          console.error('Failed to load user permissions:', error);
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        set({
          user: currentUser ? { ...currentUser, ...userData } : userData as User,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'student-portal-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLoading(false);
          state.loadUserPermissions();
        }
      },
    }
  )
);

import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/database';

export interface AuthResponse {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
}

const DEV_MODE = true;
const DEV_OTP = '1234';
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

// Test user configuration
const TEST_PHONE_NUMBER = '+919902093811';
const TEST_USER_EMAIL = 'test9902093811@wevysya.com';
const TEST_USER_PASSWORD = 'TestUser123!';

export const authService = {
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data?.user) {
        const { data: profile } = await supabase
          .from('users_profile')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile) {
          await this.ensureProfileExists(data.user.id, data.user.phone || '');
        }

        return {
          success: true,
        };
      }

      return {
        success: false,
        error: 'Failed to sign in',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to sign in',
      };
    }
  },

  async signInWithPhone(phoneNumber: string): Promise<AuthResponse> {
    try {
      if (DEV_MODE) {
        return {
          success: true,
          needsVerification: true,
        };
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        needsVerification: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send OTP',
      };
    }
  },

  async verifyOtp(phoneNumber: string, token: string): Promise<AuthResponse> {
    try {
      if (DEV_MODE) {
        if (token === DEV_OTP) {
          // Determine which account to use based on phone number
          let email: string;
          let password: string;

          if (phoneNumber === TEST_PHONE_NUMBER || phoneNumber === '9902093811' || phoneNumber === '+9902093811') {
            // Use dedicated test user account
            email = TEST_USER_EMAIL;
            password = TEST_USER_PASSWORD;
          } else {
            // Use generic dev account for all other numbers
            email = 'dev@wevysya.test';
            password = 'DevTest123!@#';
          }

          // Try to sign in first
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInError && signInData?.user) {
            await this.ensureProfileExists(signInData.user.id, phoneNumber);
            return { success: true };
          }

          // Handle email not confirmed error
          if (signInError?.message.includes('Email not confirmed') ||
              signInError?.message.includes('email not confirmed')) {
            return {
              success: false,
              error: 'Account setup incomplete. Please use the pre-configured test account: 9902093811 with OTP 1234, or disable email confirmation in Supabase Dashboard.',
            };
          }

          // Check if error is due to rate limiting
          if (signInError?.message.includes('rate limit') ||
              signInError?.message.includes('Rate limit') ||
              signInError?.message.toLowerCase().includes('too many requests')) {
            return {
              success: false,
              error: 'Too many login attempts. Please wait 5-10 minutes before trying again.',
            };
          }

          // Account doesn't exist, try to create it
          if (signInError?.message.includes('Invalid login credentials')) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { phone: phoneNumber },
                emailRedirectTo: undefined,
              },
            });

            if (!signUpError && signUpData?.user) {
              await this.ensureProfileExists(signUpData.user.id, phoneNumber);
              return { success: true };
            }

            // Handle rate limit errors more comprehensively
            if (signUpError?.message.includes('rate limit') ||
                signUpError?.message.includes('Rate limit') ||
                signUpError?.message.toLowerCase().includes('too many requests') ||
                signUpError?.status === 429) {
              return {
                success: false,
                error: 'Too many signup attempts. Please wait 5-10 minutes before trying again. For immediate access, use the test account: 9902093811 with OTP 1234.',
              };
            }

            // Handle email already registered
            if (signUpError?.message.includes('already registered') ||
                signUpError?.message.includes('User already registered')) {
              return {
                success: false,
                error: 'Account exists but credentials are incorrect. Please contact support or use test account: 9902093811 with OTP 1234.',
              };
            }

            return {
              success: false,
              error: signUpError?.message || 'Failed to create account. Please try the test account: 9902093811 with OTP 1234.',
            };
          }

          return {
            success: false,
            error: signInError?.message || 'Authentication failed. Use test account: 9902093811 with OTP 1234.',
          };
        } else {
          return {
            success: false,
            error: 'Invalid OTP. Use 1234 for testing.',
          };
        }
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms',
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data.user) {
        await this.ensureProfileExists(data.user.id, phoneNumber);
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to verify OTP',
      };
    }
  },

  async ensureProfileExists(userId: string, phoneNumber: string): Promise<void> {
    try {
      console.log('ensureProfileExists - userId:', userId, 'phone:', phoneNumber);

      const { data: existingProfile, error: selectError } = await supabase
        .from('users_profile')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      console.log('ensureProfileExists - existingProfile:', existingProfile, 'error:', selectError);

      if (!existingProfile) {
        console.log('ensureProfileExists - creating new profile');
        const { data: insertData, error: insertError } = await supabase.from('users_profile').insert({
          id: userId,
          full_name: '',
          phone_number: phoneNumber,
          vertical_type: 'open_circle',
        }).select();

        console.log('ensureProfileExists - insert result:', { insertData, insertError });

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          console.log('Profile created successfully:', insertData);
        }
      } else {
        console.log('Profile already exists');
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('getUserProfile - fetching profile for userId:', userId);
      
      // Fetch from users_profile table
      const { data: userProfileData, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      if (!userProfileData) {
        return null;
      }

      // Fetch from profiles table to get house_id, zone, business, and full_name
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('house_id, zone, business, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profilesError) {
        console.log('Note: profiles table query error (may not exist):', profilesError);
      }

      // If we have house_id, fetch house details from houses table
      let houseData = null;
      let houseZone = null;
      if (profilesData?.house_id) {
        const { data: house } = await supabase
          .from('houses')
          .select('id, name, state, zone')
          .eq('id', profilesData.house_id)
          .maybeSingle();
        
        if (house) {
          houseZone = house.zone;
          // Map houses table structure to match CoreHouse interface
          houseData = {
            id: house.id,
            house_name: house.name,
            city: house.zone || '',
            state: house.state || '',
            country: '',
            created_at: '',
          };
        }
      }

      console.log('getUserProfile - users_profile:', userProfileData);
      console.log('getUserProfile - profiles:', profilesData);
      console.log('getUserProfile - house:', houseData);

      // Merge the data - use full_name from profiles table if users_profile.full_name is empty
      const fullName = (userProfileData.full_name && userProfileData.full_name.trim()) 
        ? userProfileData.full_name 
        : (profilesData?.full_name || userProfileData.full_name);

      const mergedProfile: UserProfile = {
        ...userProfileData,
        full_name: fullName,
        house_id: profilesData?.house_id || null,
        zone: houseZone || profilesData?.zone || null,
        business: profilesData?.business || null,
        house: houseData || null,
      };

      return mergedProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async updateProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
  ): Promise<AuthResponse> {
    try {
      console.log('authService.updateProfile - userId:', userId);
      console.log('authService.updateProfile - updates:', updates);

      const { data, error } = await supabase
        .from('users_profile')
        .update(updates)
        .eq('id', userId)
        .select();

      console.log('authService.updateProfile - result:', { data, error });

      if (error) {
        console.error('authService.updateProfile - error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('authService.updateProfile - exception:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }
  },

  async getMembershipInfo(userId: string) {
    try {
      const [coreMembership, virtualMembership] = await Promise.all([
        supabase
          .from('core_memberships')
          .select('*')
          .eq('user_id', userId)
          .eq('membership_status', 'active')
          .maybeSingle(),
        supabase
          .from('virtual_memberships')
          .select('*')
          .eq('user_id', userId)
          .eq('membership_status', 'active')
          .maybeSingle(),
      ]);

      return {
        coreMembership: coreMembership.data,
        virtualMembership: virtualMembership.data,
      };
    } catch (error) {
      console.error('Error fetching membership info:', error);
      return {
        coreMembership: null,
        virtualMembership: null,
      };
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  onAuthStateChange(callback: (userId: string | null, user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user?.id || null, session?.user || null);
    });
  },
};

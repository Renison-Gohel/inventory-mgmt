import { supabase } from './supabase'

export async function createAdminUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'admin',
        },
      },
    })

    if (error) throw error

    // After successful signup, immediately update the user's role to admin
    if (data.user) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { user_type: 'admin' }
      })

      if (updateError) throw updateError
    }

    return data
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  }
}


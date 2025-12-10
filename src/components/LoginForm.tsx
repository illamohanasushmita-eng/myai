// import { signUp, signIn, getCurrentUser } from '@/lib/services/authService';

// const handleSignUp = async (email: string, password: string, name: string) => {
//   const { user, error } = await signUp(email, password, name);

//   if (error) {
//     console.error('Signup failed:', error);
//     return;
//   }

//   if (user) {
//     // User signed up successfully
//     // Store user ID from Supabase Auth
//     localStorage.setItem('userId', user.id);
//   }
// };

// const handleSignIn = async (email: string, password: string) => {
//   const { user, error } = await signIn(email, password);

//   if (error) {
//     console.error('Signin failed:', error);
//     return;
//   }

//   if (user) {
//     localStorage.setItem('userId', user.id);
//   }
// };

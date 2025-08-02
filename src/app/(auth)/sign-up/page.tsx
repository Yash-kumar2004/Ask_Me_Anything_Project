'use client'
import React, { useEffect, useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as  z  from "zod"
import Link from 'next/link'
import { useDebounceCallback } from 'usehooks-ts'
import { useRouter } from 'next/navigation'
import { signUpSchema } from '@/Schemas/signUpSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { toast } from "sonner"
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {Loader2} from 'lucide-react'




function SignUpForm() {
  // const [username,setUsername]=useState('')
  const [usernameMessage,setUsernameMessage]=useState('');
  const [isCheckingUsername,setIsCheckingUsername]=useState(false)
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [isClient, setIsClient] = useState(false);  // to resolve error 

    useEffect(() => {
      setIsClient(true);
    }, []);

  
  // const debounced=useDebounceCallback(setUsername,300);

  const router=useRouter()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const checkUsernameUnique = useDebounceCallback(async (value: string) => {
  if (!value) return;

  setIsCheckingUsername(true);
  setUsernameMessage('');
  try {
    const response = await axios.get(`/api/check-username-unique?username=${value}`);
    setUsernameMessage(response.data.message);
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    setUsernameMessage(
      axiosError.response?.data.message ?? "Error checking username"
    );
  } finally {
    setIsCheckingUsername(false);
  }
}, 300);

  // useEffect(()=>{ 
  //   const checkUserNameUnique=async ()=>{
  //     if(username){
  //     setIsCheckingUsername(true);
  //     setUsernameMessage('');
  //     try {
  //       const response=await axios.get(`/api/check-username-unique?username=${username}`)
  //       setUsernameMessage(response.data.message)
  //     } catch (error) {
  //       const axiosError=error as AxiosError<ApiResponse>
  //       setUsernameMessage(
  //         axiosError.response?.data.message ?? "Error checking userName"
  //       )
  //     }
  //     finally{
  //       setIsCheckingUsername(false)
  //     }
  //   }
  // }
  // },[username])


  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data);

      toast.success(response.data.message);


      router.replace(`/verify/${form.getValues("username")}`);


      setIsSubmitting(false);
    } catch (error) {
      console.error('Error during sign-up:', error);

      const axiosError = error as AxiosError<ApiResponse>;

      // Default error message
      let errorMessage = axiosError.response?.data.message;
      ('There was a problem with your sign-up. Please try again.');

      toast.error(errorMessage || 'There was a problem with your sign-up. Please try again.');


      setIsSubmitting(false);
    }
  };

  return (
    <div>
          <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Ask Me Anything !
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...field}
                    onChange={(e:any) => {
                      field.onChange(e);
                      checkUsernameUnique(e.target.value);
                    }}
                  />
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {isClient && !isCheckingUsername && usernameMessage && (
                    <p
                      
                      className={`text-sm ${
                        usernameMessage === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="email" />
                  <p className=' text-gray-400 text-sm'>We will send you a verification code</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className='w-full' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}

export default SignUpForm

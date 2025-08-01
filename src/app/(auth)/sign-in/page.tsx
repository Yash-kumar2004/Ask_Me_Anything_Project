import React, { useEffect, useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as  z  from "zod"
import Link from 'next/link'
import { useDebounceValue } from 'usehooks-ts'
import { useRouter } from 'next/router'
import { signInSchema } from '@/Schemas/signInSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
function page() {
  const [username,setUsername]=useState('')
  const [usernameMessage,setUsernameMessage]=useState('');
  const [isCheckingUsername,setIsCheckingUsername]=useState(false)
  const [isSubmitting,setIsSubmitting]=useState(false);
  const debouncedUsername=useDebounceValue(username,300);

  const router=useRouter()

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  useEffect(()=>{ 
    const checkUserNameUnique=async ()=>{
      setIsCheckingUsername(true);
      setUsernameMessage('');
      try {
        const response=await axios.get(`/api/check-username-unique?username=${debouncedUsername}`)
        setUsernameMessage(response.data.message)
      } catch (error) {
        const axiosError=error as AxiosError<ApiResponse>
        setUsernameMessage(
          axiosError.response?.data.message ?? "Error checking userName"
        )
      }
      finally{
        setIsCheckingUsername(false)
      }
    }
  },[debouncedUsername])

  return (
    <div>
      
    </div>
  )
}

export default page

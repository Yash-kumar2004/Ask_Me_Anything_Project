'use client';

import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/Schemas/messageSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";
const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString
    .split(specialChar)
    .map((msg) => msg.trim())
    .filter(Boolean);
};

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>(
    parseStringMessages(initialMessageString)
  );
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [currentTypingText, setCurrentTypingText] = useState('');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast.success(response.data.message);
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? 'Failed to send message'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setSuggestError(null);
    setDisplayedMessages([]);
    setCurrentTypingText('');

    try {
      const res = await fetch('/api/suggest-messages', {
        method: 'POST',
      });

      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });

        const parsed = parseStringMessages(fullText);
        const lastMessage = parsed[parsed.length - 1];

        setCurrentTypingText(lastMessage);
        setDisplayedMessages(parsed);
      }

      setCurrentTypingText('');
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      setSuggestError('Failed to fetch suggestions. Try again.');
    } finally {
      setIsSuggestLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={!messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isSuggestLoading}
          >
            {isSuggestLoading ? 'Loading...' : 'Suggest Messages'}
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {suggestError ? (
              <p className="text-red-500">{suggestError}</p>
            ) : displayedMessages.length > 0 ? (
              displayedMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2 text-wrap justify-start"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                  {index === displayedMessages.length - 1 &&
                  currentTypingText !== '' ? (
                    <span className="ml-1 animate-pulse">|</span>
                  ) : null}
                </Button>
              ))
            ) : (
              <p className="text-muted">No messages to show.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href="/sign-up">
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}



// 'use client';

// import React, { useState } from 'react';
// import axios, { AxiosError } from 'axios';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import { CardHeader, CardContent, Card } from '@/components/ui/card';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { Textarea } from '@/components/ui/textarea';

// import * as z from 'zod';
// import { ApiResponse } from '@/types/ApiResponse';
// import Link from 'next/link';
// import { useParams } from 'next/navigation';
// import { messageSchema } from '@/Schemas/messageSchema';
// import { toast } from 'sonner';

// const specialChar = '||';

// const parseStringMessages = (messageString: string): string[] => {
//   return messageString.split(specialChar).map((msg) => msg.trim()).filter(Boolean);
// };

// export default function SendMessage() {
//   const params = useParams<{ username: string }>();
//   const username = params.username;

//   const form = useForm<z.infer<typeof messageSchema>>({
//     resolver: zodResolver(messageSchema),
//   });

//   const messageContent = form.watch('content');

//   const [isLoading, setIsLoading] = useState(false);
//   const [isSuggestLoading, setIsSuggestLoading] = useState(false);
//   const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
//   const [suggestError, setSuggestError] = useState<string | null>(null);

//   const handleMessageClick = (message: string) => {
//     form.setValue('content', message);
//   };

//   const onSubmit = async (data: z.infer<typeof messageSchema>) => {
//     setIsLoading(true);
//     try {
//       const response = await axios.post<ApiResponse>('/api/send-message', {
//         ...data,
//         username,
//       });


//       toast.success(response.data.message);
//       form.reset({ ...form.getValues(), content: '' });
//     } catch (error) {
//       const axiosError = error as AxiosError<ApiResponse>;


//       toast.error(axiosError.response?.data.message ?? 'Failed to send message');

//     } finally {
//       setIsLoading(false);
//     }
//   };

 

//   const fetchSuggestedMessages = async () => {
//   setIsSuggestLoading(true);
//   setSuggestError(null);
//   setSuggestedMessages([]);

//   try {
//     const res = await fetch('/api/suggest-messages', {
//       method: 'POST',
//     });

//     if (!res.body) throw new Error('No response stream');

//     const reader = res.body.getReader();
//     const decoder = new TextDecoder('utf-8');
//     let fullText = '';

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       fullText += decoder.decode(value, { stream: true });
//       const parsed = parseStringMessages(fullText);
//       setSuggestedMessages(parsed);
//     }
//   } catch (error: any) {
//     console.error('Error fetching suggestions:', error);
//     setSuggestError('Failed to fetch suggestions. Try again.');
//   } finally {
//     setIsSuggestLoading(false);
//   }
// };


//   return (
//     <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
//       <h1 className="text-4xl font-bold mb-6 text-center">Public Profile Link</h1>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//           <FormField
//             control={form.control}
//             name="content"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Send Anonymous Message to @{username}</FormLabel>
//                 <FormControl>
//                   <Textarea
//                     placeholder="Write your anonymous message here"
//                     className="resize-none"
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <div className="flex justify-center">
//             {isLoading ? (
//               <Button disabled>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Please wait
//               </Button>
//             ) : (
//               <Button type="submit" disabled={!messageContent}>
//                 Send It
//               </Button>
//             )}
//           </div>
//         </form>
//       </Form>

//       <div className="space-y-4 my-8">
//         <div className="space-y-2">
//           <Button onClick={fetchSuggestedMessages} className="my-4" disabled={isSuggestLoading}>
//             {isSuggestLoading ? 'Loading...' : 'Suggest Messages'}
//           </Button>
//           <p>Click on any message below to select it.</p>
//         </div>
//         <Card>
//           <CardHeader>
//             <h3 className="text-xl font-semibold">Messages</h3>
//           </CardHeader>
//           <CardContent className="flex flex-col space-y-4">
//             {suggestError ? (
//               <p className="text-red-500">{suggestError}</p>
//             ) : (
//               suggestedMessages.map((message, index) => (
//                 <Button
//                   key={index}
//                   variant="outline"
//                   className="mb-2 text-wrap"
//                   onClick={() => handleMessageClick(message)}
//                 >
//                   {message}
//                 </Button>
//               ))
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <Separator className="my-6" />

//       <div className="text-center">
//         <div className="mb-4">Get Your Message Board</div>
//         <Link href="/sign-up">
//           <Button>Create Your Account</Button>
//         </Link>
//       </div>
//     </div>
//   );
// }

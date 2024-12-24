import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export default function LoginPage() {

    const router = useRouter();

    // input schema
    const formSchema = z.object({
        username: z.string().nonempty(""),
        password: z.string().nonempty(""),
    })
    // form principles
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    async function onSubmit(values) {

        const { username, password } = values;

        if (!username || !password) {
            alert('Please fill in all fields.');
            return;
        }
        try {
            await axios.post('/api/user/login', { username, password });

            // refresh page, by middleware redirects to /login
            router.reload();
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message || 'Invalid login credentials.');
            } else {
                console.error('Login error:', error);
                alert('An error occurred. Please try again.');
            }
        }

    }

    return (
        <div className="max-w-[500px] mx-auto p-4 md:pt-40">

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="..." {...field} />
                                </FormControl>
                                <FormDescription>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="..." {...field} />
                                </FormControl>
                                <FormDescription>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    );

}
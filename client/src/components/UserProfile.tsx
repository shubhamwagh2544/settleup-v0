import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import api from "@/apis/axios";
import { toast } from 'sonner';

const formSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
    lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    profilePic: z.string().optional(),
    defaultLang: z.string(),
    mfaEnabled: z.boolean().optional(),
    isPrivate: z.boolean().optional(),
});

type UserProfileFormValues = z.infer<typeof formSchema>;

export default function UserProfile() {
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);

    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

    const form = useForm<UserProfileFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            address: "",
            profilePic: "",
            defaultLang: "en",
            mfaEnabled: false,
            isPrivate: false,
        },
    });

    useEffect(() => {
        async function fetchUserData() {
            try {
                const { data: user } = await api.get(`/user/${userId}`);
                form.reset({
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    email: user.email,
                    phoneNumber: user.phoneNumber || "",
                    address: user.address || "",
                    profilePic: user.profilePic || "",
                    defaultLang: user.defaultLang || "en",
                    mfaEnabled: user.mfaEnabled || false,
                    isPrivate: user.isPrivate || false,
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to load user profile');
            } finally {
                setIsPageLoading(false);
            }
        }

        if (userId) {
            fetchUserData();
        }
    }, [userId, form]);

    async function onSubmit(data: UserProfileFormValues) {
        setIsLoading(true);
        try {
            const { data: updatedUser } = await api.put(`/user/${userId}`, data);
            console.log('Updated user:', updatedUser);
            form.reset(updatedUser);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    }

    if (isPageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="container max-w-2xl py-10">
                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={form.getValues("profilePic")} />
                                <AvatarFallback>
                                    {`${form.getValues("firstName")?.[0] || ""}${form.getValues("lastName")?.[0] || ""}`}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">Profile Settings</CardTitle>
                                <CardDescription>
                                    Update your personal information and preferences
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Name fields */}
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled
                                                    readOnly
                                                    className="bg-muted cursor-not-allowed opacity-70"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Email cannot be changed. Please contact support if you need to update your email.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Phone */}
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 234 567 8900" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Address */}
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter your address"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Language */}
                                <FormField
                                    control={form.control}
                                    name="defaultLang"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Default Language</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a language" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="es">Spanish</SelectItem>
                                                    <SelectItem value="fr">French</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Toggles */}
                                <div className="grid gap-5 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="mfaEnabled"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                                                    <FormDescription>
                                                        Enable two-factor authentication for enhanced security
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isPrivate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Private Profile</FormLabel>
                                                    <FormDescription>
                                                        Make your profile private to other users
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Submit */}
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Updating..." : "Update Profile"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
